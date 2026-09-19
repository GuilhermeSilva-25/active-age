document.addEventListener("DOMContentLoaded", () => {
  const usuarioLogado = JSON.parse(sessionStorage.getItem("activeAgeUser"));

  if (!usuarioLogado || usuarioLogado.tipo !== "PACIENTE") {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("nomePaciente").textContent =
    "Olá, " + usuarioLogado.nome;

  const formAgendamento = document.getElementById("formAgendamento");
  const tabelaAgendamentos = document.getElementById("tabelaAgendamentos");

  async function carregarAgendamentos() {
    try {
      const response = await fetch("/api/agendamentos");
      const agendamentos = await response.json();

      tabelaAgendamentos.innerHTML = "";

      const meusAgendamentos = agendamentos.filter(
        (a) => a.paciente === usuarioLogado.nome,
      );

      if (meusAgendamentos.length === 0) {
        tabelaAgendamentos.innerHTML =
          "<tr><td colspan='4' class='text-center text-muted'>Nenhuma consulta encontrada.</td></tr>";
        return;
      }

      meusAgendamentos.forEach((ag) => {
        const dataFormatada = new Date(ag.data_hora).toLocaleString("pt-BR");

        let botoes = "";
        if (ag.status === "AGENDADO") {
          botoes = `
                        <button class="btn btn-sm btn-success me-2" onclick="acessarSala()">Acessar Sala de Vídeo</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="cancelarConsulta(${ag.id})">Cancelar</button>
                    `;
        } else {
          botoes = `<span class="text-muted">Consulta Encerrada ou Cancelada</span>`;
        }

        let badgeStatus =
          ag.status === "AGENDADO"
            ? "bg-primary"
            : ag.status === "CANCELADO"
              ? "bg-danger"
              : "bg-secondary";

        const tr = document.createElement("tr");
        tr.innerHTML = `
                    <td><strong>${ag.medico}</strong><br><small class="text-muted">${ag.especialidade}</small></td>
                    <td>${dataFormatada}</td>
                    <td><span class="badge ${badgeStatus}">${ag.status}</span></td>
                    <td>${botoes}</td>
                `;
        tabelaAgendamentos.appendChild(tr);
      });
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    }
  }

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
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao conectar com a API.",
      });
    }
  });

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
