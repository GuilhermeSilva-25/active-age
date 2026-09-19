import { Request, Response } from "express";
import pool from "../config/database";

export class HorarioController {
  static async criar(req: Request, res: Response): Promise<any> {
    try {
      const { usuario_id, data_hora } = req.body;
      await pool.query(
        "INSERT INTO horarios_disponiveis (medico_id, data_hora) VALUES ((SELECT id FROM medicos WHERE usuario_id = ?), ?)",
        [usuario_id, data_hora],
      );
      return res
        .status(201)
        .json({ mensagem: "Horário disponibilizado com sucesso!" });
    } catch (error: any) {
      if (error.code === "ER_DUP_ENTRY")
        return res
          .status(409)
          .json({ erro: "Este horário já foi cadastrado." });
      return res.status(500).json({ erro: "Erro ao cadastrar horário." });
    }
  }

  static async listarLivres(req: Request, res: Response): Promise<any> {
    try {
      const query = `
                SELECT h.id as horario_id, h.data_hora, m.id as medico_id, u.nome as medico_nome
                FROM horarios_disponiveis h
                JOIN medicos m ON h.medico_id = m.id
                JOIN usuarios u ON m.usuario_id = u.id
                WHERE h.status = 'LIVRE'
                ORDER BY h.data_hora ASC
            `;
      const [rows] = await pool.query(query);
      return res.json(rows);
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao buscar horários livres." });
    }
  }
}
