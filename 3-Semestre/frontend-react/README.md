# 🖥️ Frontend SPA Active Age (`frontend-react`)
## Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 3º e 4º Semestres

Aplicação Single Page Application (SPA) corporativa desenvolvida em **React 19 + TypeScript + Vite + Tailwind CSS v4**, projetada especificamente para proporcionar uma experiência acessível, acolhedora e segura para pessoas idosas, seus cuidadores familiares e médicos geriatras.

---

### 1. Pilares de Acessibilidade & IHC (WCAG 2.1 AA)

* **Design Tátil & Motor:** Botões de ação ampliados com altura mínima de 50px (`min-h-[50px]`), espaçamentos generosos e alvos de toque facilitados para mãos com tremor essencial ou artrite;
* **Zero Alertas Nativos:** Proibição absoluta de `window.alert()`, `confirm()` ou `prompt()`. Todo o feedback visual utiliza o componente acessível [`FeedbackModal.tsx`](./src/components/common/FeedbackModal.tsx);
* **Alto Contraste e Legibilidade:** Paleta cromática baseada em evidências de conforto visual (laranja acolhedor `#E06D3A`, azul calmo `#1B3B6F` e marrom escuro `#3D2E24`), com suporte a leitor de tela (ARIA);
* **Prevenção de Rolagem Fantasma:** Hook universal [`useBodyScrollLock.ts`](./src/hooks/useBodyScrollLock.ts) ativado em todos os modais da aplicação.

---

### 2. Módulos e Funcionalidades Principais

1. **Autenticação Segura & RBAC:**
   - Rotas protegidas por papéis (`ROLE_PACIENTE`, `ROLE_MEDICO`, `ROLE_ADMIN`) via [`ProtectedRoute.tsx`](./src/components/auth/ProtectedRoute.tsx);
   - Sessão via cookies seguros `HttpOnly; SameSite=Strict`.
2. **Cockpit de Teleconsulta & WebRTC Nativo:**
   - Videoconferência P2P em tempo real integrada com sinalização via WebSocket ([`useWebRTC.ts`](./src/hooks/useWebRTC.ts));
   - Card Único de prontuário clínico durante a chamada;
   - Sincronização em tempo real de prescrições e pedidos de exame emitidos pelo médico para o paciente.
3. **Prontuário Ético & Documentos Oficiais:**
   - Registro de anamnese, AGA, CID-11 e conduta com hash criptográfico SHA-256 imutável;
   - Emissão e impressão de receitas em Preto e Branco puro (P&B) timbrado com autenticação `AA-2026-XXXXXX`;
   - Validador público de documentos em `/validar-documento`.
4. **Ecossistema de Pagamentos & Faturamento SaaS:**
   - Checkout multi-método para consultas e plano mensal de consultório médico: Pix Instantâneo (QR Code dinâmico), Cartão de Crédito e Mercado Pago Checkout Pro;
   - Comprovante de teleconsulta e extrato financeiro contábil P&B timbrado.
5. **Dashboards Segregados:**
   - **Paciente:** Consultas agendadas no topo com acesso direto à sala, dicas de longevidade ativa da OMS/SBGG e cofre de exames;
   - **Médico:** Fila do dia com contadores reativos, cronômetro de assinatura SaaS e central de prontuários;
   - **Administrador:** Fila de auditoria de credenciamento médico (dossiê 4 pilares), moderação de usuários e métricas operacionais com sigilo LGPD.

---

### 3. Como Executar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Executar linter estático (oxlint)
npm run lint

# 3. Iniciar servidor de desenvolvimento (Vite)
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`. O Vite está configurado para fazer proxy reverso automático de chamadas `/api` para o backend local (`http://localhost:8080`).

---

### 4. Build de Produção e Containerização Docker

```bash
# Validação de tipagem TypeScript e minificação de produção
npm run build

# Construção da imagem Docker multi-stage (Nginx Alpine)
docker build -t active-age-frontend:local .

# Execução em container
docker run -p 3000:80 active-age-frontend:local
```

Acesse a aplicação conteinerizada em `http://localhost:3000`.

---
*Frontend SPA homologado para o 3º e 4º Semestres.*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
