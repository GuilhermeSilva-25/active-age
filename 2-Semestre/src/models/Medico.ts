import { Usuario } from "./Usuario";

/**
 * Representa um Médico no sistema, herdando de Usuario.
 * @extends Usuario
 */
export class Medico extends Usuario {
  private crm: string;
  private especialidade: string;

  /**
   * Cria uma instância de Medico.
   * @param {string} nome - Nome do médico.
   * @param {string} email - E-mail do médico.
   * @param {string} crm - Registro profissional (CRM).
   * @param {string} especialidade - Especialidade médica.
   * @param {number} [id] - ID único (opcional).
   * @param {string} [senha] - Senha do médico (opcional).
   */
  constructor(
    nome: string,
    email: string,
    crm: string,
    especialidade: string,
    id?: number,
    senha?: string,
  ) {
    super(nome, email, "MEDICO", id, senha);
    this.crm = crm;
    this.especialidade = especialidade;
  }

  /**
   * @returns {string} O CRM do médico.
   */
  public getCrm(): string {
    return this.crm;
  }

  /**
   * @returns {string} A especialidade do médico.
   */
  public getEspecialidade(): string {
    return this.especialidade;
  }

  /**
   * Retorna a rota específica do painel do Médico.
   * @returns {string} Rota do dashboard.
   */
  public getDashboardRoute(): string {
    return "/dashboard-medico.html";
  }
}
