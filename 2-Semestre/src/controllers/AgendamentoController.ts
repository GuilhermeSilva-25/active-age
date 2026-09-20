import { Request, Response } from "express";
import pool from "../config/database";

export class AgendamentoController {
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

  static async cancelar(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      // Busca qual era o horário e o médico deste agendamento
      const [rows]: any = await pool.query(
        "SELECT medico_id, data_hora FROM agendamentos WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ erro: "Agendamento não encontrado" });
      }

      const agendamento = rows[0];

      // Atualiza o status do agendamento para CANCELADO
      await pool.query(
        'UPDATE agendamentos SET status = "CANCELADO" WHERE id = ?',
        [id],
      );

      // Devolve o horário para a "prateleira" (status LIVRE)
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
