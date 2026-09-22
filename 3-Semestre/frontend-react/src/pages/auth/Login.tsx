import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {Link} from 'react-router-dom';
import {Mail, Lock, ArrowRight} from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Por favor, insira um e-mail válido.'),
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export function Login() {
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginFormInputs>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormInputs) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Enviando para o Java Spring:', data);
    };

    return (
        <div className="w-full animate-fade-in">
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-brown-dark mb-2">Acesse sua conta</h2>
                <p className="text-brown">Bem-vindo de volta! Insira seus dados para continuar.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Campo E-mail */}
                <div>
                    <label className="block text-sm font-bold text-brown-dark mb-2" htmlFor="email">
                        E-mail
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
                    {/* Mensagem de Erro Dinâmica */}
                    {errors.email && <p className="mt-1 text-sm text-red-600 font-bold">{errors.email.message}</p>}
                </div>

                {/* Campo Senha */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-brown-dark" htmlFor="password">
                            Senha
                        </label>
                        <Link to="/recuperar-senha"
                              className="text-sm font-bold text-brand-orange hover:underline focus:outline-none focus:ring-2 focus:ring-brand-orange rounded">
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-brown-light"/>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-4 focus:outline-none transition-all ${
                                errors.password
                                    ? 'border-red-500 focus:ring-red-200 bg-red-50'
                                    : 'border-brand-pot/80 focus:border-brand-orange focus:ring-brand-orange/20 bg-white'
                            }`}
                            {...register('password')}
                        />
                    </div>
                    {errors.password &&
                        <p className="mt-1 text-sm text-red-600 font-bold">{errors.password.message}</p>}
                </div>

                {/* Botão de Envio Inteligente */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex justify-center items-center gap-2 py-4 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Verificando segurança...' : 'Entrar na plataforma'}
                    {!isSubmitting && <ArrowRight size={20}/>}
                </button>
            </form>

            {/* Rodapé de Redirecionamento */}
            <div className="mt-8 text-center border-t border-brand-pot/30 pt-6">
                <p className="text-brown">
                    Ainda não tem uma conta?{' '}
                    <Link to="/cadastro"
                          className="font-bold text-brand-orange hover:underline focus:outline-none focus:ring-2 focus:ring-brand-orange rounded">
                        Cadastre-se gratuitamente
                    </Link>
                </p>
            </div>
        </div>
    );
}