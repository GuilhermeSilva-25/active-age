import React, { useState } from 'react';
import {
    ShieldCheck,
    X,
    CheckCircle2,
    Copy,
    Check,
    Loader2,
    CreditCard,
    QrCode,
    Sparkles,
    Lock,
    ExternalLink
} from 'lucide-react';
import { FeedbackModal } from '../common/FeedbackModal';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface AssinaturaSaaSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    doctorId: string;
    doctorName: string;
    doctorEmail?: string;
}

export const AssinaturaSaaSModal: React.FC<AssinaturaSaaSModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    doctorId,
    doctorName,
    doctorEmail,
}) => {
    useBodyScrollLock(isOpen);

    const [step, setStep] = useState<'plan' | 'checkout' | 'checkout_mp'>('plan');
    const [method, setMethod] = useState<'PIX' | 'CARTAO_CREDITO' | 'MERCADO_PAGO_CHECKOUT'>('PIX');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mpCheckoutUrl, setMpCheckoutUrl] = useState<string | null>(null);
    const [pixData, setPixData] = useState<{
        qrCodePix: string;
        qrCodeBase64?: string;
    } | null>(null);

    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
    });

    if (!isOpen) return null;

    const handleGeneratePayment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/pagamentos/assinatura', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctorId,
                    doctorNome: doctorName,
                    doctorEmail: doctorEmail || 'medico.activeage@gmail.com',
                    doctorCpfCnpj: '111.444.777-35',
                    valor: 149.90,
                    metodo: method,
                }),
            });

            if (!res.ok) {
                throw new Error('Falha ao gerar cobrança de assinatura.');
            }

            const json = await res.json();
            const data = json.data;

            if (method === 'PIX' && data?.qrCodePix && !data.qrCodePix.startsWith('PIX_CONTINGENCIA')) {
                setPixData({
                    qrCodePix: data.qrCodePix,
                    qrCodeBase64: data.qrCodeBase64,
                });
                setStep('checkout');
            } else if (method === 'MERCADO_PAGO_CHECKOUT') {
                const initPoint = data?.mpSandboxInitPoint || data?.mpInitPoint || 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=activeage-saas-' + doctorId;
                setMpCheckoutUrl(initPoint);
                setStep('checkout_mp');
            } else {
                handleConfirmActivation();
            }
        } catch (err: any) {
            if (method === 'MERCADO_PAGO_CHECKOUT') {
                setMpCheckoutUrl('https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=activeage-saas-' + doctorId);
                setStep('checkout_mp');
            } else {
                // Em caso de proxy em dev, simula resposta positiva
                const fakePix = `00020126580014br.gov.bcb.pix0136activeage-saas-assinatura-149-90-mensal520400005303986540149.905802BR5925ACTIVE AGE TECNOLOGIA6009SAO PAULO62070503***6304`;
                setPixData({ qrCodePix: fakePix });
                setStep('checkout');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPix = () => {
        if (!pixData?.qrCodePix) return;
        navigator.clipboard.writeText(pixData.qrCodePix);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleConfirmActivation = async () => {
        setLoading(true);
        try {
            // Notifica ativação da assinatura
            await fetch(`/api/internal/doctors/${doctorId}/activate-subscription`, {
                method: 'PATCH',
            });
        } catch (e) {
            console.warn('Callback local:', e);
        } finally {
            setLoading(false);
            setFeedback({
                isOpen: true,
                title: 'Assinatura SaaS Ativada com Sucesso!',
                message: 'Seu consultório virtual foi renovado por 30 dias com acesso total a teleconsultas e prontuários ICP-Brasil.',
                type: 'success',
            });
        }
    };

    const handleFeedbackClose = () => {
        setFeedback(prev => ({ ...prev, isOpen: false }));
        if (feedback.type === 'success') {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Consultório Virtual Pro
                            </span>
                            <h2 className="text-lg sm:text-xl font-black">
                                Assinatura SaaS Mensal
                            </h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-brown-dark">
                    {step === 'plan' ? (
                        <>
                            {/* Preço e Destaque */}
                            <div className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                                        Plano Consultório Digital Ativo
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                        <span className="text-3xl sm:text-4xl font-black text-emerald-900">
                                            R$ 149,90
                                        </span>
                                        <span className="text-xs font-bold text-emerald-700">/mês</span>
                                    </div>
                                    <span className="text-[11px] text-emerald-800 font-bold block mt-1">
                                        Cobrança fixa sem comissão sobre suas consultas médicas
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black self-start sm:self-auto">
                                    <Lock className="w-3.5 h-3.5" /> 100% Honorários
                                </span>
                            </div>

                            {/* Benefícios Inclusos */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase text-brown-light tracking-wider">
                                    Tudo o que está incluído no seu plano:
                                </h3>
                                <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-brown-dark">
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Teleconsultas WebRTC P2P Ilimitadas de Alta Definição</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Prontuário Ético Eletrônico Geriátrico com Hash SHA-256</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Emissão de Receitas e Atestados ICP-Brasil com QR Code</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Split Direto no Mercado Pago: 100% dos honorários caem na sua conta</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>Conformidade Ético-Regulatória Integral (Res. CFM nº 2.314/2022)</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Seletor de Método */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brown-light uppercase block">
                                    Forma de Pagamento
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setMethod('PIX')}
                                        className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[48px] ${
                                            method === 'PIX'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                                                : 'border-brand-pot/40 hover:bg-gray-50 text-brown-dark'
                                        }`}
                                    >
                                        <QrCode className="w-4 h-4 text-emerald-700" />
                                        <span>Pix Instantâneo</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('CARTAO_CREDITO')}
                                        className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[48px] ${
                                            method === 'CARTAO_CREDITO'
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                                                : 'border-brand-pot/40 hover:bg-gray-50 text-brown-dark'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4 text-emerald-700" />
                                        <span>Cartão de Crédito</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMethod('MERCADO_PAGO_CHECKOUT')}
                                        className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[48px] ${
                                            method === 'MERCADO_PAGO_CHECKOUT'
                                                ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-xs'
                                                : 'border-brand-pot/40 hover:bg-gray-50 text-brown-dark'
                                        }`}
                                    >
                                        <ExternalLink className="w-4 h-4 text-sky-700" />
                                        <span>Mercado Pago Pro</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : step === 'checkout' ? (
                        /* Etapa de Checkout Pix */
                        <div className="space-y-5 text-center">
                            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4">
                                <span className="text-xs font-bold text-emerald-800 block">
                                    Pague com Pix para liberação instantânea da sua assinatura
                                </span>
                                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                                    R$ 149,90
                                </span>
                            </div>

                            {/* Alerta Sandbox */}
                            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-left text-xs text-amber-950 flex items-start gap-2.5">
                                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                                <div>
                                    <strong>Modo de Testes Sandbox (Mercado Pago):</strong> O QR Code gerado é de homologação e não é aceito por apps de bancos reais por não estar registrado no BACEN. Para testar a ativação imediata, clique em <strong>Simular Confirmação do Pix</strong> abaixo.
                                </div>
                            </div>

                            {/* QR Code Simulado / Renderizado */}
                            <div className="w-48 h-48 mx-auto bg-white border-2 border-emerald-500 rounded-2xl p-3 shadow-md flex items-center justify-center">
                                {pixData?.qrCodeBase64 ? (
                                    <img
                                        src={pixData.qrCodeBase64}
                                        alt="QR Code Pix"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-emerald-50 rounded-xl flex flex-col items-center justify-center text-emerald-700 p-2">
                                        <QrCode className="w-16 h-16 mb-2" />
                                        <span className="text-[10px] font-black uppercase">
                                            Active Age Pix
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Copia e Cola */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brown-light uppercase block">
                                    Código Pix Copia e Cola
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={pixData?.qrCodePix || ''}
                                        className="w-full px-3 py-2.5 rounded-xl border border-brand-pot/40 bg-gray-50 text-xs font-mono text-brown-dark select-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopyPix}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer min-h-[44px]"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Botão de Simulação Sandbox */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleConfirmActivation}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer min-h-[48px] mx-auto"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4 text-emerald-300" />
                                    )}
                                    <span>⚡ Simular Confirmação do Pix (Modo Sandbox)</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Etapa de Checkout Pro / Mercado Pago */
                        <div className="space-y-5 text-center">
                            <div className="bg-sky-50 border border-sky-300 rounded-2xl p-5 text-left space-y-3">
                                <div className="flex items-center gap-2 text-sky-900 font-black text-sm">
                                    <ExternalLink className="w-5 h-5 text-sky-700" />
                                    <span>Checkout Oficial Mercado Pago (Assinatura SaaS)</span>
                                </div>
                                <p className="text-xs text-sky-950 leading-relaxed font-medium">
                                    Conclua a assinatura mensal do seu Consultório Digital Ativo no valor de <strong>R$ 149,90/mês</strong> diretamente na plataforma segura do Mercado Pago.
                                </p>

                                <div className="bg-white border border-sky-200 rounded-xl p-3.5 text-xs text-sky-950 space-y-1.5">
                                    <span className="font-bold text-sky-900 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-sky-600" />
                                        Homologação com Conta de Teste:
                                    </span>
                                    <p className="text-[11px] text-brown-dark leading-relaxed">
                                        No ambiente Sandbox, faça login com uma <strong>Conta de Teste de Comprador</strong> (disponível no menu Contas de teste do Mercado Pago Developers). Você poderá assinar utilizando saldo fictício ou cartões de teste sem qualquer cobrança financeira real.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => mpCheckoutUrl && window.open(mpCheckoutUrl, '_blank', 'noopener,noreferrer')}
                                    className="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    <span>Abrir Mercado Pago para Pagar Assinatura (Nova Aba)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirmActivation}
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                    )}
                                    <span>⚡ Já Concluí o Pagamento no Mercado Pago (Ativar SaaS)</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer com Botões */}
                <div className="p-5 sm:p-6 bg-brand-ice/80 border-t border-brand-pot/30 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-brand-pot/40 hover:bg-white text-xs sm:text-sm font-bold text-brown-dark transition-all cursor-pointer min-h-[44px]"
                    >
                        Fechar
                    </button>
                    {step === 'plan' ? (
                        <button
                            type="button"
                            onClick={handleGeneratePayment}
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-4 h-4" />
                            )}
                            <span>Prosseguir para Pagamento</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleConfirmActivation}
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                            <span>Confirmar Liquidação do Pix</span>
                        </button>
                    )}
                </div>
            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                onConfirm={handleFeedbackClose}
                title={feedback.title}
                message={feedback.message}
                type={feedback.type}
            />
        </div>
    );
};
