export abstract class Usuario {
  protected id?: number;
  protected nome: string;
  protected email: string;
  protected senha?: string;
  protected tipoUsuario: "PACIENTE" | "MEDICO" | "ADMIN";

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

  public getId(): number | undefined {
    return this.id;
  }
  public getNome(): string {
    return this.nome;
  }
  public getEmail(): string {
    return this.email;
  }
  public getTipoUsuario(): string {
    return this.tipoUsuario;
  }

  abstract getDashboardRoute(): string;
}
