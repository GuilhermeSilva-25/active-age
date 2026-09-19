import { Router } from "express";
import { login, cadastro } from "../controllers/AuthController";

const router = Router();

router.post("/login", login);
router.post("/cadastro", cadastro);

export default router;
