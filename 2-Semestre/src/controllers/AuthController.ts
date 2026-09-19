import { Request, Response } from "express";
import pool from "../config/database";
import { Paciente } from "../models/Paciente";
import { Medico } from "../models/Medico";

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, senha } = req.body;

    const [rows]: any = await pool.query(
      "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
      [email, senha],
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "E-mail ou senha inválidos" });
    }

    const usuarioDb = rows[0];
    let usuarioObj;

    if (usuarioDb.tipo_usuario === "PACIENTE") {
      usuarioObj = new Paciente(
        usuarioDb.nome,
        usuarioDb.email,
        new Date(),
        usuarioDb.id,
      );
    } else if (usuarioDb.tipo_usuario === "MEDICO") {
      usuarioObj = new Medico(
        usuarioDb.nome,
        usuarioDb.email,
        "CRM-GERAL",
        "Geriatria",
        usuarioDb.id,
      );
    } else {
      return res.status(400).json({ erro: "Tipo de usuário desconhecido" });
    }

    const rotaDashboard = usuarioObj.getDashboardRoute();

    return res.json({
      sucesso: true,
      usuario: {
        id: usuarioObj.getId(),
        nome: usuarioObj.getNome(),
        tipo: usuarioObj.getTipoUsuario(),
      },
      redirectUrl: rotaDashboard,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
};
