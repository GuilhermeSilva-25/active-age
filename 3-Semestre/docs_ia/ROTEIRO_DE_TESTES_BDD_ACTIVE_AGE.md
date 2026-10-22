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

### Referências Bibliográficas

* **PRESSMAN, Roger S.; MAXIM, Bruce R.** *Engenharia de Software: Uma Abordagem Profissional*. 9. ed. Porto Alegre: McGraw-Hill Brasil, 2021.
* **SMART, John Ferguson.** *BDD in Action: Behavior-driven development for the whole software lifecycle*. New York: Manning Publications Co., 2015.
* **BRASIL.** *Lei nº 13.709, de 14 de agosto de 2018*. Lei Geral de Proteção de Dados Pessoais (LGPD).
* **CONSELHO FEDERAL DE MEDICINA (CFM).** *Resolução CFM nº 2.314/2022*. Define e regulamenta a telemedicina no Brasil.
