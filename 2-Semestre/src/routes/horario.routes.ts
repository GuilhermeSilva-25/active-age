import { Router } from "express";
import { HorarioController } from "../controllers/HorarioController";

const router = Router();

router.get("/livres", HorarioController.listarLivres);
router.post("/", HorarioController.criar);
router.delete("/:id", HorarioController.excluir);

export default router;
