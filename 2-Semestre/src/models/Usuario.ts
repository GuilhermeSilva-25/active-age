/**
 * Classe abstrata base para todos os usuários do sistema.
 * @abstract
 */
export abstract class Usuario {
  protected id?: number;
  protected nome: string;
  protected email: string;
  protected senha?: string;
  protected tipoUsuario: "PACIENTE" | "MEDICO" | "ADMIN";

  /**
   * Cria uma instância de Usuario.
   * @param {string} nome - Nome completo do usuário.
   * @param {string} email - Endereço de e-mail do usuário.
   * @param {"PACIENTE" | "MEDICO" | "ADMIN"} tipoUsuario - Perfil de acesso do usuário.
   * @param {number} [id] - Identificador único do banco de dados (opcional).
   * @param {string} [senha] - Senha criptografada do usuário (opcional).
   */
  constructor(
    nome: string,
    email: string,
    tipoUsuario: "PACIENTE" | "MEDICO" | "ADMIN",
    id?: number,
    senha?: string,
  ) {
    this.nome = nome;
    this.email = email;
    this.tipoUsuario = tipoUsuario;
    this.id = id;
    this.senha = senha;
  }

  /**
   * @returns {number | undefined} O ID do usuário.
   */
  public getId(): number | undefined {
    return this.id;
  }

  /**
   * @returns {string} O nome do usuário.
   */
  public getNome(): string {
    return this.nome;
  }

  /**
   * @returns {string} O e-mail do usuário.
   */
  public getEmail(): string {
    return this.email;
  }

  /**
   * @returns {string} O tipo/perfil do usuário.
   */
  public getTipoUsuario(): string {
    return this.tipoUsuario;
  }

  /**
   * Retorna a rota do painel correspondente ao tipo de usuário.
   * @abstract
   * @returns {string} Caminho do dashboard.
   */
  abstract getDashboardRoute(): string;
}
