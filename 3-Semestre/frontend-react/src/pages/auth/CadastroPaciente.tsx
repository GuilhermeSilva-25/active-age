import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router-dom';
import {ArrowRight, ArrowLeft} from 'lucide-react';
import {applyCpfMask, applyPhoneMask} from '../../utils/masks';
import {ProgressBar} from '../../components/auth/ProgressBar';

const patientSchema = z.object({
    email: z.string().email('E-mail inválido.'),
    password: z.string().min(6, 'Mínimo de 6 caracteres.'),
    confirmPassword: z.string(),

    fullName: z.string()
        .min(5, 'Nome muito curto.')
        .refine((name) => name.trim().split(/\s+/).length >= 2, 'Por favor, insira nome e sobrenome.'),

    cpf: z.string().min(14, 'CPF incompleto.'),

    birthDate: z.string().min(1, 'Data de nascimento é obrigatória.').refine((dateString) => {
        const dataNasc = new Date(dateString);
        if (isNaN(dataNasc.getTime())) return false;

        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mes = hoje.getMonth() - dataNasc.getMonth();

        if (mes < 0 || (mes === 0 && hoje.getDate() < dataNasc.getDate())) {
            idade--;
        }
        return idade >= 18 && idade <= 130;
    }, 'O paciente deve ter 18 anos ou mais.'),

    phone: z.string().min(14, 'Telefone incompleto.'),
    termsAccepted: z.boolean().refine((val) => val === true, 'Você precisa aceitar os termos e a política da plataforma.'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});

type PatientFormInputs = z.infer<typeof patientSchema>;

export function CadastroPaciente() {
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        getValues,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<PatientFormInputs>({
        resolver: zodResolver(patientSchema),
    });

    const nextStep = async () => {
        let fieldsToValidate: (keyof PatientFormInputs)[] = [];
        if (step === 1) fieldsToValidate = ['email', 'password', 'confirmPassword'];
        if (step === 2) fieldsToValidate = ['fullName', 'cpf', 'birthDate', 'phone'];

        const isStepValid = await trigger(fieldsToValidate);

        if (step === 1 && isStepValid) {
            const senha = getValues('password');
            const confirmacao = getValues('confirmPassword');

            if (senha !== confirmacao) {
                setError('confirmPassword', {type: 'manual', message: 'As senhas não coincidem.'});
                return;
            }
        }

        if (isStepValid) {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    const onSubmit = async (data: PatientFormInputs) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Dados formatados para o Java Spring:', data);
        alert("Cadastro simulado com sucesso!");
    };

    const {onChange: cpfOnChange, ...cpfRegister} = register('cpf');
    const {onChange: phoneOnChange, ...phoneRegister} = register('phone');

    return (
        <div className="w-full animate-fade-in py-4">
            <div className="text-center md:text-left mb-6">
                <h2 className="text-3xl font-bold text-brown-dark mb-2">Cadastro de Paciente</h2>
                <p className="text-brown">Preencha seus dados para começar a agendar teleconsultas.</p>
            </div>

            <ProgressBar currentStep={step} theme="orange" ariaLabel={`Passo ${step} de 3 do cadastro`} />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* === ETAPA 1 === */}
                {step === 1 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-orange border-b border-brand-pot/50 pb-2">1. Dados de
                            Acesso</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">E-mail</label>
                            <input type="email" placeholder="seu@email.com"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none" {...register('email')} />
                            {errors.email &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Senha</label>
                            <input type="password" placeholder="Mínimo 6 caracteres"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none" {...register('password')} />
                            {errors.password &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Confirme sua Senha</label>
                            <input type="password" placeholder="Digite a senha novamente"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none" {...register('confirmPassword')} />
                            {errors.confirmPassword &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>
                )}

                {/* === ETAPA 2 (Com Máscaras e Validações) === */}
                {step === 2 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-orange border-b border-brand-pot/50 pb-2">2. Informações
                            Pessoais</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Nome Completo</label>
                            <input type="text" placeholder="Nome e sobrenome"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none" {...register('fullName')} />
                            {errors.fullName &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.fullName.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">CPF</label>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none"
                                    {...cpfRegister}
                                    onChange={(e) => {
                                        e.target.value = applyCpfMask(e.target.value);
                                        cpfOnChange(e); // Avisa o React Hook Form sobre a mudança
                                    }}
                                />
                                {errors.cpf &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.cpf.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">Nascimento</label>
                                <input type="date"
                                       className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none text-brown" {...register('birthDate')} />
                                {errors.birthDate &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.birthDate.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Celular / WhatsApp</label>
                            <input
                                type="tel"
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/20 outline-none"
                                {...phoneRegister}
                                onChange={(e) => {
                                    e.target.value = applyPhoneMask(e.target.value);
                                    phoneOnChange(e);
                                }}
                            />
                            {errors.phone &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.phone.message}</p>}
                        </div>
                    </div>
                )}

                {/* === ETAPA 3 === */}
                {step === 3 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-orange border-b border-brand-pot/50 pb-2">3. Privacidade e
                            Segurança</h3>
                        <p className="text-brown text-sm">Para finalizar e acessar a plataforma, precisamos do seu
                            consentimento legal.</p>

                        <label
                            className="flex items-start gap-3 p-4 border border-brand-pot/50 rounded-xl bg-brand-pot/5 cursor-pointer hover:bg-brand-orange/5 transition-colors">
                            <input type="checkbox"
                                   className="mt-1 w-5 h-5 accent-brand-orange" {...register('termsAccepted')} />
                            <span className="text-sm text-brown-dark">
                Li e aceito os <Link to="/termos" target="_blank"
                                     className="text-brand-orange font-bold hover:underline">Termos de Uso</Link> e autorizo o tratamento dos meus dados de saúde conforme a <Link
                                to="/privacidade" target="_blank"
                                className="text-brand-orange font-bold hover:underline">Política de Privacidade (LGPD)</Link>.
              </span>
                        </label>
                        {errors.termsAccepted &&
                            <p className="text-red-500 text-sm mt-1 font-bold">{errors.termsAccepted.message}</p>}
                    </div>
                )}

                {/* === BOTÕES === */}
                <div className="flex gap-4 pt-6 mt-4 border-t border-brand-pot/30">
                    {step > 1 && (
                        <button type="button" onClick={prevStep}
                                className="btn-secondary w-1/3 flex justify-center items-center gap-2 py-4">
                            <ArrowLeft size={20}/> Voltar
                        </button>
                    )}

                    {step < 3 ? (
                        <button type="button" onClick={nextStep}
                                className={`btn-primary flex justify-center items-center gap-2 py-4 ${step === 1 ? 'w-full' : 'w-2/3'}`}>
                            Próximo <ArrowRight size={20}/>
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting}
                                className="btn-primary w-2/3 flex justify-center items-center gap-2 py-4 disabled:opacity-70">
                            {isSubmitting ? 'Criando Conta...' : 'Finalizar Cadastro'}
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
}