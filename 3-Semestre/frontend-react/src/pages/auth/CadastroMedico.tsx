import { useState, useEffect } from 'react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { applyCpfMask, applyPhoneMask, applyCrmMask, applyUfMask } from '../../utils/masks';
import { ProgressBar } from '../../components/auth/ProgressBar';
import { FeedbackModal } from '../../components/common/FeedbackModal';

const doctorSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(6, 'Mínimo de 6 caracteres.'),
    confirmPassword: z.string(),

    fullName: z.string()
        .min(5, 'Nome muito curto.')
        .refine((name) => name.trim().split(/\s+/).length >= 2, 'Por favor, insira nome e sobrenome.'),
    cpf: z.string().min(14, 'CPF incompleto.'),
    phone: z.string().min(14, 'Telefone incompleto.'),

    crm: z.string().min(4, 'CRM inválido.'),
    ufCrm: z.string().length(2, 'Insira a UF.'),

    termsAccepted: z.boolean().refine((val) => val === true, 'Você precisa aceitar os termos de responsabilidade médica.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
});

type DoctorFormInputs = z.infer<typeof doctorSchema>;

export function CadastroMedico() {
    const navigate = useNavigate();
    const { isAuthenticated, dashboardPath } = useAuthUser();

    useEffect(() => {
        if (isAuthenticated) {
            navigate(dashboardPath);
        }
    }, [isAuthenticated, dashboardPath, navigate]);
    const [step, setStep] = useState(1);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const {
        register,
        handleSubmit,
        trigger,
        getValues,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<DoctorFormInputs>({
        resolver: zodResolver(doctorSchema),
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof DoctorFormInputs)[] = [];
        if (step === 1) fieldsToValidate = ['email', 'password', 'confirmPassword'];
        if (step === 2) fieldsToValidate = ['fullName', 'cpf', 'phone', 'crm', 'ufCrm'];

        const isStepValid = await trigger(fieldsToValidate);

        if (step === 1 && isStepValid) {
            const senha = getValues('password');
            const confirmacao = getValues('confirmPassword');
            if (senha !== confirmacao) {
                setError('confirmPassword', { type: 'manual', message: 'As senhas não coincidem.' });
                return;
            }

            setIsCheckingEmail(true);
            try {
                const emailVal = getValues('email');
                const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailVal)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (!data.available) {
                        setError('email', {
                            type: 'manual',
                            message: data.message || 'Este e-mail já está em uso.',
                        });
                        setIsCheckingEmail(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('Erro ao verificar disponibilidade de e-mail:', err);
            } finally {
                setIsCheckingEmail(false);
            }
        }

        if (isStepValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const onSubmit = async (data: DoctorFormInputs) => {
        try {
            const response = await fetch('/api/auth/register-doctor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsSuccessModalOpen(true);
            } else {
                const errorMsg = await response.text();
                setError('root', {
                    type: 'server',
                    message: errorMsg || 'Ocorreu um erro ao processar o cadastro.',
                });
            }
        } catch (error) {
            setError('root', {
                type: 'network',
                message: 'Falha na comunicação com o servidor. Tente novamente mais tarde.',
            });
        }
    };

    const { onChange: cpfOnChange, ...cpfRegister } = register('cpf');
    const { onChange: phoneOnChange, ...phoneRegister } = register('phone');
    const { onChange: crmOnChange, ...crmRegister } = register('crm');
    const { onChange: ufOnChange, ...ufRegister } = register('ufCrm');

    return (
        <div className="w-full animate-fade-in py-4">
            <div className="text-center md:text-left mb-6">
                <h2 className="text-3xl font-bold text-brand-mint mb-2">Cadastro de Especialista</h2>
                <p className="text-brown">Junte-se à plataforma geriatra e abra seu consultório virtual.</p>
            </div>

            <ProgressBar currentStep={step} theme="mint" ariaLabel={`Passo ${step} de 3 do cadastro de especialista`} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* === ETAPA 1: ACESSO === */}
                {step === 1 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">1. Dados de Acesso</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">E-mail Profissional</label>
                            <input
                                type="email"
                                placeholder="dr@email.com"
                                className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                {...register('email')}
                            />
                            {errors.email && (
                                <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.email.message}</span></p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Senha</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-light hover:text-brown-dark transition-colors focus:outline-none"
                                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.password.message}</span></p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Confirme sua Senha</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Digite a senha novamente"
                                    className="w-full pl-4 pr-12 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                    {...register('confirmPassword')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brown-light hover:text-brown-dark transition-colors focus:outline-none"
                                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Exibir senha'}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.confirmPassword.message}</span></p>
                            )}
                        </div>
                    </div>
                )}

                {/* === ETAPA 2: DADOS PROFISSIONAIS === */}
                {step === 2 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">2. Identificação Profissional</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Nome Completo</label>
                            <input
                                type="text"
                                placeholder="Nome e sobrenome"
                                className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                {...register('fullName')}
                            />
                            {errors.fullName && (
                                <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.fullName.message}</span></p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">CPF</label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                    {...cpfRegister}
                                    onChange={(e) => {
                                        e.target.value = applyCpfMask(e.target.value);
                                        cpfOnChange(e);
                                    }}
                                />
                                {errors.cpf && (
                                    <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.cpf.message}</span></p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">Celular (WhatsApp)</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                    {...phoneRegister}
                                    onChange={(e) => {
                                        e.target.value = applyPhoneMask(e.target.value);
                                        phoneOnChange(e);
                                    }}
                                />
                                {errors.phone && (
                                    <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.phone.message}</span></p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-brown-dark mb-1">CRM</label>
                                <input
                                    type="text"
                                    placeholder="Apenas números"
                                    className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none"
                                    {...crmRegister}
                                    onChange={(e) => {
                                        e.target.value = applyCrmMask(e.target.value);
                                        crmOnChange(e);
                                    }}
                                />
                                {errors.crm && (
                                    <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.crm.message}</span></p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">Estado (UF)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: SP"
                                    className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none text-center"
                                    {...ufRegister}
                                    onChange={(e) => {
                                        e.target.value = applyUfMask(e.target.value);
                                        ufOnChange(e);
                                    }}
                                />
                                {errors.ufCrm && (
                                    <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.ufCrm.message}</span></p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-brown italic">Obs: Para conformidade com a Resolução CFM nº 2.314/2022 e segurança dos pacientes, após a conclusão do pré-cadastro você enviará os documentos do Dossiê de Credenciamento no painel para liberação do consultório.</p>
                    </div>
                )}

                {/* === ETAPA 3: CONSENTIMENTOS === */}
                {step === 3 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">3. Responsabilidades Legais</h3>
                        <p className="text-brown text-sm">Para atender na Active Age, você deve estar ciente das regras do Conselho Federal de Medicina.</p>

                        <label className="flex items-start gap-3 p-4 border border-brand-pot/50 rounded-xl bg-brand-pot/5 cursor-pointer hover:bg-brand-mint/10 transition-colors">
                            <input
                                type="checkbox"
                                className="mt-1 w-5 h-5 accent-brand-mint"
                                {...register('termsAccepted')}
                            />
                            <span className="text-sm text-brown-dark">
                                Declaro que as informações fornecidas são verdadeiras, estou com o CRM ativo, aceito os{' '}
                                <Link to="/termos" target="_blank" className="text-brand-mint font-bold hover:underline">
                                    Termos de Uso
                                </Link>{' '}
                                e a{' '}
                                <Link to="/privacidade" target="_blank" className="text-brand-mint font-bold hover:underline">
                                    Política de Privacidade
                                </Link>, e estou ciente da obrigatoriedade do envio do Dossiê de Credenciamento e comprovação de Certificado ICP-Brasil para atuação em telemedicina (Res. CFM nº 2.314/2022).
                            </span>
                        </label>
                        {errors.termsAccepted && (
                            <p className="text-red-600 text-sm mt-1.5 font-bold flex items-center gap-1.5 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0 text-red-600" /><span>{errors.termsAccepted.message}</span></p>
                        )}

                        {errors.root && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg font-bold border border-red-200 text-sm text-center">
                                {errors.root.message}
                            </div>
                        )}
                    </div>
                )}

                {/* === BOTÕES === */}
                <div className="flex gap-4 pt-6 mt-4 border-t border-brand-pot/30">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="btn-secondary w-1/3 flex justify-center items-center gap-2 py-4"
                        >
                            <ArrowLeft size={20} /> Voltar
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={isCheckingEmail}
                            className={`bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold rounded-xl transition-all flex justify-center items-center gap-2 py-4 ${step === 1 ? 'w-full' : 'w-2/3'} disabled:opacity-70`}
                        >
                            {isCheckingEmail ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Verificando...
                                </>
                            ) : (
                                <>
                                    Próximo <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold rounded-xl transition-all w-2/3 flex justify-center items-center gap-2 py-4 disabled:opacity-70"
                        >
                            {isSubmitting ? 'Registrando...' : 'Finalizar Pré-Cadastro'}
                        </button>
                    )}
                </div>

            </form>

            <FeedbackModal
                isOpen={isSuccessModalOpen}
                type="success"
                title="Pré-Cadastro Realizado com Sucesso!"
                message="Seu acesso ao Active Age foi registrado! Para habilitar seu consultório virtual e emitir prescrições válidas conforme a Resolução CFM nº 2.314/2022, faça login e envie os documentos do seu Dossiê de Credenciamento."
                confirmText="Fazer Login Agora"
                onConfirm={() => navigate('/login')}
            />
        </div>
    );
}
