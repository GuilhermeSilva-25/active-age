import { useState, useEffect, useMemo, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search,
    Stethoscope,
    ArrowLeft,
    ShieldCheck,
    Clock,
    Award,
    Sparkles,
    CalendarCheck,
    RotateCcw,
    SlidersHorizontal,
    X,
    Loader2
} from 'lucide-react';
import logoImg from '../../assets/logo-active-age.png';
import { Footer } from '../../components/home/Footer';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { DoctorDetailModal } from '../../components/paciente/DoctorDetailModal';
import { AgendarConsultaModal } from '../../components/paciente/AgendarConsultaModal';
import type { DoctorPublicProfile } from '../../components/paciente/DoctorDetailModal';
import type { FeedbackModalType } from '../../components/common/FeedbackModal';

const ESTADOS_BRASIL = [
    { sigla: '', nome: 'Todos os Estados' },
    { sigla: 'SP', nome: 'SP - São Paulo' },
    { sigla: 'RJ', nome: 'RJ - Rio de Janeiro' },
    { sigla: 'MG', nome: 'MG - Minas Gerais' },
    { sigla: 'RS', nome: 'RS - Rio Grande do Sul' },
    { sigla: 'PR', nome: 'PR - Paraná' },
    { sigla: 'BA', nome: 'BA - Bahia' },
    { sigla: 'SC', nome: 'SC - Santa Catarina' },
    { sigla: 'GO', nome: 'GO - Goiás' },
    { sigla: 'PE', nome: 'PE - Pernambuco' },
    { sigla: 'CE', nome: 'CE - Ceará' },
    { sigla: 'DF', nome: 'DF - Distrito Federal' },
];

const FOCOS_GERIATRICOS = [
    'Todos',
    'Avaliação Geriátrica Ampla (AGA)',
    'Memória e Demências',
    'Prevenção de Quedas',
    'Polifarmácia & Desprescrição',
    'Cuidados Paliativos',
    'Longevidade Ativa',
];

export function BuscaMedicos() {
    const navigate = useNavigate();
    const ufSelectId = useId();
    const sortSelectId = useId();

    // Estados de Busca e Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUf, setSelectedUf] = useState('');
    const [selectedFocus, setSelectedFocus] = useState('Todos');
    const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'fee_asc' | 'fee_desc'>('name_asc');

    // Dados e Loading
    const [doctors, setDoctors] = useState<DoctorPublicProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<DoctorPublicProfile | null>(null);
    const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorPublicProfile | null>(null);

    // Feedback Modal Acessível
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: FeedbackModalType;
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    // Efeito para carregar médicos do backend
    useEffect(() => {
        let isMounted = true;
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (searchTerm.trim()) params.append('q', searchTerm.trim());
                if (selectedUf) params.append('uf', selectedUf);
                if (selectedFocus !== 'Todos') params.append('focus', selectedFocus);
                params.append('sort', sortBy);

                const response = await fetch(`/api/doctors/search?${params.toString()}`);
                if (response.ok) {
                    const data: DoctorPublicProfile[] = await response.json();
                    if (isMounted) setDoctors(data);
                } else {
                    console.error('Falha ao carregar médicos do catálogo');
                }
            } catch (err) {
                console.error('Erro na requisição de médicos:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchDoctors, 250);
        return () => {
            isMounted = false;
            clearTimeout(debounceTimer);
        };
    }, [searchTerm, selectedUf, selectedFocus, sortBy]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedUf('');
        setSelectedFocus('Todos');
        setSortBy('name_asc');
    };

    const hasActiveFilters = useMemo(() => {
        return searchTerm.trim() !== '' || selectedUf !== '' || selectedFocus !== 'Todos' || sortBy !== 'name_asc';
    }, [searchTerm, selectedUf, selectedFocus, sortBy]);

    const handleSelectSchedule = (doctor: DoctorPublicProfile) => {
        setSelectedDoctorForModal(null);
        setSelectedDoctorForBooking(doctor);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-brown-dark font-sans flex flex-col justify-between">
            {/* Header da Busca */}
            <header className="bg-white border-b border-brand-pot/40 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link to="/paciente/dashboard" className="flex items-center gap-2 group" title="Ir para o Dashboard">
                            <img src={logoImg} alt="Active Age" className="h-10 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>

                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />

                        <div className="hidden sm:block">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block">
                                Vitrine de Especialistas Geriátricos
                            </span>
                            <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                Buscar Médico Geriatra
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/paciente/dashboard')}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-brand-orange" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-16 flex-grow w-full space-y-6 sm:space-y-8">
                {/* Banner de Apresentação e Busca Inteligente */}
                <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-orange-200/60 shadow-sm relative overflow-hidden">
                    <div className="max-w-3xl space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/15 text-brand-orange text-xs sm:text-sm font-bold">
                            <Sparkles className="w-4 h-4" />
                            Pesquisa Neutra & Homologada CFM
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brown-dark tracking-tight">
                            Encontre o médico geriatra ideal para você.
                        </h2>
                        <p className="text-brown-light text-sm sm:text-base md:text-lg leading-relaxed">
                            Pesquise profissionais verificados, consulte suas qualificações e áreas de foco e marque sua teleconsulta com segurança e comodidade.
                        </p>
                    </div>

                    {/* Barra de Pesquisa Ampla */}
                    <div className="mt-6 max-w-3xl relative">
                        <div className="relative flex items-center">
                            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange absolute left-4 pointer-events-none" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Pesquise por nome do médico, foco clínico (ex: Memória, Quedas) ou RQE..."
                                className="w-full pl-12 sm:pl-13 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white border-2 border-brand-orange/30 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/15 text-brown-dark text-sm sm:text-base font-medium shadow-sm transition-all outline-none"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 p-1.5 rounded-lg text-brown-light hover:text-brown-dark hover:bg-gray-100 transition-colors cursor-pointer"
                                    title="Limpar busca"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bloco de Filtros Táteis e Ordenação Neutra */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 border border-brand-pot/40 shadow-xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-brand-pot/30">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-5 h-5 text-brand-orange" />
                            <h3 className="text-base sm:text-lg font-black text-brown-dark">
                                Filtros de Especialistas
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="ml-2 inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Limpar Filtros
                                </button>
                            )}
                        </div>

                        {/* Seletor de Estado e Ordenação */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Filtro UF */}
                            <div className="flex items-center gap-2">
                                <label htmlFor={ufSelectId} className="text-xs sm:text-sm font-bold text-brown-light">
                                    Estado (CRM):
                                </label>
                                <select
                                    id={ufSelectId}
                                    value={selectedUf}
                                    onChange={(e) => setSelectedUf(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-gray-50 border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-bold focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer"
                                >
                                    {ESTADOS_BRASIL.map((uf) => (
                                        <option key={uf.sigla} value={uf.sigla}>
                                            {uf.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Ordenação CFM (Resolução 2.336/2023) */}
                            <div className="flex items-center gap-2">
                                <label htmlFor={sortSelectId} className="text-xs sm:text-sm font-bold text-brown-light">
                                    Ordenar por:
                                </label>
                                <select
                                    id={sortSelectId}
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name_asc' | 'name_desc' | 'fee_asc' | 'fee_desc')}
                                    className="px-3 py-2 rounded-xl bg-gray-50 border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-bold focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer"
                                >
                                    <option value="name_asc">Nome (A a Z)</option>
                                    <option value="name_desc">Nome (Z a A)</option>
                                    <option value="fee_asc">Menor Valor de Consulta</option>
                                    <option value="fee_desc">Maior Valor de Consulta</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Chips de Foco Geriátrico */}
                    <div className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brown-light block">
                            Áreas de Foco Clínico Geriátrico:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {FOCOS_GERIATRICOS.map((focus) => {
                                const isSelected = selectedFocus === focus;
                                return (
                                    <button
                                        key={focus}
                                        type="button"
                                        onClick={() => setSelectedFocus(focus)}
                                        className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer ${
                                            isSelected
                                                ? 'bg-brand-orange text-white ring-2 ring-brand-orange/30 shadow-xs scale-102'
                                                : 'bg-white border border-brand-pot/50 text-brown-dark hover:bg-orange-50/60 hover:border-brand-orange/50'
                                        }`}
                                    >
                                        {focus}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Contador Transparente de Resultados */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-brown-light px-1">
                    <span>
                        {loading ? (
                            'Buscando médicos credenciados...'
                        ) : (
                            <>
                                Mostrando <strong className="text-brown-dark">{doctors.length}</strong>{' '}
                                {doctors.length === 1 ? 'médico geriatra homologado' : 'médicos geriatras homologados'}
                            </>
                        )}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-brand-orange hidden sm:inline">
                        Resolução CFM nº 2.336/2023 • Busca 100% Neutra
                    </span>
                </div>

                {/* Lista / Grid de Cards de Médicos */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brown-light space-y-3">
                        <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
                        <p className="text-sm sm:text-base font-bold">Carregando catálogo de médicos...</p>
                    </div>
                ) : doctors.length === 0 ? (
                    /* Empty State Amigável */
                    <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-brand-pot/60 text-center space-y-4 max-w-xl mx-auto shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100/60 text-brand-orange flex items-center justify-center mx-auto">
                            <Stethoscope className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-brown-dark">
                            Nenhum médico encontrado
                        </h3>
                        <p className="text-brown-light text-sm sm:text-base leading-relaxed">
                            Não encontramos nenhum profissional homologado com os filtros selecionados. Experimente buscar por outro nome ou limpar os filtros ativos.
                        </p>
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white font-bold text-sm shadow-md hover:bg-brand-orange/90 transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Limpar Todos os Filtros
                        </button>
                    </div>
                ) : (
                    /* Grid de Médicos */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {doctors.map((doctor) => {
                            const formattedFee = doctor.consultationFee
                                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doctor.consultationFee)
                                : 'Sob consulta';
                            const duration = doctor.consultationDurationMinutes || 50;

                            return (
                                <div
                                    key={doctor.id}
                                    className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/50 hover:border-brand-orange/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                                >
                                    {/* Cabeçalho do Card */}
                                    <div className="p-5 sm:p-6 space-y-4">
                                        <div className="flex items-start gap-4">
                                            {/* Foto de Perfil */}
                                            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-brand-orange/10 border border-brand-orange/20 shadow-inner shrink-0 flex items-center justify-center group-hover:scale-103 transition-transform relative">
                                                {doctor.avatarUrl ? (
                                                    <img
                                                        src={doctor.avatarUrl}
                                                        alt={doctor.fullName}
                                                        referrerPolicy="no-referrer"
                                                        crossOrigin="anonymous"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                                            const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                                                            if (fallback) fallback.classList.remove('hidden');
                                                        }}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : null}
                                                <div className={`avatar-fallback items-center justify-center w-full h-full ${doctor.avatarUrl ? 'hidden' : 'flex'}`}>
                                                    <Stethoscope className="w-8 h-8 text-brand-orange" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-1">
                                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                    <span>Homologado CFM</span>
                                                </div>

                                                <h4 className="text-base sm:text-lg font-black text-brown-dark truncate group-hover:text-brand-orange transition-colors" title={doctor.fullName}>
                                                    {doctor.fullName}
                                                </h4>

                                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-brown-light font-medium">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-brown-dark">
                                                        CRM {doctor.crm}/{doctor.ufCrm}
                                                    </span>
                                                    {doctor.rqe && (
                                                        <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-md font-bold inline-flex items-center gap-0.5">
                                                            <Award className="w-3 h-3" />
                                                            RQE {doctor.rqe}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Biografia Resumida */}
                                        <p className="text-brown-light text-xs sm:text-sm line-clamp-3 leading-relaxed">
                                            {doctor.bio || 'Médico especialista credenciado na plataforma Active Age para teleconsultas humanizadas.'}
                                        </p>

                                        {/* Tags de Foco Clínico */}
                                        {doctor.clinicalFocus && doctor.clinicalFocus.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {doctor.clinicalFocus.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-0.5 rounded-md bg-orange-50 border border-orange-200/60 text-brown-dark text-[11px] font-semibold"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {doctor.clinicalFocus.length > 3 && (
                                                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-brown-light text-[11px] font-bold">
                                                        +{doctor.clinicalFocus.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Rodapé do Card com Valores e Ações */}
                                    <div className="p-4 sm:p-5 bg-gradient-to-b from-gray-50/50 to-orange-50/30 border-t border-brand-pot/30 space-y-3">
                                        <div className="flex items-center justify-between text-xs sm:text-sm">
                                            <div>
                                                <span className="text-base sm:text-lg font-black text-brand-orange">
                                                    {formattedFee}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-brown-light text-xs font-semibold">
                                                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                                                <span>{duration} min</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedDoctorForModal(doctor)}
                                                className="px-3 py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-gray-100 text-brown-dark text-xs sm:text-sm font-bold transition-all text-center cursor-pointer"
                                            >
                                                Ver Perfil
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleSelectSchedule(doctor)}
                                                className="px-3 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-black shadow-xs hover:shadow-md transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <CalendarCheck className="w-4 h-4" />
                                                Agendar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Modal de Detalhes Completos do Profissional */}
            <DoctorDetailModal
                doctor={selectedDoctorForModal}
                isOpen={!!selectedDoctorForModal}
                onClose={() => setSelectedDoctorForModal(null)}
                onSelectSchedule={handleSelectSchedule}
            />

            {/* Modal de Agendamento Concorrente com Slots Reais (UC09) */}
            <AgendarConsultaModal
                doctor={selectedDoctorForBooking}
                isOpen={!!selectedDoctorForBooking}
                onClose={() => setSelectedDoctorForBooking(null)}
                onSuccess={() => {
                    setSelectedDoctorForBooking(null);
                    navigate('/paciente/consultas');
                }}
            />

            {/* Modal de Feedback Acessível (WCAG 2.1 AA) */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
            />

            <Footer />
        </div>
    );
}
