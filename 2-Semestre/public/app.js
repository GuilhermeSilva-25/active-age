document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");

  const navLinks = document.getElementById("nav-links");
  const usuarioLogado = JSON.parse(sessionStorage.getItem("activeAgeUser"));

  if (navLinks) {
    if (usuarioLogado) {
      let linkPainel =
        usuarioLogado.tipo === "PACIENTE"
          ? "dashboard-paciente.html"
          : "dashboard-medico.html";

      navLinks.innerHTML = `
                <li class="nav-item me-lg-3"><a class="btn btn-primary" href="${linkPainel}">Meu Painel</a></li>
                <li class="nav-item"><button class="btn btn-outline-danger" id="btnLogout">Sair</button></li>
            `;
      document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.clear();
        window.location.href = "index.html";
      });
    } else {
      navLinks.innerHTML = `
                <li class="nav-item me-lg-3"><a class="btn btn-outline-secondary" href="login.html">Fazer Login</a></li>
                <li class="nav-item"><a class="btn btn-primary" href="cadastro.html">Cadastre-se</a></li>
            `;
    }
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const senha = document.getElementById("loginSenha").value;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
          sessionStorage.setItem("activeAgeUser", JSON.stringify(data.usuario));

          window.location.href = data.redirectUrl;
        } else {
          Swal.fire({
            icon: "error",
            title: "Acesso Negado",
            text: data.erro || "Credenciais inválidas.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Falha ao conectar com o servidor.",
        });
      }
    });
  }
});

const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const tipoUsuario = document.querySelector(
      'input[name="tipoUsuario"]:checked',
    ).value;

    try {
      const response = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, tipoUsuario }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Sucesso!",
          text: "Conta criada com sucesso.",
        }).then(() => (window.location.href = "login.html"));
      } else {
        Swal.fire({ icon: "error", title: "Ops", text: data.erro });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Erro", text: "Falha no servidor." });
    }
  });
}
