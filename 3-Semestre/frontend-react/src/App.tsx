import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {Home} from './pages/Home';
import {QuemSomos} from './pages/QuemSomos';
import {Servicos} from './pages/Servicos';
import {TermosUso} from './pages/TermosUso';
import {Privacidade} from './pages/Privacidade';

import {AuthLayout} from './layouts/AuthLayout';
import {Login} from './pages/auth/Login';
import {CadastroEscolha} from './pages/auth/CadastroEscolha';
import {CadastroPaciente} from './pages/auth/CadastroPaciente';
import {CadastroMedico} from './pages/auth/CadastroMedico';
import {RecuperarSenha} from './pages/auth/RecuperarSenha';

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
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/cadastro" element={<CadastroEscolha/>}/>
                    <Route path="/cadastro-paciente" element={<CadastroPaciente/>}/>
                    <Route path="/cadastro-medico" element={<CadastroMedico/>}/>
                    <Route path="/recuperar-senha" element={<RecuperarSenha/>}/>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;