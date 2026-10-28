import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Camera,
    HeartHandshake,
    Home,
    Loader2,
    Lock,
    MapPin,
    Phone,
    Shield,
    User,
    Users,
} from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import type { FeedbackModalType } from '../../components/common/FeedbackModal';
import type { UserProfile, UpdatePatientProfilePayload } from '../../types/profile';
import { applyCepMask, applyPhoneMask } from '../../utils/masks';

export const PerfilPaciente: React.FC = () => {
    const { user: authUser, refreshUser } = useAuthUser();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState<'pessoal' | 'endereco' | 'cuidador' | 'saude'>('pessoal');

    // Campos: Pessoais
    const [phone, setPhone] = useState('');

    // Campos: Endereço
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [uf, setUf] = useState('');

    // Campos: Cuidador Familiar
    const [hasCaregiver, setHasCaregiver] = useState(false);
    const [caregiverName, setCaregiverName] = useState('');
    const [caregiverPhone, setCaregiverPhone] = useState('');
    const [relationship, setRelationship] = useState('Filho(a)');

    // Campos: Ficha Básica de Saúde
    const [bloodType, setBloodType] = useState('');
    const [allergies, setAllergies] = useState('');
    const [chronicConditions, setChronicConditions] = useState('');
    const [regularMedications, setRegularMedications] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal de Feedback Acessível
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

                    if (data.address) {
                        setCep(data.address.cep || '');
                        setLogradouro(data.address.logradouro || '');
                        setNumero(data.address.numero || '');
                        setComplemento(data.address.complemento || '');
                        setBairro(data.address.bairro || '');
                        setCidade(data.address.cidade || '');
                        setUf(data.address.uf || '');
                    }

                    if (data.caregiver) {
                        setHasCaregiver(data.caregiver.hasCaregiver || false);
                        setCaregiverName(data.caregiver.caregiverName || '');
                        setCaregiverPhone(data.caregiver.caregiverPhone || '');
                        setRelationship(data.caregiver.relationship || 'Filho(a)');
                    }

                    if (data.healthSummary) {
                        setBloodType(data.healthSummary.bloodType || '');
                        setAllergies(data.healthSummary.allergies || '');
                        setChronicConditions(data.healthSummary.chronicConditions || '');
                        setRegularMedications(data.healthSummary.regularMedications || '');
                    }
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

    // Consulta de CEP para preenchimento ágil e acessível
    const handleCepBlur = async () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                if (res.ok) {
                    const data = await res.json();
                    if (!data.erro) {
                        setLogradouro(data.logradouro || '');
                        setBairro(data.bairro || '');
                        setCidade(data.localidade || '');
                        setUf(data.uf || '');
                    }
                }
            } catch {
                // Preenchimento manual permanece disponível
            }
        }
    };

    const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Foto Muito Grande',
                message: 'A foto não pode ultrapassar 5 MB. Por favor, escolha outra foto.',
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
                    message: 'Sua foto foi adicionada com sucesso ao seu cadastro!',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha no Envio',
                    message: errData.message || 'Não conseguimos salvar a foto selecionada.',
                });
            }
        } catch {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Ocorreu um erro ao enviar sua foto. Verifique a internet e tente novamente.',
            });
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const payload: UpdatePatientProfilePayload = {
            phone,
            address: {
                cep,
                logradouro,
                numero,
                complemento,
                bairro,
                cidade,
                uf,
            },
            caregiver: {
                hasCaregiver,
                caregiverName: hasCaregiver ? caregiverName : '',
                caregiverPhone: hasCaregiver ? caregiverPhone : '',
                relationship: hasCaregiver ? relationship : '',
            },
            healthSummary: {
                bloodType,
                allergies,
                chronicConditions,
                regularMedications,
            },
        };

        try {
            const res = await fetch('/api/users/profile/patient', {
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
                    title: 'Perfil Salvo com Sucesso!',
                    message: 'Seus dados e informações de apoio foram atualizados com segurança.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro ao Salvar',
                    message: errData.message || 'Verifique se todos os campos foram preenchidos corretamente.',
                });
            }
        } catch {
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Não foi possível salvar as alterações. Tente novamente mais tarde.',
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
                    <p className="text-brown-medium font-medium text-lg">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Cabeçalho Superior de Navegação */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/paciente/dashboard"
                        className="inline-flex items-center gap-2 text-brown-medium hover:text-brand-orange font-semibold text-base py-2 px-3 rounded-xl hover:bg-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Meu Espaço
                    </Link>
                    <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        Ambiente Seguro LGPD
                    </span>
                </div>

                {/* Cartão de Boas-Vindas & Foto */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="relative group">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-brand-pot/20 border-4 border-white shadow-md flex items-center justify-center">
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
                                title="Trocar foto de perfil"
                                aria-label="Trocar foto de perfil"
                                className="absolute bottom-1 right-1 p-3 bg-brand-orange hover:bg-orange-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-50 cursor-pointer"
                            >
                                {uploadingAvatar ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5" />
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

                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brown-dark">
                                {profile?.fullName || authUser?.fullName}
                            </h1>
                            <p className="text-brown-medium text-sm sm:text-base mt-1">
                                {profile?.email || authUser?.email}
                            </p>
                            <p className="text-xs text-brown-light mt-2 max-w-lg">
                                Mantenha seu endereço e o contato do seu cuidador sempre atualizados para o envio seguro de receitas digitais e apoio no atendimento.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Abas Táteis Ampliadas para Acessibilidade (WCAG 2.1 AA) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/70 p-1.5 rounded-2xl border border-brand-pot/20">
                    <button
                        type="button"
                        onClick={() => setActiveTab('pessoal')}
                        className={`py-3 px-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'pessoal'
                                ? 'bg-brand-orange text-white shadow-xs'
                                : 'text-brown-medium hover:bg-white hover:text-brown-dark'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        Identificação
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('endereco')}
                        className={`py-3 px-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'endereco'
                                ? 'bg-brand-orange text-white shadow-xs'
                                : 'text-brown-medium hover:bg-white hover:text-brown-dark'
                        }`}
                    >
                        <Home className="w-4 h-4" />
                        Endereço
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('cuidador')}
                        className={`py-3 px-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'cuidador'
                                ? 'bg-brand-orange text-white shadow-xs'
                                : 'text-brown-medium hover:bg-white hover:text-brown-dark'
                        }`}
                    >
                        <HeartHandshake className="w-4 h-4" />
                        Cuidador / Apoio
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('saude')}
                        className={`py-3 px-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activeTab === 'saude'
                                ? 'bg-brand-orange text-white shadow-xs'
                                : 'text-brown-medium hover:bg-white hover:text-brown-dark'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        Ficha de Saúde
                    </button>
                </div>

                {/* Formulário com Abas de Conteúdo */}
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Aba 1: Dados Pessoais */}
                    {activeTab === 'pessoal' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-6 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                                <Lock className="w-5 h-5 text-brown-medium" />
                                <h2 className="text-xl font-serif font-bold text-brown-dark">
                                    Dados Cadastrais Protegidos
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.fullName || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark font-medium cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        CPF do Titular
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.cpf || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark font-medium cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Data de Nascimento
                                    </label>
                                    <input
                                        type="text"
                                        value={profile?.birthDate || ''}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-brown-dark font-medium cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        WhatsApp / Celular de Contato
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-5 h-5 text-brown-light absolute left-3.5 top-3.5" />
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
                                            placeholder="(11) 98765-4321"
                                            maxLength={15}
                                            className="w-full pl-11 pr-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-brown-light flex items-center gap-1.5 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                                Nome e CPF são vinculados à validação de identidade e protegidos contra alterações diretas.
                            </p>
                        </div>
                    )}

                    {/* Aba 2: Endereço Residencial */}
                    {activeTab === 'endereco' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-6 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                                <MapPin className="w-5 h-5 text-brand-orange" />
                                <h2 className="text-xl font-serif font-bold text-brown-dark">
                                    Endereço Residencial para Receitas Médicas
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        CEP
                                    </label>
                                    <input
                                        type="text"
                                        value={cep}
                                        onChange={(e) => setCep(applyCepMask(e.target.value))}
                                        onBlur={handleCepBlur}
                                        placeholder="00000-000"
                                        maxLength={9}
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                    <span className="text-xs text-brown-light mt-1 block">
                                        Preencha o CEP para autocompletar.
                                    </span>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Rua / Logradouro
                                    </label>
                                    <input
                                        type="text"
                                        value={logradouro}
                                        onChange={(e) => setLogradouro(e.target.value)}
                                        placeholder="Ex: Avenida Paulista"
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Número
                                    </label>
                                    <input
                                        type="text"
                                        value={numero}
                                        onChange={(e) => setNumero(e.target.value)}
                                        placeholder="123"
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Complemento (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={complemento}
                                        onChange={(e) => setComplemento(e.target.value)}
                                        placeholder="Apto 42, Bloco B"
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Bairro
                                    </label>
                                    <input
                                        type="text"
                                        value={bairro}
                                        onChange={(e) => setBairro(e.target.value)}
                                        placeholder="Bela Vista"
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Cidade
                                    </label>
                                    <input
                                        type="text"
                                        value={cidade}
                                        onChange={(e) => setCidade(e.target.value)}
                                        placeholder="São Paulo"
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Estado (UF)
                                    </label>
                                    <input
                                        type="text"
                                        value={uf}
                                        onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))}
                                        placeholder="SP"
                                        maxLength={2}
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium uppercase focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aba 3: Cuidador / Apoio Familiar */}
                    {activeTab === 'cuidador' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-6 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                                <Users className="w-5 h-5 text-brand-orange" />
                                <h2 className="text-xl font-serif font-bold text-brown-dark">
                                    Cuidador ou Familiar Responsável de Apoio
                                </h2>
                            </div>

                            <div className="bg-brand-light p-4 rounded-2xl border border-brand-pot/20 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-brown-dark text-base">
                                        Você possui um cuidador ou familiar que lhe acompanha?
                                    </h3>
                                    <p className="text-xs text-brown-medium mt-0.5">
                                        Importante para teleconsultas e comunicação rápida com a família.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasCaregiver}
                                        onChange={(e) => setHasCaregiver(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-orange"></div>
                                </label>
                            </div>

                            {hasCaregiver && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                            Nome do Cuidador / Familiar
                                        </label>
                                        <input
                                            type="text"
                                            value={caregiverName}
                                            onChange={(e) => setCaregiverName(e.target.value)}
                                            placeholder="Nome completo do familiar ou profissional"
                                            className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                            Grau de Parentesco / Vínculo
                                        </label>
                                        <select
                                            value={relationship}
                                            onChange={(e) => setRelationship(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                        >
                                            <option value="Filho(a)">Filho(a)</option>
                                            <option value="Cônjuge">Cônjuge</option>
                                            <option value="Neto(a)">Neto(a)</option>
                                            <option value="Cuidador Profissional">Cuidador Profissional</option>
                                            <option value="Irmão / Irmã">Irmão / Irmã</option>
                                            <option value="Outro Familiar">Outro Familiar</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                            WhatsApp de Emergência do Cuidador
                                        </label>
                                        <input
                                            type="text"
                                            value={caregiverPhone}
                                            onChange={(e) => setCaregiverPhone(applyPhoneMask(e.target.value))}
                                            placeholder="(11) 98765-4321"
                                            maxLength={15}
                                            className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Aba 4: Ficha Básica de Saúde Declarada */}
                    {activeTab === 'saude' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-brand-pot/20 space-y-6 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 border-b border-brand-pot/10 pb-4">
                                <Activity className="w-5 h-5 text-brand-orange" />
                                <h2 className="text-xl font-serif font-bold text-brown-dark">
                                    Ficha Clínica Preliminar (Opcional)
                                </h2>
                            </div>

                            <p className="text-sm text-brown-medium leading-relaxed">
                                Estas informações são sigilosas e visam auxiliar o médico geriatra na preparação prévia da sua teleconsulta.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Tipo Sanguíneo
                                    </label>
                                    <select
                                        value={bloodType}
                                        onChange={(e) => setBloodType(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    >
                                        <option value="">Não informado</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Alergias Conhecidas (Medicamentos ou Alimentos)
                                    </label>
                                    <input
                                        type="text"
                                        value={allergies}
                                        onChange={(e) => setAllergies(e.target.value)}
                                        placeholder="Ex: Dipirona, Penicilina, Frutos do mar..."
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Condições de Saúde Pré-existentes
                                    </label>
                                    <input
                                        type="text"
                                        value={chronicConditions}
                                        onChange={(e) => setChronicConditions(e.target.value)}
                                        placeholder="Ex: Hipertensão arterial, Diabetes tipo 2, Osteoporose..."
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-semibold text-brown-medium mb-1.5">
                                        Medicamentos em Uso Contínuo
                                    </label>
                                    <textarea
                                        value={regularMedications}
                                        onChange={(e) => setRegularMedications(e.target.value)}
                                        rows={3}
                                        placeholder="Ex: Losartana 50mg (1x ao dia), Metformina 850mg (2x ao dia)..."
                                        className="w-full px-4 py-3 bg-white border border-brand-pot/30 rounded-xl text-brown-dark font-medium focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Barra de Ação Inferior */}
                    <div className="flex justify-end items-center gap-4 pt-4">
                        <Link
                            to="/paciente/dashboard"
                            className="px-6 py-3.5 rounded-full text-base font-semibold text-brown-medium hover:bg-white transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3.5 bg-brand-orange hover:bg-orange-600 text-white rounded-full font-semibold text-base shadow-md transition-all hover:shadow-lg focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Salvando Alterações...
                                </>
                            ) : (
                                'Salvar Minhas Informações'
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
