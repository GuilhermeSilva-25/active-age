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
* **Então** o sistema grava o registro no banco com status ativo E criptografa a senha com hash BCrypt E atribui a permissão `ROLE_PACIENTE` E exibe a mensagem de sucesso *"Cadastro realizado com sucesso! Você já pode fazer login."* E redireciona o usuário para a tela de Login.

---

### Cenário 2: Cadastro de Paciente com E-mail Inválido ou Duplicado
* **Dado que** o usuário tenta cadastrar um endereço de `<e-mail>`
* **Quando** confirma a submissão dos dados de acesso
* **Então** o sistema rejeita a operação e apresenta a `<mensagem>` correspondente

| Caso de Teste | E-mail Fornecido | Senha | Confirmação | Mensagem Esperada / Comportamento |
|---|---|---|---|---|
| TC-PAC-01 | `antonio.silva` | `Senha123` | `Senha123` | *"E-mail inválido."* |
| TC-PAC-02 | *(vazio)* | `Senha123` | `Senha123` | *"E-mail inválido."* |
| TC-PAC-03 | `antonio@email.com` *(já cadastrado)* | `Senha123` | `Senha123` | *"Este e-mail já está em uso."* |

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
* **Então** o sistema cadastra o médico no banco com o CRM e a UF informados E criptografa a senha com BCrypt E atribui a permissão `ROLE_MEDICO` E exibe a mensagem *"Cadastro de médico realizado com sucesso! Você já pode fazer login no seu consultório virtual."* E redireciona para a tela de Login.

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
* **Então** o sistema recusa o acesso E não emite cookie de sessão E exibe a mensagem de erro *"E-mail ou senha incorretos."*.

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

### Referências Bibliográficas

* **PRESSMAN, Roger S.; MAXIM, Bruce R.** *Engenharia de Software: Uma Abordagem Profissional*. 9. ed. Porto Alegre: McGraw-Hill Brasil, 2021.
* **SMART, John Ferguson.** *BDD in Action: Behavior-driven development for the whole software lifecycle*. New York: Manning Publications Co., 2015.
* **BRASIL.** *Lei nº 13.709, de 14 de agosto de 2018*. Lei Geral de Proteção de Dados Pessoais (LGPD).
* **CONSELHO FEDERAL DE MEDICINA (CFM).** *Resolução CFM nº 2.314/2022*. Define e regulamenta a telemedicina no Brasil.
