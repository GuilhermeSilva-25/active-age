import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    RefreshCw,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    UserCheck,
    UserX,
    Award
} from 'lucide-react';
import type { UserItemResponse, UserRole } from '../../types/admin';
import { FeedbackModal } from '../../components/common/FeedbackModal';

export function AdminUsuarios() {
    const [users, setUsers] = useState<UserItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para moderação de status
    const [userToToggle, setUserToToggle] = useState<UserItemResponse | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [toggleReason, setToggleReason] = useState('');
    const [processingToggle, setProcessingToggle] = useState(false);

    // Feedback Modal
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter !== 'ALL') params.append('role', roleFilter);
            if (statusFilter === 'ACTIVE') params.append('active', 'true');
            if (statusFilter === 'INACTIVE') params.append('active', 'false');

            const url = `/api/admin/users${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url);
            if (res.ok) {
                const data: UserItemResponse[] = await res.json();
                setUsers(data);
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha ao carregar',
                    message: 'Não foi possível carregar a listagem de usuários.',
                });
            }
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [roleFilter, statusFilter]);

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.cpf && u.cpf.includes(searchTerm)) ||
            (u.crm && u.crm.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const handlePromptToggleStatus = (user: UserItemResponse) => {
        setUserToToggle(user);
        setToggleReason('');
        setIsConfirmModalOpen(true);
    };

    const handleExecuteToggleStatus = async () => {
        if (!userToToggle) return;
        setProcessingToggle(true);

        const newStatus = !userToToggle.active;
        try {
            const res = await fetch(`/api/admin/users/${userToToggle.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    active: newStatus,
                    reason: toggleReason.trim() || undefined,
                }),
            });

            if (res.ok) {
                await loadUsers();
                setIsConfirmModalOpen(false);
                setFeedback({
                    isOpen: true,
                    type: newStatus ? 'success' : 'warning',
                    title: newStatus ? 'Conta Reativada!' : 'Conta Inativada!',
                    message: newStatus
                        ? `A conta de ${userToToggle.fullName} foi reativada com sucesso. A operação foi registrada em audit_logs.`
                        : `A conta de ${userToToggle.fullName} foi inativada. O usuário foi impedido de efetuar login. A operação foi registrada em audit_logs.`,
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Operação Bloqueada',
                    message: errData.message || 'Não foi possível alterar o status do usuário.',
                });
            }
        } catch (err) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Falha ao se comunicar com o servidor.',
            });
        } finally {
            setProcessingToggle(false);
            setUserToToggle(null);
        }
    };

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'ROLE_ADMIN':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                );
            case 'ROLE_MEDICO':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-mint/20 text-brown-dark border border-brand-mint/40">
                        <Award className="w-3 h-3 text-brand-mint" /> Médico
                    </span>
                );
            case 'ROLE_PACIENTE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        Paciente / Cuidador
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            
            {/* Header da Página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-brown-dark flex items-center gap-2.5 sm:gap-3">
                        <Users className="w-7 h-7 sm:w-8 sm:h-8 text-brand-orange shrink-0" />
                        <span>Gestão de Usuários & Moderação</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-brown mt-1">
                        Controle perimetral de contas, segregação de papéis RBAC e moderação de acesso à plataforma.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadUsers}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-pot/40 rounded-xl text-xs font-bold text-brown hover:text-brown-dark hover:bg-brand-pot/10 transition-colors shadow-xs"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Atualizar Lista</span>
                </button>
            </div>

            {/* Painel de Filtros e Busca */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-pot/30 shadow-sm space-y-3 sm:space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
                    
                    {/* Tabs por Papel (Role) */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
                        {[
                            { label: 'Todos os Perfis', value: 'ALL' },
                            { label: 'Pacientes', value: 'ROLE_PACIENTE' },
                            { label: 'Médicos', value: 'ROLE_MEDICO' },
                            { label: 'Administradores', value: 'ROLE_ADMIN' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setRoleFilter(tab.value)}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    roleFilter === tab.value
                                        ? 'bg-brand-orange text-white shadow-xs'
                                        : 'bg-brand-pot/10 text-brown hover:bg-brand-pot/20 hover:text-brown-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filtro de Status e Busca */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-brand-pot/40 text-xs text-brown-dark font-medium bg-brand-pot/5 outline-none focus:border-brand-orange"
                        >
                            <option value="ALL">Status: Todos</option>
                            <option value="ACTIVE">Apenas Ativos</option>
                            <option value="INACTIVE">Apenas Inativos</option>
                        </select>

                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brown" />
                            <input
                                type="text"
                                placeholder="Nome, E-mail, CPF, CRM..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-pot/40 text-xs text-brown-dark focus:border-brand-orange outline-none bg-brand-pot/5"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Tabela de Usuários */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/30 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 sm:p-16 flex items-center justify-center gap-3 text-brown font-bold text-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                        Carregando usuários...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 sm:p-16 text-center text-brown space-y-2">
                        <Users className="w-12 h-12 text-brand-pot/50 mx-auto" />
                        <p className="font-bold text-base text-brown-dark">Nenhum usuário localizado.</p>
                        <p className="text-xs text-brown">Tente ajustar seus termos de pesquisa ou filtros.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[750px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-pot/30 bg-brand-pot/10 text-[11px] font-bold text-brown uppercase tracking-wider">
                                    <th className="py-3.5 px-4 sm:px-6">Usuário</th>
                                    <th className="py-3.5 px-4 sm:px-6">Perfil RBAC</th>
                                    <th className="py-3.5 px-4 sm:px-6">Identificação</th>
                                    <th className="py-3.5 px-4 sm:px-6">Status da Conta</th>
                                    <th className="py-3.5 px-4 sm:px-6">Data de Cadastro</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Moderação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-pot/20 text-xs text-brown-dark">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-brand-pot/5 transition-colors">
                                        <td className="py-3.5 px-4 sm:px-6">
                                            <div className="font-bold text-sm text-brown-dark">{user.fullName}</div>
                                            <div className="text-brown text-[11px]">{user.email}</div>
                                            {user.phone && <div className="text-brown/70 text-[10px]">{user.phone}</div>}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 font-medium">
                                            {user.role === 'ROLE_MEDICO' ? (
                                                <span className="text-brown-dark font-bold">
                                                    CRM: {user.crm || 'N/A'}/{user.ufCrm || ''}
                                                </span>
                                            ) : (
                                                <span className="text-brown">
                                                    CPF: {user.cpf || 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            {user.active ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                    <XCircle className="w-3.5 h-3.5" /> Inativo
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 text-brown">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handlePromptToggleStatus(user)}
                                                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ml-auto whitespace-nowrap ${
                                                    user.active
                                                        ? 'border border-red-200 text-red-700 hover:bg-red-50'
                                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                                                }`}
                                            >
                                                {user.active ? (
                                                    <>
                                                        <UserX className="w-3.5 h-3.5" /> Inativar
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserCheck className="w-3.5 h-3.5" /> Reativar
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação de Alteração de Status */}
            {isConfirmModalOpen && userToToggle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-dark/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-brand-pot/50 space-y-5">
                        <div className="flex items-center gap-3">
                            <span className={`p-3 rounded-2xl ${userToToggle.active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {userToToggle.active ? <UserX className="w-6 h-6" /> : <UserCheck className="w-6 h-6" />}
                            </span>
                            <div>
                                <h3 className="font-bold text-lg text-brown-dark">
                                    {userToToggle.active ? 'Inativar Conta de Usuário' : 'Reativar Conta de Usuário'}
                                </h3>
                                <p className="text-xs text-brown">{userToToggle.fullName} ({userToToggle.email})</p>
                            </div>
                        </div>

                        <p className="text-xs text-brown leading-relaxed">
                            {userToToggle.active
                                ? 'Ao inativar esta conta, o usuário será imediatamente impedido de autenticar na plataforma. Caso seja um médico, seus horários não serão exibidos aos pacientes.'
                                : 'Ao reativar esta conta, o usuário voltará a ter permissão de acesso normal às funcionalidades permitidas para o seu perfil.'}
                        </p>

                        <div>
                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                Motivo / Justificativa Administrativa (Opcional):
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Ex: Suspensão preventiva a pedido do suporte..."
                                value={toggleReason}
                                onChange={(e) => setToggleReason(e.target.value)}
                                className="w-full p-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange outline-none text-xs text-brown-dark bg-brand-pot/5"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    setUserToToggle(null);
                                }}
                                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-brown hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteToggleStatus}
                                disabled={processingToggle}
                                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-70 ${
                                    userToToggle.active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {processingToggle ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando...
                                    </>
                                ) : (
                                    userToToggle.active ? 'Confirmar Inativação' : 'Confirmar Reativação'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback({ ...feedback, isOpen: false })}
            />

        </div>
    );
}
