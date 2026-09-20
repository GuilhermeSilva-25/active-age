import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { QuemSomos } from './pages/QuemSomos';
import { Servicos } from './pages/Servicos';
import { TermosUso } from './pages/TermosUso';
import { Privacidade } from './pages/Privacidade';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quem-somos" element={<QuemSomos />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/termos" element={<TermosUso />} />
        <Route path="/privacidade" element={<Privacidade />} />
      </Routes>
    </Router>
  );
}

export default App;
