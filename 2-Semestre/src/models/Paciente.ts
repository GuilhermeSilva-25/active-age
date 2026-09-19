import { Usuario } from "./Usuario";

export class Paciente extends Usuario {
  private dataNascimento: Date;

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

  public getDataNascimento(): Date {
    return this.dataNascimento;
  }

  public getDashboardRoute(): string {
    return "/dashboard-paciente.html";
  }
}
