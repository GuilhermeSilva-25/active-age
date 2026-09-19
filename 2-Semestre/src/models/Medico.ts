import { Usuario } from "./Usuario";

export class Medico extends Usuario {
  private crm: string;
  private especialidade: string;

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

  public getCrm(): string {
    return this.crm;
  }
  public getEspecialidade(): string {
    return this.especialidade;
  }

  public getDashboardRoute(): string {
    return "/dashboard-medico.html";
  }
}
