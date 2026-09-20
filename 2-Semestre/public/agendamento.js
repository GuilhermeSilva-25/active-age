/**
 * Inicializa a tela de agendamentos e dashboards (Paciente ou Médico) com base na sessão atual.
 */
document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(sessionStorage.getItem("activeAgeUser"));

  if (!usuarioLogado) {
    window.location.href = "login.html";
    return;
  }

  const nomePacienteEl = document.getElementById("nomePaciente");
  if (nomePacienteEl) {
    nomePacienteEl.textContent = "Olá, " + usuarioLogado.nome;
  }

  const formAgendamento = document.getElementById("formAgendamento");
  
  // Regra de Negócio: Intercepta a marcação de consulta pelo Paciente
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", async (e) => {
      e.preventDefault();
      const medico_id = document.getElementById("medicoId").value;
      const horario_id = document.getElementById("dataHora").value;

      try {
        const response = await fetch("/api/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: usuarioLogado.id, medico_id, horario_id }),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Sucesso!",
            text: "Sua consulta foi agendada.",
          }).then(() => window.location.reload());
        } else {
          Swal.fire({ icon: "error", title: "Atenção", text: data.erro });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Erro", text: "Erro ao conectar." });
      }
    });
  }

  /**
   * @async
   * @function carregarHorariosDisponiveis
   * @description Busca horários livres na API e preenche dinamicamente os `<select>` do paciente.
   */
  async function carregarHorariosDisponiveis() {
    const medicoSelect = document.getElementById("medicoId");
    const dataHoraSelect = document.getElementById("dataHora");
    if (!medicoSelect || !dataHoraSelect) return;

    try {
      const res = await fetch("/api/horarios/livres");
      const horarios = await res.json();
      
      const medicos = {};
      horarios.forEach(h => {
        if (!medicos[h.medico_id]) medicos[h.medico_id] = { nome: h.medico_nome, horarios: [] };
        medicos[h.medico_id].horarios.push(h);
      });

      medicoSelect.innerHTML = '<option value="">Selecione um médico...</option>';
      for (const mId in medicos) {
        medicoSelect.innerHTML += `<option value="${mId}">${medicos[mId].nome}</option>`;
      }

      medicoSelect.addEventListener("change", (e) => {
        dataHoraSelect.innerHTML = '<option value="">Selecione o horário...</option>';
        const selecionado = medicos[e.target.value];
        if (selecionado) {
          selecionado.horarios.forEach(h => {
            const dataFmt = new Date(h.data_hora).toLocaleString("pt-BR");
            dataHoraSelect.innerHTML += `<option value="${h.horario_id}">${dataFmt}</option>`;
          });
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  carregarHorariosDisponiveis();

  const formHorario = document.getElementById("formHorario");
  
  // Regra de Negócio: Permite ao médico abrir novos blocos de horários em sua agenda
  if (formHorario && usuarioLogado.tipo === "MEDICO") {
    formHorario.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data_hora = document.getElementById("dataHoraLivre").value;
      try {
        const response = await fetch("/api/horarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: usuarioLogado.id, data_hora })
        });
        const data = await response.json();
        if (response.ok) {
          Swal.fire({ icon: "success", title: "Feito!", text: "Horário liberado para pacientes." });
        } else {
          Swal.fire({ icon: "error", title: "Ops", text: data.erro });
        }
      } catch (err) {
        Swal.fire({ icon: "error", title: "Erro", text: "Erro ao conectar." });
      }
    });
  }

  /**
   * @async
   * @function carregarAgendamentos
   * @description Lista as consultas marcadas dependendo do perfil (Paciente ou Médico).
   */
  async function carregarAgendamentos() {
    try {
      const response = await fetch("/api/agendamentos");
      const agendamentos = await response.json();

      if (
        usuarioLogado.tipo === "PACIENTE" &&
        document.getElementById("tabelaAgendamentos")
      ) {
        const tabela = document.getElementById("tabelaAgendamentos");
        tabela.innerHTML = "";
        const meusAgendamentos = agendamentos.filter(
          (a) => a.paciente === usuarioLogado.nome,
        );

        meusAgendamentos.forEach((ag) => {
          const btn =
            ag.status === "AGENDADO"
              ? `<button class="btn btn-sm btn-success me-2" onclick="acessarSala()">Acessar Sala</button> <button class="btn btn-sm btn-outline-danger" onclick="cancelarConsulta(${ag.id})">Cancelar</button>`
              : `<span class="text-muted">Encerrada</span>`;
          const badge = ag.status === "AGENDADO" ? "bg-primary" : "bg-danger";
          tabela.innerHTML += `<tr><td><strong>${ag.medico}</strong></td><td>${new Date(ag.data_hora).toLocaleString("pt-BR")}</td><td><span class="badge ${badge}">${ag.status}</span></td><td>${btn}</td></tr>`;
        });
      }

      if (
        usuarioLogado.tipo === "MEDICO" &&
        document.getElementById("tabelaAgendamentosMedico")
      ) {
        document.getElementById("nomeMedico").textContent =
          "Olá, " + usuarioLogado.nome;
        const tabela = document.getElementById("tabelaAgendamentosMedico");
        tabela.innerHTML = "";
        const minhaAgenda = agendamentos.filter(
          (a) => a.medico === usuarioLogado.nome,
        );

        minhaAgenda.forEach((ag) => {
          const btn =
            ag.status === "AGENDADO"
              ? `<button class="btn btn-sm btn-success me-2" onclick="acessarSala()">Iniciar Consulta (Vídeo)</button> <button class="btn btn-sm btn-outline-danger" onclick="cancelarConsulta(${ag.id})">Desmarcar</button>`
              : `<span class="text-muted">Encerrada</span>`;
          const badge = ag.status === "AGENDADO" ? "bg-primary" : "bg-danger";
          tabela.innerHTML += `<tr><td><strong>${ag.paciente}</strong></td><td>${new Date(ag.data_hora).toLocaleString("pt-BR")}</td><td><span class="badge ${badge}">${ag.status}</span></td><td>${btn}</td></tr>`;
        });
      }
    } catch (error) {
      console.error("Erro", error);
    }
  }

  /**
   * @async
   * @function carregarMeusHorariosLivres
   * @description Puxa os slots ociosos disponibilizados pelo médico autenticado e exibe na vitrine.
   */
  async function carregarMeusHorariosLivres() {
    const tabela = document.getElementById("tabelaMeusHorarios");
    if (!tabela || usuarioLogado.tipo !== "MEDICO") return;

    try {
      const res = await fetch("/api/horarios/livres");
      const horarios = await res.json();
      
      const meusLivres = horarios.filter(h => h.medico_nome === usuarioLogado.nome);
      tabela.innerHTML = "";
      
      if (meusLivres.length === 0) {
         tabela.innerHTML = "<tr><td colspan='2' class='text-center text-muted'>Nenhum horário livre disponível na sua vitrine.</td></tr>";
         return;
      }

      meusLivres.forEach(h => {
        const dataFmt = new Date(h.data_hora).toLocaleString("pt-BR");
        tabela.innerHTML += `
          <tr>
            <td>${dataFmt}</td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="excluirHorario(${h.horario_id})">Remover</button></td>
          </tr>
        `;
      });
    } catch (e) {
      console.error(e);
    }
  }

  carregarMeusHorariosLivres();
  carregarAgendamentos();
});

/**
 * Função global para cancelar consulta agendada.
 * Regra de Negócio: O cancelamento por ambas as partes usa o mesmo endpoint e devolve o slot à vitrine.
 * @param {number} idAgendamento - Identificador da consulta.
 */
window.cancelarConsulta = async function (idAgendamento) {
  if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
    await fetch("/api/agendamentos/" + idAgendamento + "/cancelar", {
      method: "PUT",
    });
    window.location.reload();
  }
};

/**
 * Remove um horário livre disponibilizado pelo médico.
 * @param {number} idHorario - Identificador do slot na tabela horarios_disponiveis.
 */
window.excluirHorario = async function (idHorario) {
  if (confirm("Tem certeza que deseja remover este horário livre da vitrine?")) {
    await fetch("/api/horarios/" + idHorario, { method: "DELETE" });
    window.location.reload();
  }
};

/**
 * Simula a entrada na sala virtual de telemedicina.
 */
window.acessarSala = function () {
  window.location.href = "sala-video-fake.html";
};
