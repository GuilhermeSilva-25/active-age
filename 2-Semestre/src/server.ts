import express from "express";
import cors from "cors";
import "./config/database";
import authRoutes from "./routes/auth.routes";
import agendamentoRoutes from "./routes/agendamento.routes";
import horarioRoutes from "./routes/horario.routes";

/**
 * Ponto de entrada do backend do Active Age.
 * Inicializa o servidor Express, configura middlewares e rotas principais.
 */
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta "public" (Frontend da aplicação)
app.use(express.static("public"));

// Configuração dos agrupadores de rotas
app.use("/api/auth", authRoutes);
app.use("/api/agendamentos", agendamentoRoutes);
app.use("/api/horarios", horarioRoutes);

/**
 * Rota de monitoramento e status.
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mensagem: "Servidor Active Age rodando!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
