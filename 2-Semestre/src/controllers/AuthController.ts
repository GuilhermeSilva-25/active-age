import { Request, Response } from "express";
import pool from "../config/database";
import { Paciente } from "../models/Paciente";
import { Medico } from "../models/Medico";

/**
 * Autentica um usuário no sistema e retorna seus dados com a URL de redirecionamento.
 *
 * @param {Request} req - Objeto de requisição do Express contendo email e senha no body.
 * @param {Response} res - Objeto de resposta do Express.
 * @returns {Promise<any>} Resposta em JSON com os dados do usuário e rota destino.
 */
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

/**
 * Cria uma nova conta de usuário (Paciente ou Médico) e a vincula nas tabelas filhas.
 *
 * @param {Request} req - Requisição contendo nome, email, senha e tipoUsuario.
 * @param {Response} res - Resposta HTTP indicando sucesso ou erro.
 * @returns {Promise<any>} Resposta em JSON de status.
 */
export const cadastro = async (req: Request, res: Response): Promise<any> => {
  try {
    const { nome, email, senha, tipoUsuario } = req.body;

    const [resultUsuario]: any = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)",
      [nome, email, senha, tipoUsuario],
    );
    const usuarioId = resultUsuario.insertId;

    if (tipoUsuario === "MEDICO") {
      await pool.query(
        "INSERT INTO medicos (usuario_id, crm, especialidade) VALUES (?, ?, ?)",
        [usuarioId, "CRM-" + usuarioId, "Clínico Geral"],
      );
    } else {
      await pool.query(
        "INSERT INTO pacientes (usuario_id, data_nascimento) VALUES (?, ?)",
        [usuarioId, "1980-01-01"],
      );
    }

    return res
      .status(201)
      .json({ mensagem: "Cadastro realizado com sucesso!" });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ erro: "E-mail já existe" });
    return res.status(500).json({ erro: "Erro interno" });
  }
};
