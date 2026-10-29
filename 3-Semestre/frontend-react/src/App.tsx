import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { Home } from './pages/Home';
import { QuemSomos } from './pages/QuemSomos';
import { Servicos } from './pages/Servicos';
import { TermosUso } from './pages/TermosUso';
import { Privacidade } from './pages/Privacidade';

import { AuthLayout } from './layouts/AuthLayout';
import { Login } from './pages/auth/Login';
import { CadastroEscolha } from './pages/auth/CadastroEscolha';
import { CadastroPaciente } from './pages/auth/CadastroPaciente';
import { CadastroMedico } from './pages/auth/CadastroMedico';
import { RecuperarSenha } from './pages/auth/RecuperarSenha';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCredenciamento } from './pages/admin/AdminCredenciamento';
import { AdminUsuarios } from './pages/admin/AdminUsuarios';
import { AdminAuditoria } from './pages/admin/AdminAuditoria';
import { DossieCredenciamento } from './pages/medico/DossieCredenciamento';
import { DashboardMedico } from './pages/medico/DashboardMedico';
import { PerfilMedico } from './pages/medico/PerfilMedico';
import { DashboardPaciente } from './pages/paciente/DashboardPaciente';
import { PerfilPaciente } from './pages/paciente/PerfilPaciente';
import { BuscaMedicos } from './pages/paciente/BuscaMedicos';
import { MeusExames } from './pages/paciente/MeusExames';
import { ScrollToTop } from './components/common/ScrollToTop';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* === Grupo 1: Site Institucional (Usa o PublicLayout com Navbar e Footer) === */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/quem-somos" element={<QuemSomos />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/termos" element={<TermosUso />} />
                    <Route path="/privacidade" element={<Privacidade />} />
                </Route>

                {/* === Grupo 2: Autenticação (Usa o AuthLayout com tela dividida) === */}
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<CadastroEscolha />} />
                    <Route path="/cadastro-paciente" element={<CadastroPaciente />} />
                    <Route path="/cadastro-medico" element={<CadastroMedico />} />
                    <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                </Route>

                {/* === Grupo 3: Área do Paciente (Blindada por RBAC: ROLE_PACIENTE) === */}
                <Route element={<ProtectedRoute requiredRole="ROLE_PACIENTE" />}>
                    <Route path="/paciente/dashboard" element={<DashboardPaciente />} />
                    <Route path="/paciente/perfil" element={<PerfilPaciente />} />
                    <Route path="/paciente/busca-medicos" element={<BuscaMedicos />} />
                    <Route path="/paciente/exames" element={<MeusExames />} />
                </Route>

                {/* === Grupo 4: Área Médica (Blindada por RBAC: ROLE_MEDICO) === */}
                <Route element={<ProtectedRoute requiredRole="ROLE_MEDICO" />}>
                    <Route path="/medico/dashboard" element={<DashboardMedico />} />
                    <Route path="/medico/credenciamento" element={<DossieCredenciamento />} />
                    <Route path="/medico/perfil" element={<PerfilMedico />} />
                </Route>

                {/* === Grupo 5: Painel Administrativo (Blindado por RBAC: ROLE_ADMIN) === */}
                <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/credenciamento" element={<AdminCredenciamento />} />
                        <Route path="/admin/medicos" element={<AdminCredenciamento />} />
                        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                        <Route path="/admin/auditoria" element={<AdminAuditoria />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
