import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router-dom';
import {Mail, ArrowRight, CheckCircle2, ArrowLeft} from 'lucide-react';

const recoverySchema = z.object({
    email: z.string().email('Por favor, insira um e-mail válido.'),
});

type RecoveryFormInputs = z.infer<typeof recoverySchema>;

export function RecuperarSenha() {
    const [isEmailSent, setIsEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<RecoveryFormInputs>({
        resolver: zodResolver(recoverySchema),
    });

    const onSubmit = async (data: RecoveryFormInputs) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Enviando link de redefinição para o Spring Boot:', data.email);

        setIsEmailSent(true);
    };

    return (
        <div className="w-full animate-fade-in">
            {!isEmailSent ? (
                <>
                    {/* TELA 1: FORMULÁRIO DE SOLICITAÇÃO */}
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-3xl font-bold text-brown-dark mb-2">Esqueceu sua senha?</h2>
                        <p className="text-brown">
                            Não se preocupe! Digite o e-mail associado à sua conta e enviaremos as instruções para
                            redefini-la.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-brown-dark mb-2" htmlFor="email">
                                E-mail cadastrado
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-brown-light"/>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-4 focus:outline-none transition-all ${
                                        errors.email
                                            ? 'border-red-500 focus:ring-red-200 bg-red-50'
                                            : 'border-brand-pot/80 focus:border-brand-orange focus:ring-brand-orange/20 bg-white'
                                    }`}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email &&
                                <p className="mt-1 text-sm text-red-600 font-bold">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary flex justify-center items-center gap-2 py-4 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Processando...' : 'Enviar link de recuperação'}
                            {!isSubmitting && <ArrowRight size={20}/>}
                        </button>
                    </form>

                    {/* Voltar para Login */}
                    <div className="mt-8 text-center pt-6">
                        <Link to="/login"
                              className="inline-flex items-center text-brown font-bold hover:text-brand-orange transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange rounded">
                            <ArrowLeft size={16} className="mr-2"/>
                            Voltar para o Login
                        </Link>
                    </div>
                </>
            ) : (
                <div
                    className="text-center bg-brand-pot/5 p-8 rounded-3xl border border-brand-pot/30 animate-fade-in shadow-sm">
                    <div
                        className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-brand-orange"/>
                    </div>
                    <h2 className="text-2xl font-bold text-brown-dark mb-4">E-mail enviado!</h2>
                    <p className="text-brown mb-8 leading-relaxed">
                        Se houver uma conta associada a este e-mail, você receberá um link seguro para redefinir sua
                        senha em poucos minutos. Lembre-se de verificar sua caixa de spam.
                    </p>
                    <Link to="/login" className="w-full btn-primary flex justify-center items-center py-4">
                        Voltar para o Login
                    </Link>
                </div>
            )}
        </div>
    );
}