# Fatec – Faculdade de Tecnologia de Diadema
## Curso Superior de Tecnologia em Desenvolvimento de Software Multiplataforma
### Disciplina: Laboratório de Desenvolvimento Web / Engenharia de Software
**Projeto Integrador Interdisciplinar:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
**Documentação dos Cenários de Teste utilizando a Técnica BDD**

---

### Introdução e Metodologia

Este documento especifica os roteiros e casos de teste funcionais para o sistema **Active Age**, utilizando a técnica de **teste de caixa-preta** (PRESSMAN, 2021) e a definição de cenários em **BDD — Behavior-Driven Development** (SMART, 2015). 

Os cenários foram elaborados na sintaxe natural **Gherkin** (*Dado que... Quando... Então...*), focando estritamente na experiência do usuário, nas regras de negócio da telessaúde geriátrica e na conformidade com a LGPD e o Conselho Federal de Medicina (CFM).

---

## 1. Funcionalidade: Cadastro de Paciente / Cuidador (UC01)

### História de Usuário (User Story)
* **Como** um paciente idoso ou cuidador familiar
* **Eu quero** realizar meu cadastro na plataforma Active Age informando meus dados pessoais e de acesso
* **Para que** eu possa agendar teleconsultas geriátricas e manter meu histórico médico protegido e acessível

---

### Cenário 1: Cadastro de Paciente com Sucesso (Caminho Feliz)
* **Dado que** não existe um paciente cadastrado com o e-mail `"antonio.silva@email.com"`
* **Quando** o usuário preenche e submete as 3 etapas do formulário com as seguintes informações:
  * *E-mail:* `antonio.silva@email.com`
  * *Senha:* `SenhaForte123`
  * *Confirmação de Senha:* `SenhaForte123`
  * *Nome Completo:* `Antônio Carlos da Silva`
  * *CPF:* `123.456.789-00`
  * *Data de Nascimento:* `12/05/1955` (idade: 71 anos)
  * *Celular/WhatsApp:* `(11) 98765-4321`
  * *Aceite dos Termos de Uso e LGPD:* `Marcado (true)`
* **Então** o sistema grava o registro no banco com status ativo E criptografa a senha com hash BCrypt E atribui a permissão `ROLE_PACIENTE` E exibe o modal acessível `FeedbackModal` com título *"Cadastro Realizado com Sucesso!"* E ao clicar em *"Fazer Login Agora"* redireciona o usuário para a tela de Login.

---

### Cenário 2: Cadastro de Paciente com E-mail Inválido ou Duplicado
* **Dado que** o usuário tenta cadastrar um endereço de `<e-mail>`
* **Quando** clica no botão "Próximo" na Etapa 1
* **Então** o sistema rejeita a operação com a `<mensagem>` correspondente e bloqueia o avanço para a Etapa 2

| Caso de Teste | E-mail Fornecido | Senha | Confirmação | Mensagem Esperada / Comportamento |
|---|---|---|---|---|
| TC-PAC-01 | `antonio.silva` | `Senha123` | `Senha123` | *"E-mail inválido."* |
| TC-PAC-02 | *(vazio)* | `Senha123` | `Senha123` | *"E-mail inválido."* |
| TC-PAC-03 | `antonio@email.com` *(já cadastrado)* | `Senha123` | `Senha123` | *"Este e-mail já está em uso."* (bloqueia avanço para a Etapa 2) |

---

### Cenário 3: Cadastro de Paciente Menor de Idade (Regra de Negócio: 18+ anos)
* **Dado que** o paciente tenta informar uma `<data_nascimento>` correspondente a menor de idade
* **Quando** tenta avançar para a etapa seguinte do formulário
* **Então** o sistema bloqueia o avanço e exibe a mensagem *"O paciente deve ter 18 anos ou mais."*

| Caso de Teste | Nome | CPF | Data Nascimento | Idade Calculada | Celular | Mensagem Esperada |
|---|---|---|---|---|---|---|
| TC-PAC-04 | João Victor Souza | 222.333.444-55 | 15/08/2012 | 14 anos | (11) 97777-6666 | *"O paciente deve ter 18 anos ou mais."* |
| TC-PAC-05 | Mariana Costa Lima | 333.444.555-66 | 01/01/2010 | 16 anos | (11) 98888-5555 | *"O paciente deve ter 18 anos ou mais."* |

---

### Cenário 4: Cadastro sem Aceite da Política de Privacidade e LGPD
* **Dado que** o usuário preencheu todos os dados obrigatórios
* **Quando** deixa desmarcada a caixa de seleção de aceite dos Termos e da LGPD
* **Então** o botão de finalização bloqueia o envio e exibe a mensagem *"Você precisa aceitar os termos e a política da plataforma."*

| Caso de Teste | E-mail | Nome | CPF | Termos Aceitos | Mensagem Esperada |
|---|---|---|---|---|---|
| TC-PAC-06 | roberto@email.com | Roberto Dias Santos | 444.555.666-77 | `Desmarcado (false)` | *"Você precisa aceitar os termos e a política da plataforma."* |

---

### Cenário 5: Cadastro com Senhas Divergentes
* **Dado que** o usuário digita senhas que não coincidem
* **Quando** tenta avançar da Etapa 1 para a Etapa 2
* **Então** o sistema impede a transição e exibe a mensagem *"As senhas não coincidem."*

| Caso de Teste | E-mail | Senha | Confirmação | Mensagem Esperada |
|---|---|---|---|---|
| TC-PAC-07 | luiza@email.com | `Segredo123` | `Segredo999` | *"As senhas não coincidem."* |

---

### Cenário 6: Visualização e Ocultação de Senha (IHC / Acessibilidade)
* **Dado que** o usuário está na tela de Login ou na Etapa 1 do Cadastro (Paciente ou Médico)
* **Quando** digita sua senha e clica no ícone do "olho" (`Eye`)
* **Então** o texto da senha é revelado (`type="text"`) e o ícone alterna para o olho riscado (`EyeOff`)
* **E** ao clicar novamente, a senha volta a ficar oculta (`type="password"`)

| Caso de Teste | Campo Testado | Ação do Usuário | Comportamento Esperado |
|---|---|---|---|
| TC-PAC-08 | Senha | Clicar no botão do olho | Alterna entre visível e oculto instantaneamente |
| TC-PAC-09 | Confirme sua Senha | Clicar no botão do olho | Alterna de forma independente sem alterar o campo de senha principal |

---

## 2. Funcionalidade: Cadastro de Médico Especialista (UC01 / UC02)

### História de Usuário (User Story)
* **Como** um médico geriatra
* **Eu quero** me cadastrar na plataforma informando minhas credenciais profissionais (CRM e Estado emissor)
* **Para que** eu possa disponibilizar meus horários de consulta e atender pacientes no consultório virtual

---

### Cenário 1: Cadastro de Médico com Sucesso (Caminho Feliz)
* **Dado que** não existe um profissional cadastrado com o e-mail `"dra.ada@activeage.com"`
* **Quando** o médico preenche e submete as 3 etapas com as seguintes informações:
  * *E-mail:* `dra.ada@activeage.com`
  * *Senha:* `Medicina2026!`
  * *Confirmação de Senha:* `Medicina2026!`
  * *Nome Completo:* `Dra. Ada Augusta Lovelace`
  * *CPF:* `987.654.321-99`
  * *Celular/WhatsApp:* `(11) 91234-5678`
  * *CRM:* `181500`
  * *UF do CRM:* `SP`
  * *Aceite dos Termos de Responsabilidade Médica (CFM):* `Marcado (true)`
* **Então** o sistema cadastra o médico no banco com o CRM e a UF informados E criptografa a senha com BCrypt E atribui a permissão `ROLE_MEDICO` E exibe o modal acessível `FeedbackModal` com título *"Cadastro Realizado com Sucesso!"* E ao clicar em *"Fazer Login Agora"* redireciona para a tela de Login.

---

### Cenário 2: Cadastro de Médico com CRM ou UF Inválidos
* **Dado que** o médico informa um `<CRM>` ou `<UF>` com formatação incorreta
* **Quando** tenta avançar para a etapa seguinte
* **Então** o sistema rejeita o avanço e exibe a `<mensagem>` de validação

| Caso de Teste | Nome | CPF | CRM Informado | UF Informada | Mensagem Esperada |
|---|---|---|---|---|---|
| TC-MED-01 | Alan Mathison Turing | 111.222.333-44 | `12` *(menos de 4 dígitos)* | `SP` | *"CRM inválido."* |
| TC-MED-02 | Linus Benedict Torvalds | 555.666.777-88 | `199100` | `S` *(apenas 1 letra)* | *"Insira a UF."* |
| TC-MED-03 | Margaret Heafield Hamilton | 999.888.777-66 | *(vazio)* | `RJ` | *"CRM inválido."* |

---

## 3. Funcionalidade: Autenticação (Login) e Proteção contra Força Bruta

### História de Usuário (User Story)
* **Como** um paciente ou médico previamente cadastrado
* **Eu quero** autenticar minhas credenciais (e-mail e senha)
* **Para que** eu acerte o acesso exclusivo e seguro ao meu painel de saúde

---

### Cenário 1: Autenticação com Sucesso (Caminho Feliz)
* **Dado que** o usuário `"antonio.silva@email.com"` possui cadastro ativo com a senha `"SenhaForte123"`
* **Quando** submete suas credenciais válidas na tela de login
* **Então** o sistema valida o hash BCrypt no banco E gera o token JWT assinado E anexa o token em um cookie seguro (`HttpOnly`, `Secure`, `SameSite=Strict`) no cabeçalho `Set-Cookie` E redireciona o usuário para a página inicial E a barra de navegação passa a exibir a saudação *"Olá, Antônio (Paciente)"* e o botão *"Sair"*.

---

### Cenário 2: Tentativa de Login com Senha Incorreta
* **Dado que** o usuário informa um e-mail cadastrado mas uma senha que não corresponde ao hash
* **Quando** clica em *"Entrar na plataforma"*
* **Então** o sistema recusa o acesso E não emite cookie de sessão E exibe a mensagem de erro *"E-mail ou senha incorretos."* acompanhada pelo ícone visual de alerta (`AlertCircle`) E retorna status HTTP 400 Bad Request via `GlobalExceptionHandler`.

| Caso de Teste | E-mail Digitado | Senha Digitada | Status HTTP Esperado | Mensagem de Interface |
|---|---|---|---|---|
| TC-LOG-01 | `antonio.silva@email.com` | `SenhaErrada999` | 400 Bad Request | *"E-mail ou senha incorretos."* |
| TC-LOG-02 | `usuario_inexistente@email.com` | `QualquerSenha123` | 400 Bad Request | *"E-mail ou senha incorretos."* |

---

### Cenário 3: Proteção Ativa Contra Ataques de Força Bruta (Rate Limiting via Bucket4j)
* **Dado que** um agente malicioso tenta adivinhar a senha de uma conta legítima
* **Quando** o usuário erra a senha por **5 vezes consecutivas** no intervalo de 15 minutos
* **Então** na 6ª tentativa o sistema consome todas as fichas do Bucket E bloqueia imediatamente o IP/e-mail E rejeita a requisição exibindo a mensagem: *"Muitas tentativas fracassadas. Sua conta está travada, tente novamente em 15 minutos."*.

| Tentativa | Credencial Submetida | Status Retornado | Resposta do Sistema |
|---|---|---|---|
| 1ª a 5ª | E-mail legítimo + Senha Errada | HTTP 400 | *"E-mail ou senha incorretos."* (Consome 1 ficha/tentativa) |
| 6ª em diante | Qualquer senha para o mesmo e-mail | HTTP 400 | *"Muitas tentativas fracassadas. Sua conta está travada, tente novamente em 15 minutos."* |

---

## 4. Funcionalidade: Encerramento de Sessão (Logout Seguro)

### História de Usuário (User Story)
* **Como** um usuário autenticado na plataforma Active Age
* **Eu quero** encerrar minha sessão clicando no botão "Sair"
* **Para que** meu perfil e minhas informações de saúde fiquem totalmente protegidos em computadores públicos ou compartilhados

---

### Cenário 1: Logout com Sucesso (Caminho Feliz)
* **Dado que** o usuário está com a sessão ativa (cookie `accessToken` presente no navegador)
* **Quando** o usuário clica no botão *"Sair"* presente na barra de navegação
* **Então** o frontend dispara a requisição `POST /api/auth/logout` E o servidor Spring Boot emite um cabeçalho `Set-Cookie: accessToken=; Max-Age=0` invalidando o token no navegador E a barra de navegação atualiza seu estado instantaneamente, ocultando a saudação e voltando a exibir os botões *"Entrar"* e *"Criar Conta"*.

---

## 4. Funcionalidade: Controle de Acesso Baseado em Papéis (RBAC) & Painel Admin (Micro Tarefa 2.1)

### História de Usuário (User Story)
* **Como** um Administrador do sistema
* **Eu quero** acessar uma área restrita e protegida por permissão `ROLE_ADMIN`
* **Para que** eu possa gerenciar credenciais de médicos, moderar usuários e auditar logs com segurança

---

### Cenário 1: Acesso Não Autenticado a Rota Protegida (Caminho Triste)
* **Dado que** um usuário anônimo (sem cookie de sessão ativo) digita diretamente a URL `/admin`
* **Quando** o componente `ProtectedRoute` intercepta o acesso
* **Então** o sistema barra o carregamento do painel administrativo E redireciona o usuário imediatamente para a tela de Login (`/login`).

| Caso de Teste | URL Solicitada | Estado da Sessão | Comportamento Esperado |
|---|---|---|---|
| TC-ADM-01 | `/admin` | Não autenticado | Redirecionamento automático para `/login` |

---

### Cenário 2: Acesso com Perfil Sem Privilégio Administrativo (Caminho Triste)
* **Dado que** o usuário está autenticado com perfil `ROLE_PACIENTE` ou `ROLE_MEDICO`
* **Quando** tenta acessar a URL `/admin`
* **Então** o componente `ProtectedRoute` identifica a divergência de permissão E exibe a tela de *"Acesso Restrito"* com botão para retornar à página inicial, impedindo a visualização dos dados de gestão.

| Caso de Teste | Perfil Logado | Rota Alvo | Comportamento Esperado |
|---|---|---|---|
| TC-ADM-02 | `ROLE_PACIENTE` | `/admin` | Exibe tela de "Acesso Restrito" |
| TC-ADM-03 | `ROLE_MEDICO` | `/admin` | Exibe tela de "Acesso Restrito" |

---

### Cenário 3: Autenticação de Administrador e Acesso ao Painel (Caminho Feliz)
* **Dado que** o usuário possui as credenciais de administrador semeadas no banco:
  * *E-mail:* `admin@activeage.com`
  * *Senha:* `AdminPassword2026!`
* **Quando** realiza o login com sucesso e navega para `/admin`
* **Então** o `ProtectedRoute` autoriza o acesso E o layout administrativo (`AdminLayout`) é renderizado com a barra lateral de gestão, indicador de `ROLE_ADMIN` e os cards de métricas operacionais (`AdminDashboard`).

| Caso de Teste | E-mail | Senha | Perfil | Comportamento Esperado |
|---|---|---|---|---|
| TC-ADM-04 | `admin@activeage.com` | `AdminPassword2026!` | `ROLE_ADMIN` | Acesso concedido ao Painel Administrativo (`/admin`) |

---

## 5. Funcionalidade: Credenciamento Médico e Auditoria do Dossiê (UC03 / UC04 / RN007 / RN008)

### História de Usuário (User Story)
* **Como** um médico geriatra cadastrado
* **Eu quero** enviar os documentos comprobatórios do meu Dossiê de Credenciamento (Habilitação, Regularidade Ética, Telemedicina ICP-Brasil e Dados Financeiros)
* **Para que** a equipe de compliance da Active Age aprove meu perfil e libere meu consultório virtual conforme a Resolução CFM nº 2.314/2022

* **Como** um Administrador / Auditor de Conformidade
* **Eu quero** visualizar a fila de credenciamento, auditar os documentos em ambiente seguro e emitir parecer com justificativa
* **Para que** a plataforma garanta a idoneidade profissional dos prestadores e mantenha a trilha de auditoria inviolável

---

### Cenário 1: Envio Progressivo do Dossiê pelo Médico (Caminho Feliz)
* **Dado que** o médico `"dra.ada@activeage.com"` realizou o pré-cadastro com sucesso (status `PENDING_DOCS`)
* **Quando** acessa seu painel de credenciamento e realiza o upload dos seguintes documentos obrigatórios:
  * *CRM:* Arquivo PDF/JPG da Carteira de CRM frente e verso legíveis
  * *Diploma:* Arquivo PDF/JPG do Diploma de Medicina reconhecido pelo MEC
  * *Certidão Ética:* Arquivo PDF da Certidão emitida pelo CRM estadual
  * *Comprovante ICP-Brasil:* Arquivo PDF/PNG de certificado digital válido (A1 ou A3)
  * *Comprovante de Residência:* Arquivo PDF/PNG
  * *Dados Bancários:* Chave PIX e conta do titular para recebimento
* **Então** o sistema armazena os arquivos em repositório privado inacessível por URL pública E atualiza o status do dossiê para `UNDER_REVIEW` E exibe notificação com o modal acessível `FeedbackModal` informando que os documentos foram recebidos e estão em análise.

---

### Cenário 2: Tentativa de Envio de Documento com Formato Não Permitido ou Tamanho Excedido (Caminho Triste)
* **Dado que** o médico tenta anexar um arquivo executável (`.exe`) ou documento com tamanho superior a 10MB
* **Quando** submete o arquivo no formulário de credenciamento
* **Então** o sistema rejeita o arquivo no cliente e no servidor com HTTP 400 Bad Request E exibe a mensagem de validação: *"Formato não suportado. Envie arquivos PDF, JPG ou PNG de até 10MB."* E não atualiza o status do dossiê.

| Caso de Teste | Arquivo Testado | Tamanho | Extensão | Comportamento Esperado |
|---|---|---|---|---|
| TC-DOC-01 | `crm_foto.exe` | 1.2 MB | `.exe` | Rejeição imediata por tipo de mídia inválido |
| TC-DOC-02 | `diploma_pesado.pdf` | 14.5 MB | `.pdf` | Rejeição por tamanho superior ao limite de 10MB |
| TC-DOC-03 | `certidao_crm.pdf` | 850 KB | `.pdf` | Upload aceito com sucesso |

---

### Cenário 3: Médico com Dossiê Pendente ou em Análise Tenta Atender (Bloqueio de Regra RN008)
* **Dado que** o médico está com status `PENDING_DOCS` ou `UNDER_REVIEW`
* **Quando** tenta cadastrar horários livres na vitrine ou acessar a sala de teleconsulta
* **Então** o sistema bloqueia a ação E exibe aviso de pendência: *"Seu consultório virtual será liberado assim que o seu Dossiê de Credenciamento for homologado pela equipe de auditoria."*.

| Caso de Teste | Status do Médico | Ação Tentada | Resultado Esperado |
|---|---|---|---|
| TC-DOC-04 | `PENDING_DOCS` | Criar horário na vitrine | Bloqueio com aviso de documentação pendente |
| TC-DOC-05 | `UNDER_REVIEW` | Abrir sala de teleconsulta | Bloqueio com aviso de auditoria em andamento |

---

### Cenário 4: Visualização Segura de Documento pelo Administrador com Registro de Auditoria (Caminho Feliz / RN007)
* **Dado que** o auditor `admin@activeage.com` (`ROLE_ADMIN`) está logado no painel administrativo `/admin/credenciamento`
* **Quando** clica para visualizar a Carteira de CRM do médico pendente
* **Então** o backend verifica o perfil administrativo via RBAC E transmite o stream binário protegido E insere compulsoriamente um registro na coleção `audit_logs` contendo:
  * `auditor_id`: ID do admin logado
  * `target_user_id`: ID do médico titular
  * `action`: `"VIEW_DOCUMENT"`
  * `document_type`: `"CRM_CARD"`
  * `ip_address`: IP de origem da requisição
  * `timestamp`: Carimbo de data/hora oficial

| Caso de Teste | Perfil Solicitante | Documento Solicitado | Resposta HTTP | Log Gravado em `audit_logs` |
|---|---|---|---|---|
| TC-DOC-06 | `ROLE_ADMIN` | CRM do Médico | 200 OK (Stream seguro) | Sim (com IP e timestamp) |
| TC-DOC-07 | `ROLE_PACIENTE` | CRM do Médico | 403 Forbidden | Não (acesso bloqueado) |
| TC-DOC-08 | `ROLE_MEDICO` (outro médico) | CRM do Colega | 403 Forbidden | Não (acesso bloqueado) |

---

### Cenário 5: Reprovação de Credenciamento com Justificativa Obrigatória (Caminho Alternativo)
* **Dado que** o auditor identifica inconsistência no documento (exemplo: certidão vencida ou diploma sem verso legível)
* **Quando** seleciona a opção "Reprovar / Solicitar Correção" no painel administrativo E preenche a justificativa: *"A cópia do Diploma está sem o verso onde consta o registro do MEC. Por favor, reenvie o documento completo."*
* **Então** o sistema atualiza o status do médico para `DOCS_REJECTED` E salva a justificativa técnica E registra a ação em `audit_logs` E notifica o médico via painel para reenviar o documento apontado.

| Caso de Teste | Justificativa Preenchida | Comportamento Esperado |
|---|---|---|
| TC-DOC-09 | *(vazia ou com menos de 10 caracteres)* | Bloqueia a reprovação exigindo preenchimento de justificativa detalhada |
| TC-DOC-10 | Preenchida com texto válido | Grava status `DOCS_REJECTED`, persiste motivo e gera trilha de auditoria |

---

### Cenário 6: Homologação e Aprovação do Dossiê Médico (Caminho Feliz)
* **Dado que** todos os documentos dos 4 pilares obrigatórios foram validados pelo auditor
* **Quando** o administrador clica em "Homologar e Aprovar Credenciamento"
* **Então** o sistema altera o status do médico para `APPROVED` E ativa o período de 15 dias de teste grátis E grava a aprovação em `audit_logs` E libera o acesso do médico à Vitrine de Horários e ao Consultório Virtual.

---

## 4. Funcionalidade: Gestão de Usuários e Trilha de Auditoria Global (UC01, UC02, UC04, UC05)

### História de Usuário (User Story)
* **Como** um Administrador do Active Age
* **Eu quero** gerenciar as contas de usuários e inspecionar os registros de auditoria centralizados
* **Para que** eu possa moderar acessos indevidos e garantir conformidade regulatória estrita com o CFM (NGS1) e a LGPD (Art. 37)

---

### Cenário 1: Listagem e Filtro de Usuários pelo Administrador (Caminho Feliz)
* **Dado que** o administrador está autenticado com `ROLE_ADMIN` e acessa `/admin/usuarios`
* **Quando** aplica o filtro por perfil `"ROLE_MEDICO"` ou pesquisa por `"CRM 123456"`
* **Então** a tabela é atualizada dinamicamente exibindo apenas os profissionais correspondentes com suas informações cadastrais, status de credenciamento e situação da conta (`Ativo` ou `Inativo`).

---

### Cenário 2: Inativação de Usuário com Justificativa e Registro em `audit_logs` (Caminho Feliz)
* **Dado que** o administrador seleciona a opção "Inativar Conta" de um paciente ou médico
* **Quando** o modal de confirmação é exibido e o administrador insere a justificativa *"Suspeita de fraude cadastral"* e confirma
* **Então** o backend atualiza o campo `active = false` do usuário E insere compulsoriamente um registro em `audit_logs` com ação `"DEACTIVATE_USER"` E exibe mensagem de sucesso via `FeedbackModal`.

| Caso de Teste | Alvo da Ação | Justificativa | Status Resultante | Registro Gravado em `audit_logs` |
|---|---|---|---|---|
| TC-USR-01 | Médico em suspeita | "Fraude cadastral" | `active = false` | Sim (com IP, autor e justificativa) |
| TC-USR-02 | Paciente com solicitação | "Solicitação pelo titular" | `active = false` | Sim (com IP, autor e justificativa) |

---

### Cenário 3: Tentativa de Auto-Inativação do Administrador (Caminho Triste / Trava de Segurança)
* **Dado que** o administrador logado tenta inativar sua própria conta através do painel
* **Quando** confirma a ação de desativação
* **Então** o backend rejeita a operação com status HTTP 400 Bad Request e a mensagem: *"Não é permitido inativar a própria conta de administrador."* E o status da conta do administrador permanece ativo.

| Caso de Teste | ID Solicitante | ID Alvo | Resposta HTTP | Mensagem de Erro |
|---|---|---|---|---|
| TC-USR-03 | `admin_01` | `admin_01` (mesmo usuário) | 400 Bad Request | *"Não é permitido inativar a própria conta de administrador."* |

---

### Cenário 4: Consulta e Filtragem da Trilha de Auditoria Global (Caminho Feliz / NGS1 e LGPD)
* **Dado que** o auditor acessa a tela `/admin/auditoria`
* **Quando** visualiza o painel
* **Então** o sistema exibe os 4 cards de métricas (Total de Logs, Registros nas últimas 24h, Inspeções de Documentos e Decisões de Credenciamento) E lista os eventos cronologicamente do mais recente ao mais antigo com IP, operador, ação e modal de inspeção técnica.

---

### Cenário 5: Tentativa de Acesso a Endpoints de Auditoria por Usuários não Administradores (Caminho Triste / RBAC)
* **Dado que** um usuário logado como `ROLE_PACIENTE` ou `ROLE_MEDICO` tenta acessar `/api/admin/audit-logs` ou `/api/admin/users`
* **Quando** a requisição HTTP é enviada ao backend
* **Então** o Spring Security bloqueia a requisição retornando HTTP 403 Forbidden.

---

## 5. Funcionalidade: Dashboards Segregados e Redirecionamento Pós-Login (UC01, UC02, UC03, UC08, UC10)

### História de Usuário (User Story)
* **Como** um Paciente idoso, Cuidador ou Médico Geriatra
* **Eu quero** ser direcionado após o login para um ambiente específico às minhas necessidades
* **Para que** eu possa acessar minhas teleconsultas com máxima acessibilidade (Paciente) ou operar meu consultório virtual em conformidade com as exigências do CFM (Médico)

---

### Cenário 1: Redirecionamento Inteligente e Acessibilidade do Paciente (Caminho Feliz)
* **Dado que** o paciente `antonio.silva@email.com` (`ROLE_PACIENTE`) realiza login com sucesso
* **Quando** a autenticação é concluída
* **Então** o sistema redireciona automaticamente para `/paciente/dashboard` E renderiza botões táteis ampliados para o público idoso (WCAG 2.1 AA) E exibe atalhos para agendamento, consultas, cofre de saúde e suporte.

---

### Cenário 2: Redirecionamento de Médico com Dossiê Pendente e Exibição de Banner Regulatório (Caminho Feliz / CFM)
* **Dado que** o médico `carlos.med@email.com` (`ROLE_MEDICO`) possui o status de dossiê `PENDING_DOCS` ou `UNDER_REVIEW`
* **Quando** realiza o login na plataforma
* **Então** o sistema direciona para `/medico/credenciamento` ou para `/medico/dashboard` exibindo um banner proeminente de aviso da Resolução CFM nº 2.314/2022 E mantém bloqueadas as ferramentas clínicas de abertura de agenda e teleconsulta até a aprovação.

| Caso de Teste | Status do Dossiê | Ação Pós-Login | Comportamento do Consultório |
|---|---|---|---|
| TC-DSH-01 | `PENDING_DOCS` | Alerta de envio de documentos pendente | Ferramentas clínicas bloqueadas com botão para completar dossiê |
| TC-DSH-02 | `UNDER_REVIEW` | Alerta de análise em andamento pelo auditor | Consultório bloqueado aguardando homologação do CRM |
| TC-DSH-03 | `DOCS_REJECTED` | Alerta vermelho com justificativa técnica | Consultório bloqueado com botão para retificar documento |

---

### Cenário 3: Redirecionamento de Médico Homologado para o Consultório Virtual (Caminho Feliz)
* **Dado que** a médica `helena.med@email.com` (`ROLE_MEDICO`) possui o status de dossiê `APPROVED`
* **Quando** realiza o login com sucesso
* **Então** o sistema redireciona diretamente para `/medico/dashboard` E exibe o selo de homologação do CRM E apresenta as métricas de consultório, a degustação SaaS de 15 dias e os atalhos clínicos ativados.

---

### Cenário 4: Tentativa de Acesso a Painel Cruzado não Autorizado (Caminho Triste / RBAC)
* **Dado que** o paciente está autenticado com `ROLE_PACIENTE`
* **Quando** tenta digitar diretamente na barra do navegador a URL `/medico/dashboard` ou `/admin`
* **Então** o componente `ProtectedRoute.tsx` intercepta o acesso E impede a exibição da tela E redireciona o usuário para seu painel permitido ou para a página inicial.

| Caso de Teste | Perfil Autenticado | Rota Tentada | Resultado Esperado |
|---|---|---|---|
| TC-DSH-04 | `ROLE_PACIENTE` | `/admin` ou `/medico/dashboard` | Acesso bloqueado por RBAC com redirecionamento protetivo |
| TC-DSH-05 | `ROLE_MEDICO` | `/admin` | Acesso bloqueado por RBAC com redirecionamento protetivo |

---

## 6. Funcionalidade: Gestão de Perfil do Usuário & Identidade Visual (UC18 / RF014)

### História de Usuário (User Story)
* **Como** um Médico Especialista ou Paciente idoso / Cuidador
* **Eu quero** gerenciar meu perfil, atualizar minha foto (avatar), cadastrar endereço de entrega de receitas e dados de apoio familiar
* **Para que** as teleconsultas sejam humanizadas, seguras perante o CFM e preparadas para a emissão correta de documentos médicos

---

### Cenário 1: Atualização de Perfil Profissional do Médico com Sucesso (Caminho Feliz)
* **Dado que** o médico `ada.lovelace@activeage.com` (`ROLE_MEDICO`) está logado e acessa `/medico/perfil`
* **Quando** preenche o RQE `"RQE 1842"`, telefone `"(11) 98142-1852"`, define o valor de consulta em `R$ 380,00`, seleciona as áreas de foco e clica em *"Salvar Alterações do Perfil"*
* **Então** o backend persiste as informações no MongoDB com status 200 OK E exibe o modal acessível `FeedbackModal` com título *"Perfil Atualizado!"* E atualiza os dados em tempo real no dashboard.

---

### Cenário 2: Upload de Foto de Perfil (Avatar) com Validação de Extensão e Tamanho (Caminho Feliz & Triste)
* **Dado que** o usuário (Médico ou Paciente) clica no ícone de câmera para selecionar uma nova foto
* **Quando** envia um arquivo de imagem compatível (JPG, PNG ou WEBP) de até 5MB
* **Então** o servidor armazena o arquivo com nome sanitizado e UUID em diretório isolado E atualiza o campo `avatarUrl` do usuário E renderiza imediatamente a imagem circular na interface.

| Caso de Teste | Arquivo Testado | Tamanho | Formato | Resultado Esperado |
|---|---|---|---|---|
| TC-PRF-01 | `foto_rosto.jpg` | 1.8 MB | `.jpg` | Upload aceito e avatar atualizado |
| TC-PRF-02 | `avatar_profissional.png` | 2.4 MB | `.png` | Upload aceito e avatar atualizado |
| TC-PRF-03 | `foto_pesada.jpg` | 8.2 MB | `.jpg` | Rejeitado por exceder 5MB com FeedbackModal |
| TC-PRF-04 | `documento.pdf` | 600 KB | `.pdf` | Rejeitado por formato incompatível |

---

### Cenário 3: Atualização de Endereço Residencial e Cuidador pelo Paciente (Caminho Feliz / IHC)
* **Dado que** o paciente `antonio.silva@email.com` (`ROLE_PACIENTE`) acessa `/paciente/perfil`
* **Quando** preenche seu endereço residencial completo e marca a opção *"Possuo um cuidador"* preenchendo o nome do filho e WhatsApp de emergência
* **Então** o backend grava os subdocumentos `address` e `caregiver` no MongoDB E exibe mensagem de sucesso via `FeedbackModal` sem uso de `window.alert()`.

---

### Cenário 4: Blindagem contra Edição Arbitrária de Dados Regulatórios (Caminho Triste / Segurança)
* **Dado que** o usuário tenta forçar alteração de campos protegidos como `crm`, `cpf` ou `email` via payload arbitrário no endpoint `PUT /api/users/profile/doctor` ou `patient`
* **Quando** a requisição é processada
* **Então** o backend ignora solenemente alterações a esses atributos E preserva os dados originais validados na base.

---

## 7. Funcionalidade: Vitrine Neutra e Busca Inteligente de Médicos Geriatras (UC08 / RF005 / RN004)

### História de Usuário (User Story)
* **Como** um Paciente idoso ou Cuidador familiar
* **Eu quero** pesquisar médicos geriatras homologados por especialidade, estado, nome e honorários
* **Para que** eu possa escolher o profissional ideal com total transparência e segurança ética

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 7.1: Acesso e listagem inicial de médicos pioneiros homologados (Caminho Feliz)
* **Dado** que o paciente autenticado clica no card "Agendar Consulta Geriátrica" no Dashboard
* **Quando** a página de busca (`/paciente/busca-medicos`) é carregada
* **Então** o sistema realiza uma requisição `GET /api/doctors/search`
* **E** exibe os 5 médicos pioneiros cadastrados (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton e Tim Berners-Lee)
* **E** cada card apresenta foto oficial, nome completo, CRM/UF, RQE, resumo de apresentação, chips de especialidades, valor da teleconsulta e tempo estimado.

#### Cenário 7.2: Filtro por Área de Foco Clínico Geriátrico (Caminho Feliz)
* **Dado** que a vitrine de busca de especialistas está aberta
* **Quando** o usuário clica no chip de foco "Memória e Demências"
* **Então** a lista de médicos é filtrada dinamicamente
* **E** apenas médicos que possuam essa área em seu perfil clínico (ex: Dr. Alan Turing) permanecem visíveis
* **E** o contador de resultados atualiza para o total exato de correspondências.

#### Cenário 7.3: Filtro Geográfico por Estado do CRM (Caminho Feliz)
* **Dado** que a vitrine de especialistas está aberta
* **Quando** o usuário seleciona o Estado "RJ - Rio de Janeiro" no dropdown de UF
* **Então** o catálogo exibe exclusivamente médicos com CRM do Rio de Janeiro (Dra. Grace Hopper)
* **E** médicos de outros estados (SP, MG, RS) são ocultados.

#### Cenário 7.4: Ordenação Neutra e Objetiva por Menor Preço (Resolução CFM nº 2.336/2023)
* **Dado** que a vitrine exibe múltiplos profissionais
* **Quando** o usuário seleciona a ordenação "Menor Valor de Consulta"
* **Então** a listagem é reordenada de forma puramente objetiva
* **E** o primeiro médico posicionado no topo é o Dr. Tim Berners-Lee (R$ 200,00)
* **E** nenhum profissional é destacado mediante cobrança de taxa de publicidade.

#### Cenário 7.5: Médico Não Homologado ou Inativo Não Aparece na Vitrine (Regra de Negócio RN004 / Caminho Triste)
* **Dado** que um médico cadastrado possui status de dossiê "PENDING_DOCS" ou conta bloqueada (`active = false`)
* **Quando** qualquer pesquisa textual ou filtro for executado na rota pública
* **Então** o backend MongoDB filtra na origem (`findByRoleAndActiveAndDossierStatus`)
* **E** o profissional não homologado JAMAIS é retornado no JSON nem exibido para o paciente.

#### Cenário 7.6: Proteção e Sigilo de Dados Pessoais Sensíveis (LGPD)
* **Dado** que a requisição `GET /api/doctors/search` ou `GET /api/doctors/{id}` é inspecionada
* **Quando** os campos do payload JSON retornado são verificados
* **Então** o payload NÃO contém campos sensíveis como CPF, senha, dados bancários, comprovantes de residência ou telefone pessoal do médico.

---

## 8. Funcionalidade: Submissão e Gestão de Exames Prévios pelo Paciente (UC11 / RF008 / RN007)

### História de Usuário (User Story)
* **Como** um Paciente idoso ou Cuidador familiar
* **Eu quero** anexar laudos de exames laboratoriais e de imagem no meu Cofre de Saúde
* **Para que** fiquem guardados de forma segura e possam ser consultados pelo médico geriatra durante a teleconsulta

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 8.1: Upload de laudo em PDF com persistência no GridFS (Caminho Feliz)
* **Dado** que o paciente autenticado acessa o "Meu Cofre de Saúde" (`/paciente/exames`)
* **Quando** clica em "Enviar Novo Exame ou Laudo"
* **E** preenche o título "Hemograma e Bioquímica Completa", categoria "Laboratorial", data do exame "15/05/2026"
* **E** anexa um arquivo PDF de 1.8 MB e confirma o envio
* **Então** o backend processa o arquivo multipart e o persiste no MongoDB GridFS
* **E** o exame é salvo na coleção `patient_exams` vinculado ao `patientId`
* **E** um novo card informativo é exibido na lista com badge verde e dados formatados.

#### Cenário 8.2: Filtro por Categoria Clínica de Exame (Caminho Feliz)
* **Dado** que o paciente possui múltiplos exames de categorias diferentes cadastrados
* **Quando** clica no chip de filtro "Cardiológicos"
* **Então** o sistema realiza a requisição `GET /api/patient/exams?category=CARDIOLOGICO`
* **E** exibe apenas exames dessa categoria (ex: Eletrocardiograma, Ecocardiograma, Holter)
* **E** oculta exames laboratoriais e de imagem.

#### Cenário 8.3: Visualização do Laudo em Nova Aba Segura (Caminho Feliz)
* **Dado** que o paciente possui um laudo anexado
* **Quando** clica no botão "Visualizar Laudo"
* **Então** o navegador abre uma nova aba na rota `GET /api/patient/exams/{id}/download`
* **E** o arquivo PDF é transmitido via streaming do GridFS com cabeçalho `Content-Disposition: inline`
* **E** o laudo é renderizado diretamente no leitor de PDF do navegador.

#### Cenário 8.4: Tentativa de Envio com Data Futura (Caminho Triste)
* **Dado** que o paciente preenche o formulário de envio de exame
* **Quando** seleciona uma data posterior ao dia de hoje
* **Então** o sistema rejeita a submissão com HTTP 400 Bad Request
* **E** exibe a mensagem de alerta: "A data de realização do exame não pode ser uma data futura."

#### Cenário 8.5: Exclusão Segura de Exame pelo Paciente (Caminho Feliz)
* **Dado** que o paciente clica no ícone de lixeira em um exame existente
* **Quando** o modal de confirmação acessível é exibido e o paciente confirma a exclusão
* **Então** o sistema envia a requisição `DELETE /api/patient/exams/{id}`
* **E** o arquivo é permanentemente removido do MongoDB GridFS e da coleção `patient_exams`
* **E** o card é removido instantaneamente da tela com feedback de sucesso.

#### Cenário 8.6: Isolamento Estrito de Acesso entre Pacientes (LGPD Art. 11 / Segurança)
* **Dado** que o Paciente A tenta acessar o exame do Paciente B chamando `/api/patient/exams/{idDoPacienteB}/download`
* **Quando** o backend verifica o `patientId` do exame contra o usuário autenticado na sessão
* **Então** a requisição é bloqueada com HTTP 400 ou 403
* **E** nenhum byte do documento do outro paciente é transmitido.

---

## 9. Funcionalidade: Gestão de Agenda Médica & Grade de Horários (UC10 / RF006 / RF007 / RN001 / RN008)

### História de Usuário (User Story)
* **Como** um médico geriatra credenciado e homologado na plataforma Active Age
* **Eu quero** definir e gerenciar meus horários de consulta através de turnos semanais ou horários avulsos
* **Para que** eu organize meu consultório virtual com zelo e forneça disponibilidade para agendamento dos pacientes idosos

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 9.1: Geração de Grade de Atendimento em Lote por Turno (Caminho Feliz)
* **Dado** que o médico com status `APPROVED` acessa `/medico/agenda`
* **Quando** clica em "Disponibilizar Novos Horários" e preenche a geração em lote:
  * *Data:* `05/11/2026`
  * *Horário de Início:* `08:00`
  * *Horário de Término:* `12:00`
  * *Duração da Consulta:* `50 minutos` (padrão geriátrico)
  * *Pausa Técnica:* `10 minutos`
* **Então** o sistema calcula e persiste 4 slots na coleção `doctor_schedule_slots` com status `LIVRE`:
  * Slot 1: 08:00 às 08:50
  * Slot 2: 09:00 às 09:50
  * Slot 3: 10:00 às 10:50
  * Slot 4: 11:00 às 11:50
* **E** exibe feedback modal acessível confirmando a geração de 4 novos horários.

#### Cenário 9.2: Tentativa de Criação de Horário Duplicado ou Sobreposto (Caminho Triste)
* **Dado** que o médico já possui um slot cadastrado em `05/11/2026` às `14:00`
* **Quando** tenta cadastrar manualmente outro slot avulso com início em `05/11/2026` às `14:00`
* **Então** o backend rejeita a operação com status HTTP 400 Bad Request
* **E** exibe a mensagem de validação: *"Você já possui um horário disponibilizado neste mesmo dia e horário."*

#### Cenário 9.3: Bloqueio Temporário de Slot Livre (Caminho Feliz)
* **Dado** que o médico possui um horário com status `LIVRE`
* **Quando** clica na opção "Bloquear Horário"
* **Então** o status do slot é alterado no banco para `BLOQUEADO`
* **E** o horário deixa de ser retornado na rota pública de disponibilidade dos pacientes.

#### Cenário 9.4: Tentativa de Exclusão Direta de Slot com Consulta Agendada (Caminho Triste)
* **Dado** que um horário do médico possui status `OCUPADO` com consulta vinculada a um paciente
* **Quando** o médico clica para excluir o slot na lixeira da grade
* **Então** o sistema bloqueia a exclusão com HTTP 400 Bad Request
* **E** exibe o alerta: *"Horários com consultas agendadas não podem ser excluídos diretamente. Utilize a opção de cancelamento de consulta."*

#### Cenário 9.5: Bloqueio de Médico Não Homologado Tenta Abrir Agenda (RN008 / Segurança)
* **Dado** que o médico está com status de credenciamento `PENDING_DOCS` ou `UNDER_REVIEW`
* **Quando** tenta disparar uma requisição para `/api/doctor/schedule/batch` ou `/api/doctor/schedule/slot`
* **Então** o Spring Security / Service rejeita a operação com HTTP 403 Forbidden
* **E** informa que o consultório virtual requer homologação do CFM para ser ativado.

---

## 10. Funcionalidade: Agendamento Concorrente de Teleconsulta pelo Paciente (UC09 / RF006 / RF007 / RN001 / RN002)

### História de Usuário (User Story)
* **Como** um paciente idoso ou cuidador cadastrado
* **Eu quero** escolher um horário livre na vitrine do médico especialista e confirmar meu agendamento
* **Para que** eu garanta minha teleconsulta geriátrica com atenção individualizada e sem risco de duplicidade de reserva

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 10.1: Agendamento com Sucesso em Slot Livre (Caminho Feliz / RN001)
* **Dado** que o médico "Dr. Alan Turing" possui um slot "LIVRE" em `06/11/2026` às `10:00`
* **E** o paciente "Antônio Carlos da Silva" está autenticado com `ROLE_PACIENTE`
* **Quando** o paciente submete o agendamento informando a queixa principal "Ajuste de medicamentos para pressão"
* **Então** o sistema cria o registro na coleção `appointments` com status `AGENDADA`
* **E** atualiza atomicamente o slot do médico para `OCUPADO` associado ao ID do paciente
* **E** exibe feedback modal acessível confirmando a consulta com os dados do profissional.

#### Cenário 10.2: Tentativa Concorrente de Agendar em Slot Já Ocupado (Caminho Triste / Double-Booking)
* **Dado** que outro paciente reservou o mesmo slot uma fração de segundo antes
* **Quando** o paciente tenta confirmar o agendamento do mesmo slot
* **Então** o backend rejeita a operação com status HTTP 400 Bad Request
* **E** exibe a mensagem de validação: *"Este horário não está mais disponível para agendamento. Por favor, escolha outro horário."*
* **E** nenhum agendamento duplicado é gravado.

#### Cenário 10.3: Cancelamento de Consulta com Mais de 24h de Antecedência e Devolução do Slot (Caminho Feliz / RN002)
* **Dado** que o paciente possui uma consulta agendada para daqui a 3 dias (mais de 24 horas no futuro)
* **Quando** clica em "Cancelar Consulta" e confirma no modal acessível
* **Então** o status do agendamento é alterado para `CANCELADA_PELO_PACIENTE`
* **E** o slot correspondente em `doctor_schedule_slots` é devolvido para o status `LIVRE`
* **E** o horário volta a aparecer na vitrine para que outros pacientes possam agendar.

#### Cenário 10.4: Tentativa de Cancelamento de Consulta com Menos de 24h de Antecedência (Caminho Triste / RN002)
* **Dado** que a consulta do paciente está agendada para daqui a 4 horas (menos de 24 horas)
* **Quando** o paciente tenta cancelar a consulta pelo portal
* **Então** o sistema bloqueia a ação informando que consultas com menos de 24 horas de antecedência não podem ser canceladas pela plataforma
* **E** o agendamento permanece ativo.

---

## 11. Funcionalidade: Governança Administrativa, Trilha de Auditoria e Sincronização de Grade Médica (SPEC-11B / SPEC-11C)

### História de Usuário (User Story)
* **Como** um administrador do sistema (`ROLE_ADMIN`)
* **Eu quero** monitorar a volumetria de teleconsultas da plataforma e inspecionar a trilha de auditoria indelével de agendamentos e cancelamentos
* **Para que** a plataforma mantenha conformidade regulatória rigorosa com as normas do CFM e SBIS (NGS1), sem violar o sigilo médico de saúde (LGPD Art. 11)

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 11.1: Registro Indelével de Agendamento na Trilha de Auditoria (CFM & SBIS NGS1)
* **Dado** que o paciente idoso confirma uma consulta na plataforma
* **Quando** o agendamento é salvo com sucesso
* **Então** o sistema cria imediatamente um registro na coleção `audit_logs` com a ação `APPOINTMENT_CREATED` contendo data, hora, médico e paciente
* **E** o log aparece com tag estilizada na listagem do painel de auditoria do administrador (`/admin/auditoria`).

#### Cenário 11.2: Registro Indelével de Cancelamento Ético
* **Dado** que o paciente cancela uma consulta com mais de 24 horas de antecedência
* **Quando** a operação de cancelamento é concluída com sucesso
* **Então** o sistema gera um registro de auditoria com a ação `APPOINTMENT_CANCELLED` comprovando a desocupação do horário e liberação na agenda médica.

#### Cenário 11.3: Visualização Segura de Indicadores no Dashboard do Administrador (LGPD Art. 11)
* **Dado** que o administrador autenticado acessa o `/admin/dashboard`
* **Quando** a página consulta o endpoint seguro `GET /api/admin/stats`
* **Então** exibe os contadores agregados de consultas agendadas, médicos homologados e horários livres disponíveis
* **E** não exibe nenhuma informação clínica confidencial (sintomas, diagnósticos ou prontuário).

#### Cenário 11.4: Automação Contínua da Grade e Teleconsultas do Dia Atual (SPEC-11B)
* **Dado** que a rotina agendada Spring `@Scheduled` executa de hora em hora
* **Quando** verifica a disponibilidade do médico padrão (`medico@teste.com`)
* **Então** assegura horários livres para o dia de hoje e o dia de amanhã
* **E** assegura uma consulta ativa confirmada (`AppointmentStatus.AGENDADA`) no dia de hoje com a paciente de teste (`paciente@teste.com`)
* **E** disponibiliza 2 exames prévios no cofre GridFS da paciente para teste no cockpit clínico
* **E** higieniza horários livres que ficaram no passado sem tocar em consultas já confirmadas.

---

## 12. Funcionalidade: Cockpit Integrado de Teleconsulta, Prontuário Ético Imutável, Exames e Prescrições Digitais (SPEC-12)

### História de Usuário (User Story)
* **Como** um médico geriatra credenciado e homologado perante o CFM
* **Eu quero** realizar atendimentos virtuais por meio de uma sala de teleconsulta com cockpit clínico integrado (visualização de exames, prontuário com avaliação geriátrica ampla e emissão de receitas com código seguro)
* **Para que** eu possa prestar assistência remota com alto rigor ético-médico, segurança jurídica e comodidade para a pessoa idosa e seu cuidador familiar

---

### Critérios de Aceite em Formato BDD (Gherkin)

#### Cenário 12.1: Entrada Bilateral na Sala Virtual de Teleconsulta (UC12-Demo)
* **Dado** que o médico e o paciente possuem uma consulta confirmada para o dia atual
* **Quando** o médico clica em "Abrir Sala Virtual" no dashboard ou o paciente clica em "Entrar na Sala Virtual"
* **Então** ambos são direcionados para `/teleconsulta/:appointmentId`
* **E** o cockpit de atendimento exibe os controles de chamada (microfone, câmera, timer e encerramento)
* **E** se o usuário estiver em um computador, exibe layout dividido (vídeo à esquerda e painel clínico à direita)
* **E** se o usuário estiver em um celular/smartphone, adapta a tela verticalmente permitindo alternar entre vídeo e ferramentas.

#### Cenário 12.2: Consulta Médica aos Exames do Paciente no Cofre Digital (UC13)
* **Dado** que o médico está dentro da chamada virtual com Dona Maria de Lourdes
* **Quando** clica na aba "Exames do Paciente"
* **Então** visualiza os laudos anexados no MongoDB GridFS (Hemograma Completo e Eletrocardiograma de Repouso)
* **E** pode abrir ou baixar os documentos diretamente dentro da consulta sem perder o contato visual com a paciente.

#### Cenário 12.3: Preenchimento e Trava de Imutabilidade do Prontuário Geriátrico (UC14 / RN003)
* **Dado** que o médico preenche a Anamnese, a Avaliação Geriátrica Ampla (cognição, mobilidade, nutrição, suporte familiar), o CID-11 e a Conduta
* **Quando** clica em "Finalizar e Assinar Prontuário"
* **Então** o sistema gera um Hash criptográfico SHA-256 do prontuário
* **E** trava os campos contra qualquer edição posterior, registrando a data/hora e o CRM do signatário em conformidade com o CFM e SBIS NGS2.

#### Cenário 12.4: Emissão de Receita Médica com Código Seguro ICP-Brasil (UC15 / RN006)
* **Dado** que o médico está na aba "Prescrições e Atestados"
* **Quando** preenche a receita médica (medicamentos, posologia e orientações) e clica em "Emitir Documento Oficial"
* **Então** o sistema gera um código alfanumérico seguro único no formato `AA-2026-XXXXXX`
* **E** disponibiliza o modal de visualização e impressão timbrada com layout oficial, dados do médico e QR Code de autenticação.

#### Cenário 12.5: Validação Pública de Autenticidade do Documento Médico (UC16)
* **Dado** que um farmacêutico ou paciente acessa `/validar-documento`
* **Quando** informa o código de verificação `AA-2026-XXXXXX`
* **Então** o sistema valida os dados diretamente no banco e exibe o status de autenticidade, nome do médico, CRM, data de emissão e medicamentos prescritos, garantindo conformidade perante o CFM.

---

## 13. Catálogo de Credenciais Oficiais para Testes Imediatos

| Perfil | E-mail / Usuário | Senha | Funcionalidades Habilitadas para Teste |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@activeage.com` | `AdminPassword2026!` | Painel Geral, Fila de Credenciamento Médico, Gestão de Usuários, Moderação, Trilha de Auditoria CFM/SBIS e Métricas Operacionais |
| **Médico de Teste** | `medico@teste.com` | `123456` | Dashboard Médico, Dossiê Homologado, Gestão de Grade, Consultas do Dia, Cockpit de Teleconsulta, Prontuário e Emissão de Receitas |
| **Paciente de Teste** | `paciente@teste.com` | `123456` | Dashboard Paciente, Próxima Consulta Hoje, Sala Virtual, Cofre de Exames Prévios e Impressão de Documentos Emitidos |
| **Médicos Pioneiros** | `ada.lovelace@activeage.com`<br>`alan.turing@activeage.com`<br>*(17 especialistas)* | `ActiveAge2026!` | Vitrine de Médicos, Busca Avançada com Filtros por Foco Geriátrico e Estado, e Agendamento Concorrente com Reserva Atômica |

---

### Referências Bibliográficas

* **PRESSMAN, Roger S.; MAXIM, Bruce R.** *Engenharia de Software: Uma Abordagem Profissional*. 9. ed. Porto Alegre: McGraw-Hill Brasil, 2021.
* **SMART, John Ferguson.** *BDD in Action: Behavior-driven development for the whole software lifecycle*. New York: Manning Publications Co., 2015.
* **BRASIL.** *Lei nº 13.709, de 14 de agosto de 2018*. Lei Geral de Proteção de Dados Pessoais (LGPD).
* **CONSELHO FEDERAL DE MEDICINA (CFM).** *Resolução CFM nº 2.314/2022*. Define e regulamenta a telemedicina no Brasil.
