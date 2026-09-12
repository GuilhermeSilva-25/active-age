/**
 * Evento disparado quando o HTML é completamente carregado.
 * Responsável por renderizar os botões da barra de navegação (NavLinks)
 * dinamicamente, dependendo se existe um usuário logado no localStorage.
 */
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.getElementById("nav-links");
  const usuarioLogado = JSON.parse(localStorage.getItem("activeAgeUser"));

  if (navLinks) {
    if (usuarioLogado) {
      navLinks.innerHTML = `
                <li class="nav-item me-lg-3"><a class="btn btn-primary" href="dashboard.html">Meu Painel</a></li>
                <li class="nav-item"><button class="btn btn-outline-danger" onclick="fazerLogout()">Sair</button></li>
            `;
    } else {
      navLinks.innerHTML = `
                <li class="nav-item me-lg-3"><a class="btn btn-outline-secondary" href="login.html">Fazer Login</a></li>
                <li class="nav-item"><a class="btn btn-primary" href="cadastro.html">Cadastre-se</a></li>
            `;
    }
  }
});

/**
 * Realiza o logout do usuário atual.
 * Remove os dados da sessão do localStorage e redireciona para a página inicial.
 */
function fazerLogout() {
  localStorage.removeItem("activeAgeUser");
  window.location.href = "index.html";
}

/**
 * Elemento HTML do formulário de cadastro.
 * Se existir na página, aplica as lógicas de alternância de perfil (Paciente/Médico)
 * e o evento de submissão (submit) para salvar o novo usuário no localStorage.
 * 
 * @type {HTMLElement | null}
 */
const formCadastro = document.getElementById("formCadastro");

if (formCadastro) {
  const radiosTipo = document.getElementsByName("tipoUsuario");
  const areaPaciente = document.getElementById("areaPaciente");
  const areaMedico = document.getElementById("areaMedico");

  radiosTipo.forEach((radio) => {
    radio.addEventListener("change", (e) => {
      if (e.target.value === "PACIENTE") {
        areaPaciente.classList.remove("d-none");
        areaMedico.classList.add("d-none");
      } else {
        areaPaciente.classList.add("d-none");
        areaMedico.classList.remove("d-none");
      }
    });
  });

  formCadastro.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confSenha = document.getElementById("confirmarSenha").value;
    const tipo = document.querySelector(
      'input[name="tipoUsuario"]:checked',
    ).value;

    if (senha !== confSenha) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "As senhas não coincidem.",
      });
      return;
    }

    const novoUsuario = { nome, email, senha, tipo };

    let usuariosCadastrados =
      JSON.parse(localStorage.getItem("activeAgeUsuarios")) || [];

    if (usuariosCadastrados.some((u) => u.email === email)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "E-mail já cadastrado!",
      });
      return;
    }

    usuariosCadastrados.push(novoUsuario);
    localStorage.setItem(
      "activeAgeUsuarios",
      JSON.stringify(usuariosCadastrados),
    );

    Swal.fire({
      icon: "success",
      title: "Sucesso!",
      text: "Conta criada. Faça login para continuar.",
      confirmButtonColor: "var(--aa-green)",
    }).then(() => {
      window.location.href = "login.html";
    });
  });
}

/**
 * Elemento HTML do formulário de login.
 * Valida o e-mail e senha inseridos comparando com a base salva no localStorage.
 * Em caso de sucesso, inicia a "sessão" do usuário.
 * 
 * @type {HTMLElement | null}
 */
const formLogin = document.getElementById("formLogin");

if (formLogin) {
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const senha = document.getElementById("loginSenha").value;

    let usuariosCadastrados =
      JSON.parse(localStorage.getItem("activeAgeUsuarios")) || [];

    const usuarioValido = usuariosCadastrados.find(
      (u) => u.email === email && u.senha === senha,
    );

    if (usuarioValido) {
      localStorage.setItem("activeAgeUser", JSON.stringify(usuarioValido));
      window.location.href = "dashboard.html";
    } else {
      Swal.fire({
        icon: "error",
        title: "Acesso Negado",
        text: "E-mail ou senha inválidos.",
      });
    }
  });
}

/**
 * Lógica de inicialização do Dashboard.
 * Funciona como um "Guarda de Rota" (Route Guard): se não houver usuário logado,
 * redireciona o usuário imediatamente para a página de login.
 * Se houver, personaliza a tela de acordo com o tipo de usuário (MEDICO ou PACIENTE).
 */
const dashTitle = document.getElementById("dashTitle");
if (dashTitle) {
  const usuarioLogado = JSON.parse(localStorage.getItem("activeAgeUser"));

  if (!usuarioLogado) {
    window.location.href = "login.html";
  } else {
    document.getElementById("dashNome").textContent = usuarioLogado.nome;

    if (usuarioLogado.tipo === "MEDICO") {
      dashTitle.textContent = "Painel do Médico Geriatra";
    } else {
      dashTitle.textContent = "Painel do Paciente";
    }
  }

  document.getElementById("btnLogout").addEventListener("click", fazerLogout);
}
