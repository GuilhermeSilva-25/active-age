document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("formLogin");

  const navLinks = document.getElementById("nav-links");
  const usuarioLogado = JSON.parse(sessionStorage.getItem("activeAgeUser"));

  if (navLinks) {
    if (usuarioLogado) {
      navLinks.innerHTML = `
                <li class="nav-item me-lg-3"><a class="btn btn-primary" href="#">Meu Painel</a></li>
                <li class="nav-item"><button class="btn btn-outline-danger" id="btnLogout">Sair</button></li>
            `;
      document.getElementById("btnLogout").addEventListener("click", () => {
        sessionStorage.removeItem("activeAgeUser");
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
