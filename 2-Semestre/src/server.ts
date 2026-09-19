import express from "express";
import cors from "cors";
import "./config/database";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mensagem: "Servidor Active Age rodando!" });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
