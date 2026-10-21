# 💻 GUIA DE DESENVOLVIMENTO MULTIMÁQUINAS & ONBOARDING

> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Finalidade:** Permitir que o Tech Lead (Guilherme) e o Agente Antigravity trabalhem de forma perfeitamente integrada e sem perda de contexto em **3 máquinas diferentes** (ex: Desktop de casa, Notebook pessoal e Computador do laboratório/trabalho).

---

## 1. Como o Antigravity se Comporta em Múltiplas Máquinas

Ao trocar de computador, o histórico da conversa da máquina anterior **não** é transferido via Git (o histórico de chat fica no armazenamento local de cada máquina).

Para que o Antigravity em qualquer computador entenda imediatamente todo o projeto, regras e onde paramos:
1. **O arquivo `GEMINI.md` na raiz do repositório:** O Antigravity carrega este arquivo de forma automática e silenciosa a cada nova sessão ou ao abrir qualquer arquivo do workspace.
2. **A pasta `3-Semestre/docs_ia/`:** Contém toda a memória técnica, planos de release, roteiro de testes e contexto operacional.

### Prompt de Inicialização Rápida (Copie e Cole na Nova Máquina)
Ao abrir o projeto no Antigravity em uma máquina nova (ou iniciar uma nova conversa), basta enviar este prompt inicial:

> *"Olá! Estou iniciando o desenvolvimento nesta máquina. Por favor, leia o `GEMINI.md` e o `3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md`, verifique o estado atual do repositório e me diga exatamente onde paramos e qual é o próximo passo a ser executado."*

Com essa instrução simples, o Antigravity:
- Identificará que a **Release v0.1.0** está em produção no Render e Vercel.
- Identificará que a próxima tarefa é a **Sprint 2 (Micro Tarefa 1.2)**.
- Seguirá rigorosamente a governança de SDD (nenhum código sem Spec prévia aprovada por você).

---

## 2. Pré-requisitos de Software em Cada Computador

Para rodar e testar o projeto localmente em qualquer uma das suas 3 máquinas, certifique-se de ter instalado:

| Ferramenta | Versão Mínima | Como Verificar no Terminal | Observação |
| :--- | :--- | :--- | :--- |
| **Git** | 2.40+ | `git --version` | Configurar seu usuário e token/chave do GitHub |
| **Node.js** | 20 LTS ou 22 LTS | `node -v` e `npm -v` | Necessário para o `frontend-react` (Vite) |
| **Java JDK** | 21 LTS | `java -version` | Eclipse Temurin ou Oracle OpenJDK 21 |
| **Apache Maven** | 3.9+ | `mvn -v` | Gerenciador de dependências e build do Spring Boot |
| **Google Antigravity** | Versão atual | App instalado | IDE/Extensão com login ativo |

---

## 3. Passo a Passo de Configuração Inicial (Nova Máquina)

### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/GuilhermeSilva-25/active-age.git
cd active-age
```

---

### Passo 2: Configurar e Rodar o Frontend (React + Vite)
O frontend não exige configurações pesadas.
```bash
cd 3-Semestre/frontend-react
npm install
npm run dev
```
- A aplicação subirá em `http://localhost:5173`.
- No desenvolvimento local, o arquivo `vite.config.ts` já possui um proxy interno configurado: todas as chamadas para `/api/*` são automaticamente repassadas para `http://localhost:8080`.

---

### Passo 3: Configurar e Rodar o Backend (Spring Boot 3)
O backend necessita da variável de ambiente com a string de conexão do MongoDB Atlas.

#### Opção A — Executar via PowerShell (Windows):
```powershell
cd 3-Semestre/backend-core
$env:MONGO_URI="mongodb+srv://<USUARIO>:<SENHA>@cluster0.xxxxx.mongodb.net/activeage?retryWrites=true&w=majority"
mvn clean spring-boot:run
```

#### Opção B — Executar com parâmetro inline no Maven:
```bash
cd 3-Semestre/backend-core
mvn clean spring-boot:run -Dspring-boot.run.arguments="--spring.data.mongodb.uri=mongodb+srv://<USUARIO>:<SENHA>@cluster0.xxxxx.mongodb.net/activeage?retryWrites=true&w=majority"
```

#### Opção C — Usando seu IDE (VS Code / IntelliJ):
Configure no *Run Configuration* do Spring Boot:
- Environment Variable: `MONGO_URI = mongodb+srv://...`

O backend subirá em `http://localhost:8080`.  
Acesse o Swagger local para testar: `http://localhost:8080/swagger-ui/index.html`.

---

## 4. Rotina Diária de Sincronização (O "Git Flow" para 3 Máquinas)

Para evitar conflitos de merge ou esquecer arquivos na máquina de casa ao ir para o trabalho/faculdade, siga este fluxo simples:

### Início da Sessão (Em qualquer máquina):
Sempre atualize o repositório local antes de encostar em qualquer código:
```bash
git status          # Verifica se não há nada pendente não commitado
git pull origin main # Baixa todas as atualizações feitas na outra máquina
```

### Fim da Sessão (Antes de fechar o computador):
Nunca deixe código não commitado ao encerrar o dia de trabalho:
```bash
git status
git add .
git commit -m "tipo(escopo): descrição clara do que foi feito"
git push origin main
```

> **Atenção aos Padrões de Commit:**  
> Lembre-se que o projeto adota **Conventional Commits em português**:  
> `feat(auth): ...`, `fix(auth): ...`, `docs(sdd): ...`, `test(bdd): ...`.

---

## 5. Como Resolver Caso Esqueça de Dar Push em Outra Máquina

Se você trabalhou na Máquina A, esqueceu de dar `git push`, e foi para a Máquina B:
1. **Se você só precisa testar o que já está na nuvem:**  
   Não se preocupe! O Backend está em produção no Render (`https://active-age-backend-mgyw.onrender.com`) e o Frontend está na Vercel. Você pode testar pelo navegador normalmente.
2. **Se você for codificar na Máquina B:**  
   - Crie uma branch temporária se necessário (`git checkout -b temp-trabalho`), ou foque em tarefas de documentação/testes na máquina B até conseguir fazer o push da máquina A.
   - Assim que tiver acesso à Máquina A: execute o `git push origin main`.
   - Na Máquina B: execute o `git pull origin main`.

---

## 6. Links Oficiais dos Ambientes

- **Repositório GitHub:** `https://github.com/GuilhermeSilva-25/active-age`
- **Backend Produção (Render):** `https://active-age-backend-mgyw.onrender.com`
- **Swagger Oficial (Produção):** `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
- **Painel MongoDB Atlas:** `https://cloud.mongodb.com/`
- **Dashboard Render:** `https://dashboard.render.com/`
- **Dashboard Vercel:** `https://vercel.com/`
