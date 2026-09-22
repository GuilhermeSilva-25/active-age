import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Home} from './pages/Home';
import {QuemSomos} from './pages/QuemSomos';
import {Servicos} from './pages/Servicos';
import {TermosUso} from './pages/TermosUso';
import {Privacidade} from './pages/Privacidade';

import {AuthLayout} from './layouts/AuthLayout';
import {Login} from './pages/auth/Login';
import {CadastroEscolha} from './pages/auth/CadastroEscolha';

function App() {
    return (
        <Router>
            <Routes>
                {/* === Grupo 1: Site Institucional (Usa o layout padrão com Navbar e Footer) === */}
                <Route path="/" element={<Home/>}/>
                <Route path="/quem-somos" element={<QuemSomos/>}/>
                <Route path="/servicos" element={<Servicos/>}/>
                <Route path="/termos" element={<TermosUso/>}/>
                <Route path="/privacidade" element={<Privacidade/>}/>

                {/* === Grupo 2: Autenticação (Usa o AuthLayout com tela dividida) === */}
                <Route element={<AuthLayout/>}>
                    {/* Todas as rotas aqui dentro serão injetadas no <Outlet /> do AuthLayout */}
                    <Route path="/login" element={<Login/>}/>

                    {/* Rotas temporárias (Stub) para não quebrar a navegação até criarmos os formulários */}
                    <Route path="/cadastro" element={<CadastroEscolha/>}/>
                    <Route path="/cadastro-paciente"
                           element={<div className="text-center font-bold text-brand-orange">Cadastro Paciente (Em
                               breve)</div>}/>
                    <Route path="/cadastro-medico"
                           element={<div className="text-center font-bold text-brand-mint">Cadastro Médico (Em
                               breve)</div>}/>
                    <Route path="/recuperar-senha"
                           element={<div className="text-center font-bold text-brown">Recuperação (Em breve)</div>}/>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;