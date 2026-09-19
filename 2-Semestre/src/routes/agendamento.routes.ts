import { Router } from "express";
import { AgendamentoController } from "../controllers/AgendamentoController";

const router = Router();

router.get("/", AgendamentoController.listar);
router.post("/", AgendamentoController.agendar);
router.put("/:id/cancelar", AgendamentoController.cancelar);

export default router;
