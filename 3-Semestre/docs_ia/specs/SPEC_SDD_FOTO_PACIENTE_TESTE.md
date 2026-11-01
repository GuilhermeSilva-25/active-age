# SPEC-11F: Foto de Perfil da Paciente Teste no Semeador e Automação
## Metodologia: Spec-Driven Development (SDD)
### Projeto: Active Age — Telessaúde Geriátrica Integral (DSM / Fatec Diadema)

---

## 1. Contexto & Motivação
A conta da **Paciente Teste** (`paciente@teste.com` — Dona Maria de Lourdes Silva) é amplamente utilizada para demonstrações clínicas, agendamentos e validação da sala virtual de teleconsulta.

Anteriormente, o semeador não definia uma URL de avatar (`avatarUrl`), fazendo com que o `DashboardPaciente`, o `PerfilPaciente` e a `Navbar` exibissem um ícone genérico de usuário em vez de um retrato humanizado.

---

## 2. Objetivos
1. Definir uma foto de perfil humanizada de alta qualidade representando Dona Maria de Lourdes Silva.
2. Garantir que o método `ensureTestPatient()` no `DoctorScheduleAutomationService`:
   - Atribua a foto no momento da criação da conta.
   - Atualize a foto caso a paciente já exista no banco de dados e esteja sem avatar configurado.
3. Validar a persistência da foto com testes unitários.

---

## 3. Especificação Técnica

### 3.1. Imagem Padrão
* **URL:** `https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80`
* **Descrição:** Retrato de uma senhora idosa simpática e acolhedora com óculos, alinhada à proposta de valor do Active Age.

### 3.2. Implementação no Serviço (`DoctorScheduleAutomationService.java`)
* Constante:
  ```java
  public static final String TEST_PATIENT_AVATAR_URL = "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400&auto=format&fit=crop&q=80";
  ```
* Lógica no `ensureTestPatient()`:
  - Busca por e-mail `TEST_PATIENT_EMAIL`.
  - Se presente: verifica se `avatarUrl` é nulo ou vazio; se for, define `TEST_PATIENT_AVATAR_URL` e salva via `userRepository.save(patient)`.
  - Se ausente: cria o `User` preenchendo `avatarUrl = TEST_PATIENT_AVATAR_URL`.

---

## 4. Critérios de Aceite
- [x] Paciente de teste criada recebe a foto de perfil.
- [x] Paciente de teste já existente no banco de dados tem sua foto atualizada caso esteja sem avatar.
- [x] Testes unitários do `DoctorScheduleAutomationServiceTest` homologados com 100% de sucesso.
