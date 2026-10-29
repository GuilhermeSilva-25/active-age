import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Globe,
    Loader2,
    Lock,
    ShieldAlert,
    Stethoscope,
    User,
} from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import type { FeedbackModalType } from '../../components/common/FeedbackModal';
import type { UserProfile, UpdateDoctorProfilePayload } from '../../types/profile';
import { applyPhoneMask } from '../../utils/masks';

const CLINICAL_FOCUS_OPTIONS = [
    'Avaliação Geriátrica Ampla (AGA)',
    'Memória e Demências',
    'Prevenção de Quedas',
    'Polifarmácia e Desprescrição',
    'Longevidade Ativa',
    'Cuidados Paliativos',
    'Osteoporose e Sarcopenia',
    'Nutrição do Idoso',
    'Reabilitação Cognitiva',
    'Saúde Cardiovascular',
];

export const PerfilMedico: React.FC = () => {
    const { user: authUser, refreshUser } = useAuthUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Campos editáveis
    const [phone, setPhone] = useState('');
    const [rqe, setRqe] = useState('');
    const [bio, setBio] = useState('');
    const [clinicalFocus, setClinicalFocus] = useState<string[]>([]);
    const [consultationFee, setConsultationFee] = useState<number | ''>(350);
    const [consultationDurationMinutes, setConsultationDurationMinutes] = useState<number>(50);
    const [lattesUrl, setLattesUrl] = useState('');
    const [customTagInput, setCustomTagInput] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal de feedback
    const [modalConfig, setModalConfig] = useState<{
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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/users/profile/me');
                if (res.ok) {
                    const data: UserProfile = await res.json();
                    setProfile(data);
                    setPhone(data.phone || '');
                    setRqe(data.rqe || '');
                    setBio(data.bio || '');
                    setClinicalFocus(data.clinicalFocus || []);
                    setConsultationFee(data.consultationFee ?? 350);
                    setConsultationDurationMinutes(data.consultationDurationMinutes || 50);
                    setLattesUrl(data.lattesUrl || '');
                }
            } catch {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro de Conexão',
                    message: 'Não foi possível carregar as informações do seu perfil. Tente recarregar a página.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const toggleFocus = (tag: string) => {
        setClinicalFocus((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleAddCustomTag = () => {
        const trimmed = customTagInput.trim();
        if (!trimmed) return;
        if (!clinicalFocus.includes(trimmed)) {
            setClinicalFocus((prev) => [...prev, trimmed]);
        }
        setCustomTagInput('');
    };

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Arquivo Muito Grande',
                message: 'A foto de perfil não pode exceder 5 MB de tamanho.',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingAvatar(true);
        try {
            const res = await fetch('/api/users/profile/avatar', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setProfile((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : null));
                await refreshUser();
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Foto Atualizada!',
                    message: 'Sua foto de perfil foi alterada com sucesso.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha no Envio',
                    message: errData.message || 'Não foi possível atualizar a foto de perfil.',
                });
            }
        } catch {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Erro no Servidor',
                message: 'Ocorreu um erro ao conectar com o serviço de upload.',
            });
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: UpdateDoctorProfilePayload = {
            phone,
            rqe,
            bio,
            clinicalFocus,
            consultationFee: consultationFee === '' ? 0 : Number(consultationFee),
            consultationDurationMinutes,
            lattesUrl: lattesUrl.trim() || undefined,
        };

        try {
            const res = await fetch('/api/users/profile/doctor', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updated: UserProfile = await res.json();
                setProfile(updated);
                await refreshUser();
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: 'Perfil Atualizado!',
                    message: 'As informações profissionais do seu perfil foram salvas com sucesso no banco de dados.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro na Atualização',
                    message: errData.message || 'Não foi possível salvar as alterações. Verifique os campos informados.',
                });
            }
        } catch {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Falha ao salvar o perfil. Verifique sua conexão e tente novamente.',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
                    <p className="text-brown-medium font-medium">Carregando perfil profissional...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Cabeçalho de Navegação */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link
                        to="/medico/dashboard"
                        className="inline-flex items-center gap-2 text-brown-medium hover:text-brand-orange transition-colors font-medium text-sm w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao Consultório Virtual
                    </Link>
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Médico Homologado perante o CFM
                    </span>
                </div>

                {/* Banner de Identidade Visual e Foto */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar com Botão de Upload */}
                        <div className="relative group">
                            <div className="w-28 h-28 sm:w-32 sm:size-32 rounded-full overflow-hidden bg-brand-pot/20 border-4 border-white shadow-md flex items-center justify-center">
                                {profile?.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.fullName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-brown-light" />
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                title="Alterar foto de perfil"
                                aria-label="Alterar foto de perfil"
                                className="absolute bottom-1 right-1 p-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-50"
                            >
                                {uploadingAvatar ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4" />
                                )}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleAvatarSelect}
                            />
                        </div>

                        {/* Textos de Apresentação */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown-dark">
                                {profile?.fullName || authUser?.fullName}
                            </h1>
                            <p className="text-sm sm:text-base text-brown-medium mt-1">
                                Geriatria & Gerontologia • CRM {profile?.crm || authUser?.crm}/{profile?.ufCrm || authUser?.ufCrm}
                            </p>
                            <p className="text-xs text-brown-light mt-2 max-w-xl">
                                Sua foto e biografia serão exibidas na vitrine neutra de teleconsultas para agendamento pelos pacientes idosos e cuidadores familiares.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banner Regulatório Res. CFM nº 2.336/2023 */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm leading-relaxed">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <strong className="font-semibold block text-amber-950 mb-0.5">
                            Conformidade Ético-Médica (Resolução CFM nº 2.336/2023 — Publicidade Médica):
                        </strong>
                        As informações profissionais têm caráter estritamente educativo e informativo. A plataforma veda expressamente autopromoção sensacionalista, promessa infundada de cura ou exposição degradante do paciente.
                    </div>
                </div>

                {/* Formulário Principal */}
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Seção 1: Dados Imutáveis do CRM */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-5">
                        <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                            <Lock className="w-5 h-5 text-brown-medium" />
                            <h2 className="text-lg font-serif font-bold text-brown-dark">
                                Dados Cadastrais Regulatórios (Protegidos)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={profile?.fullName || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark text-sm cursor-not-allowed font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    CRM / UF
                                </label>
                                <input
                                    type="text"
                                    value={`${profile?.crm || ''} / ${profile?.ufCrm || ''}`}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark text-sm cursor-not-allowed font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    E-mail de Acesso
                                </label>
                                <input
                                    type="email"
                                    value={profile?.email || ''}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark text-sm cursor-not-allowed font-medium"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-brown-light flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            Campos oficiais vinculados à validação de credenciamento. Para alterações cadastrais, contate a auditoria da plataforma.
                        </p>
                    </div>

                    {/* Seção 2: Qualificação & Contato */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-5">
                        <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                            <Stethoscope className="w-5 h-5 text-brand-orange" />
                            <h2 className="text-lg font-serif font-bold text-brown-dark">
                                Qualificação Médica & Contato
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    WhatsApp / Telefone de Contato
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
                                    placeholder="(11) 98765-4321"
                                    maxLength={15}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    RQE (Registro de Especialista)
                                </label>
                                <input
                                    type="text"
                                    value={rqe}
                                    onChange={(e) => setRqe(e.target.value)}
                                    placeholder="Ex: RQE 45812"
                                    maxLength={30}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    Currículo Lattes (CNPq)
                                </label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 text-brown-light absolute left-3.5 top-3" />
                                    <input
                                        type="url"
                                        value={lattesUrl}
                                        onChange={(e) => setLattesUrl(e.target.value)}
                                        placeholder="https://lattes.cnpq.br/..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Apresentação e Foco Clínico */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-5">
                        <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                            <FileText className="w-5 h-5 text-brand-orange" />
                            <h2 className="text-lg font-serif font-bold text-brown-dark">
                                Apresentação & Especialidades Geriátricas
                            </h2>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider">
                                    Mini-Biografia / Trajetória Clínica
                                </label>
                                <span className="text-xs text-brown-light">
                                    {bio.length} / 1200 caracteres
                                </span>
                            </div>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value.slice(0, 1200))}
                                rows={4}
                                placeholder="Descreva sua formação, residência médica em Geriatria, anos de experiência e filosofia de cuidado humanizado com a pessoa idosa..."
                                className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none resize-none leading-relaxed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-2">
                                Áreas de Foco Clínico & Especialidades (Destaque na Vitrine)
                            </label>

                            {/* Tags Selecionadas */}
                            {clinicalFocus.length > 0 && (
                                <div className="mb-3">
                                    <span className="text-xs font-bold text-brown-dark block mb-2">
                                        Especialidades Ativas ({clinicalFocus.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {clinicalFocus.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-orange text-white shadow-xs"
                                            >
                                                ✓ {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleFocus(tag)}
                                                    className="hover:text-red-200 ml-1 font-bold cursor-pointer transition-colors"
                                                    title={`Remover tag ${tag}`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Campo para Adicionar Nova Tag Customizada */}
                            <div className="flex gap-2 items-center mb-3">
                                <input
                                    type="text"
                                    value={customTagInput}
                                    onChange={(e) => setCustomTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomTag();
                                        }
                                    }}
                                    placeholder="Digite outra especialidade (ex: Reumatologia Geriátrica, Cuidados Domiciliares)..."
                                    className="flex-1 px-4 py-2.5 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCustomTag}
                                    className="px-4 py-2.5 bg-brand-pot/20 hover:bg-brand-pot/40 text-brown-dark font-bold text-xs sm:text-sm rounded-xl transition-all border border-brand-pot/40 cursor-pointer shrink-0"
                                >
                                    + Adicionar Tag
                                </button>
                            </div>

                            {/* Sugestões Rápidas de Tags */}
                            {CLINICAL_FOCUS_OPTIONS.some((tag) => !clinicalFocus.includes(tag)) && (
                                <div>
                                    <span className="text-xs text-brown-light block mb-2">
                                        Sugestões mais procuradas por idosos e famílias:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {CLINICAL_FOCUS_OPTIONS.filter((tag) => !clinicalFocus.includes(tag)).map((tag) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleFocus(tag)}
                                                className="px-3 py-1 rounded-full text-xs font-medium bg-brand-light text-brown-medium hover:bg-brand-pot/20 border border-brand-pot/30 transition-all cursor-pointer"
                                            >
                                                + {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seção 4: Configuração de Teleconsultas & Honorários */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-5">
                        <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-lg font-serif font-bold text-brown-dark">
                                Honorários & Duração de Atendimento
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    Valor da Consulta (Honorários Brutos em R$)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-2.5 text-sm font-semibold text-brown-medium">
                                        R$
                                    </span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="10"
                                        value={consultationFee}
                                        onChange={(e) =>
                                            setConsultationFee(e.target.value === '' ? '' : Number(e.target.value))
                                        }
                                        placeholder="350.00"
                                        className="w-full pl-12 pr-4 py-2.5 bg-white border border-brand-pot/30 rounded-xl text-brown-dark text-base font-semibold focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>
                                <p className="text-xs text-brown-light mt-1.5">
                                    Split direto na captura: o valor líquido é depositado diretamente na sua conta bancária sem cobrança de comissões percentuais pela plataforma (CFM).
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-brown-medium uppercase tracking-wider mb-1.5">
                                    Duração Padrão do Atendimento
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[30, 45, 50, 60].map((mins) => (
                                        <button
                                            key={mins}
                                            type="button"
                                            onClick={() => setConsultationDurationMinutes(mins)}
                                            className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                                consultationDurationMinutes === mins
                                                    ? 'bg-brand-orange text-white shadow-xs'
                                                    : 'bg-brand-light text-brown-medium hover:bg-brand-pot/20 border border-brand-pot/30'
                                            }`}
                                        >
                                            <Clock className="w-3.5 h-3.5" />
                                            {mins} min
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-brown-light mt-1.5">
                                    Tempo estimado de atendimento padrão para organização dos horários na sua agenda.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Barra de Ação Inferior */}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <Link
                            to="/medico/dashboard"
                            className="px-6 py-3 rounded-full text-sm font-semibold text-brown-medium hover:bg-white transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-brand-orange hover:bg-orange-600 text-white rounded-full font-semibold text-sm shadow-md transition-all hover:shadow-lg focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações do Perfil'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <FeedbackModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
