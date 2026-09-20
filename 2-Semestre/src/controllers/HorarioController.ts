import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Controlador responsável pela gestão de horários disponibilizados pelos médicos.
 */
export class HorarioController {
  /**
   * Disponibiliza um novo slot de horário na agenda do médico.
   * 
   * @param {Request} req - Requisição contendo usuario_id e data_hora.
   * @param {Response} res - Resposta de sucesso ou conflito.
   * @returns {Promise<any>}
   */
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

  /**
   * Lista todos os horários de médicos que ainda não foram reservados por pacientes.
   * 
   * @param {Request} req - Objeto da requisição.
   * @param {Response} res - Resposta com array de horários livres.
   * @returns {Promise<any>}
   */
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

  /**
   * Exclui permanentemente um horário que o médico havia disponibilizado na agenda.
   * Regra de Negócio: O médico só pode excluir horários que ainda estão com status LIVRE e não foram consumidos.
   * 
   * @param {Request} req - ID do horário na URL.
   * @param {Response} res - Confirmação de remoção.
   * @returns {Promise<any>}
   */
  static async excluir(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM horarios_disponiveis WHERE id = ?", [id]);
      return res.json({ mensagem: "Horário removido com sucesso!" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao remover horário." });
    }
  }
}
