import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Controlador responsável pelas operações de Agendamentos de consultas.
 */
export class AgendamentoController {
  /**
   * Lista todos os agendamentos registrados no sistema (visão administrativa/geral).
   * 
   * @param {Request} req - Objeto de requisição do Express.
   * @param {Response} res - Objeto de resposta do Express.
   * @returns {Promise<any>} Lista de agendamentos com nomes e status.
   */
  static async listar(req: Request, res: Response): Promise<any> {
    try {
      const query = `
                SELECT a.id, u_pac.nome AS paciente, u_med.nome AS medico, med.especialidade, a.data_hora, a.status 
                FROM agendamentos a
                JOIN pacientes pac ON a.paciente_id = pac.id
                JOIN usuarios u_pac ON pac.usuario_id = u_pac.id
                JOIN medicos med ON a.medico_id = med.id
                JOIN usuarios u_med ON med.usuario_id = u_med.id
            `;
      const [rows] = await pool.query(query);
      return res.json(rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao listar agendamentos" });
    }
  }

  /**
   * Cria um novo agendamento a partir da escolha do paciente.
   * Regra de Negócio: O agendamento vincula o id do paciente ao slot do médico e ocupa o horário.
   * 
   * @param {Request} req - Requisição contendo usuario_id, medico_id e horario_id.
   * @param {Response} res - Resposta indicando o sucesso da marcação.
   * @returns {Promise<any>} Resposta em JSON.
   */
  static async agendar(req: Request, res: Response): Promise<any> {
    try {
      const { usuario_id, medico_id, horario_id } = req.body;
      
      const [horarioRows]: any = await pool.query(
        "SELECT data_hora FROM horarios_disponiveis WHERE id = ?",
        [horario_id]
      );
      if (horarioRows.length === 0) return res.status(404).json({ erro: "Horário não encontrado" });
      const data_hora = horarioRows[0].data_hora;

      const [result]: any = await pool.query(
        "INSERT INTO agendamentos (paciente_id, medico_id, data_hora) VALUES ((SELECT id FROM pacientes WHERE usuario_id = ?), ?, ?)",
        [usuario_id, medico_id, data_hora],
      );

      // Bloqueia o slot do médico para que não receba agendamento duplicado
      await pool.query(
        "UPDATE horarios_disponiveis SET status = 'OCUPADO' WHERE id = ?",
        [horario_id]
      );

      return res.status(201).json({
        mensagem: "Agendamento criado com sucesso!",
        idAgendamento: result.insertId,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno ao agendar consulta" });
    }
  }

  /**
   * Cancela uma consulta previamente agendada.
   * Regra de Negócio: Ao cancelar, o slot deve ser devolvido à vitrine de horários livres do médico.
   * 
   * @param {Request} req - Requisição contendo o ID do agendamento nos parâmetros de rota.
   * @param {Response} res - Resposta da operação de cancelamento.
   * @returns {Promise<any>} Resposta em JSON.
   */
  static async cancelar(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      // Busca dados antes de cancelar para restituir a agenda do médico
      const [rows]: any = await pool.query(
        "SELECT medico_id, data_hora FROM agendamentos WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      const agendamento = rows[0];

      await pool.query(
        'UPDATE agendamentos SET status = "CANCELADO" WHERE id = ?',
        [id],
      );

      // Devolve a disponibilidade do médico após o cancelamento do paciente
      await pool.query(
        "UPDATE horarios_disponiveis SET status = 'LIVRE' WHERE medico_id = ? AND data_hora = ?",
        [agendamento.medico_id, agendamento.data_hora]
      );

      return res.json({ mensagem: "Agendamento cancelado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ erro: "Erro ao cancelar agendamento" });
    }
  }
}
