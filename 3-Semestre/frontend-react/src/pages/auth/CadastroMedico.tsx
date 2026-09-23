import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router-dom';
import {ArrowRight, ArrowLeft, CheckCircle2} from 'lucide-react';

const applyCpfMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const applyPhoneMask = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

const applyUfMask = (value: string) => {
    return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
};

const applyCrmMask = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 10);
};

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
});

type DoctorFormInputs = z.infer<typeof doctorSchema>;

export function CadastroMedico() {
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        getValues,
        setError,
        formState: {errors, isSubmitting},
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
                setError('confirmPassword', {type: 'manual', message: 'As senhas não coincidem.'});
                return;
            }
        }

        if (isStepValid) setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const onSubmit = async (data: DoctorFormInputs) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Dados do Médico prontos para o Java Spring:', data);
        alert("Cadastro Médico simulado com sucesso!");
    };

    const {onChange: cpfOnChange, ...cpfRegister} = register('cpf');
    const {onChange: phoneOnChange, ...phoneRegister} = register('phone');
    const {onChange: crmOnChange, ...crmRegister} = register('crm');
    const {onChange: ufOnChange, ...ufRegister} = register('ufCrm');

    return (
        <div className="w-full animate-fade-in py-4">
            <div className="text-center md:text-left mb-6">
                <h2 className="text-3xl font-bold text-brand-mint mb-2">Cadastro de Especialista</h2>
                <p className="text-brown">Junte-se à plataforma geriatra e abra seu consultório virtual.</p>
            </div>

            {/* Barra de Progresso Visual (Tema Menta/Verde) */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-pot/30 -z-10"></div>
                <div
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-mint transition-all duration-500 -z-10 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>

                {[1, 2, 3].map((item) => (
                    <div key={item}
                         className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= item ? 'bg-brand-mint border-brand-mint text-brown-dark' : 'bg-white border-brand-pot text-brown-light'}`}>
                        {step > item ? <CheckCircle2 size={16}/> : item}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {/* === ETAPA 1: ACESSO === */}
                {step === 1 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">1. Dados de
                            Acesso</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">E-mail Profissional</label>
                            <input type="email" placeholder="dr@email.com"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...register('email')} />
                            {errors.email &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Senha</label>
                            <input type="password" placeholder="Mínimo 6 caracteres"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...register('password')} />
                            {errors.password &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Confirme sua Senha</label>
                            <input type="password" placeholder="Digite a senha novamente"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...register('confirmPassword')} />
                            {errors.confirmPassword &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.confirmPassword.message}</p>}
                        </div>
                    </div>
                )}

                {/* === ETAPA 2: DADOS PROFISSIONAIS === */}
                {step === 2 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">2. Identificação
                            Profissional</h3>
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-1">Nome Completo</label>
                            <input type="text" placeholder="Nome e sobrenome"
                                   className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...register('fullName')} />
                            {errors.fullName &&
                                <p className="text-red-500 text-sm mt-1 font-bold">{errors.fullName.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">CPF</label>
                                <input type="text" placeholder="000.000.000-00"
                                       className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...cpfRegister}
                                       onChange={(e) => {
                                           e.target.value = applyCpfMask(e.target.value);
                                           cpfOnChange(e);
                                       }}/>
                                {errors.cpf &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.cpf.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">Celular
                                    (WhatsApp)</label>
                                <input type="tel" placeholder="(00) 00000-0000"
                                       className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...phoneRegister}
                                       onChange={(e) => {
                                           e.target.value = applyPhoneMask(e.target.value);
                                           phoneOnChange(e);
                                       }}/>
                                {errors.phone &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.phone.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-brown-dark mb-1">CRM</label>
                                <input type="text" placeholder="Apenas números"
                                       className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none" {...crmRegister}
                                       onChange={(e) => {
                                           e.target.value = applyCrmMask(e.target.value);
                                           crmOnChange(e);
                                       }}/>
                                {errors.crm &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.crm.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brown-dark mb-1">Estado (UF)</label>
                                <input type="text" placeholder="Ex: SP"
                                       className="w-full px-4 py-3 rounded-lg border border-brand-pot/80 focus:border-brand-mint focus:ring-4 focus:ring-brand-mint/20 outline-none text-center" {...ufRegister}
                                       onChange={(e) => {
                                           e.target.value = applyUfMask(e.target.value);
                                           ufOnChange(e);
                                       }}/>
                                {errors.ufCrm &&
                                    <p className="text-red-500 text-sm mt-1 font-bold">{errors.ufCrm.message}</p>}
                            </div>
                        </div>
                        <p className="text-xs text-brown italic">Obs: Solicitaremos foto do seu CRM no dashboard para
                            liberar as teleconsultas.</p>
                    </div>
                )}

                {/* === ETAPA 3: CONSENTIMENTOS === */}
                {step === 3 && (
                    <div className="animate-fade-in space-y-5">
                        <h3 className="font-bold text-brand-mint border-b border-brand-pot/50 pb-2">3. Responsabilidades
                            Legais</h3>
                        <p className="text-brown text-sm">Para atender na Active Age, você deve estar ciente das regras
                            do Conselho Federal de Medicina.</p>

                        <label
                            className="flex items-start gap-3 p-4 border border-brand-pot/50 rounded-xl bg-brand-pot/5 cursor-pointer hover:bg-brand-mint/10 transition-colors">
                            <input type="checkbox"
                                   className="mt-1 w-5 h-5 accent-brand-mint" {...register('termsAccepted')} />
                            <span className="text-sm text-brown-dark">
                Declaro que as informações fornecidas são verdadeiras, estou com o CRM ativo, e aceito os <Link
                                to="/termos" target="_blank" className="text-brand-mint font-bold hover:underline">Termos de Uso</Link> assumindo total responsabilidade ética pelo ato médico na plataforma.
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
                                className={`bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold rounded-xl transition-all flex justify-center items-center gap-2 py-4 ${step === 1 ? 'w-full' : 'w-2/3'}`}>
                            Próximo <ArrowRight size={20}/>
                        </button>
                    ) : (
                        <button type="submit" disabled={isSubmitting}
                                className="bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold rounded-xl transition-all w-2/3 flex justify-center items-center gap-2 py-4 disabled:opacity-70">
                            {isSubmitting ? 'Criando Consultório...' : 'Finalizar Cadastro'}
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
}