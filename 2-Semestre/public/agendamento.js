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
  if (formAgendamento) {
    formAgendamento.addEventListener("submit", async (e) => {
      e.preventDefault();
      const medico_id = document.getElementById("medicoId").value;
      const data_hora = document.getElementById("dataHora").value;

      try {
        const response = await fetch("/api/agendamentos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paciente_id: 1, medico_id, data_hora }),
        });

        const data = await response.json();

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Sucesso!",
            text: "Sua consulta foi agendada.",
          });
          carregarAgendamentos();
        } else {
          Swal.fire({ icon: "error", title: "Atenção", text: data.erro });
        }
      } catch (error) {
        Swal.fire({ icon: "error", title: "Erro", text: "Erro ao conectar." });
      }
    });
  }

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

  carregarAgendamentos();
});

window.cancelarConsulta = async function (idAgendamento) {
  if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
    await fetch("/api/agendamentos/" + idAgendamento + "/cancelar", {
      method: "PUT",
    });
    window.location.reload();
  }
};

window.acessarSala = function () {
  window.location.href = "sala-video-fake.html";
};
