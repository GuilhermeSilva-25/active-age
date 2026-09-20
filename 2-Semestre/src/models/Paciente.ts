import { Usuario } from "./Usuario";

/**
 * Representa um Paciente no sistema, herdando de Usuario.
 * @extends Usuario
 */
export class Paciente extends Usuario {
  private dataNascimento: Date;

  /**
   * Cria uma instância de Paciente.
   * @param {string} nome - Nome do paciente.
   * @param {string} email - E-mail do paciente.
   * @param {Date} dataNascimento - Data de nascimento.
   * @param {number} [id] - ID único (opcional).
   * @param {string} [senha] - Senha do paciente (opcional).
   */
  constructor(
    nome: string,
    email: string,
    dataNascimento: Date,
    id?: number,
    senha?: string,
  ) {
    super(nome, email, "PACIENTE", id, senha);
    this.dataNascimento = dataNascimento;
  }

  /**
   * @returns {Date} A data de nascimento do paciente.
   */
  public getDataNascimento(): Date {
    return this.dataNascimento;
  }

  /**
   * Retorna a rota específica do painel do Paciente.
   * @returns {string} Rota do dashboard.
   */
  public getDashboardRoute(): string {
    return "/dashboard-paciente.html";
  }
}
