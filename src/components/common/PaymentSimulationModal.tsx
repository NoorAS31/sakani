import React, { useState } from 'react';
import { Loader2, CheckCircle, X, CreditCard, AlertCircle, Lock, Calendar, User } from 'lucide-react';
import axios from 'axios';
import { paymentService } from '../../services/paymentService';

interface PaymentSimulationModalProps {
    isOpen: boolean;
    paymentId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const PaymentSimulationModal = ({ isOpen, paymentId, onClose, onSuccess }: PaymentSimulationModalProps) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolderName, setCardHolderName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');

    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [transactionId, setTransactionId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCloseAndReset = () => {
        setCardNumber('');
        setCardHolderName('');
        setExpiryDate('');
        setCvv('');
        setStatus('idle');
        setTransactionId('');
        setErrorMessage('');
        onClose();
    };

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
        return digits;
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentId) {
            setStatus('error');
            setErrorMessage('Invalid payment reference id.');
            return;
        }

        const rawCard = cardNumber.replace(/\s/g, '');
        if (rawCard.length !== 16) {
            setStatus('error');
            setErrorMessage('Card number must be exactly 16 digits.');
            return;
        }

        setStatus('processing');
        setErrorMessage('');

        try {
            const response = await paymentService.simulatePayment({
                paymentId,
                cardNumber: rawCard,
                cardHolderName,
                expiryDate,
                cvv
            });

            const resData = response as unknown as Record<string, unknown>;
            const tId = (resData.transactionId as string | undefined) ?? (resData.TransactionId as string | undefined);

            setStatus('success');
            setTransactionId(tId || 'SUCCESS_TRX');

            setTimeout(() => {
                onSuccess();
                handleCloseAndReset();
            }, 2000);

        } catch (error) {
            setStatus('error');

            if (axios.isAxiosError(error)) {
                const data = error.response?.data;

                let finalMessage = 'Payment failed. Please check your details and try again.';

                if (data?.errors && typeof data.errors === 'object') {
                    const firstErrorKey = Object.keys(data.errors)[0];
                    if (firstErrorKey && Array.isArray(data.errors[firstErrorKey]) && data.errors[firstErrorKey].length > 0) {
                        finalMessage = data.errors[firstErrorKey][0];
                    }
                } else if (data?.message || data?.Message) {
                    finalMessage = data.message || data.Message;
                } else if (data?.title) {
                    finalMessage = data.title;
                }

                setErrorMessage(finalMessage);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-7 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <CreditCard size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">Card Payment</h2>
                            <p className="text-blue-100 text-[11px] flex items-center gap-1 mt-0.5">
                                <Lock size={9} /> 256-bit SSL encrypted
                            </p>
                        </div>
                    </div>
                    {status === 'idle' || status === 'error' ? (
                        <button
                            onClick={handleCloseAndReset}
                            className="text-white/60 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-all duration-200"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                </div>

                <div className="p-7">

                    {/* Processing */}
                    {status === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-14 text-center space-y-4">
                            <div className="relative">
                                <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-lg">Processing Payment</p>
                                <p className="text-sm text-gray-400 mt-1">Please do not close this window.</p>
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center py-14 text-center space-y-4">
                            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                <CheckCircle size={34} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-xl">Payment Successful!</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Transaction ID:{' '}
                                    <span className="font-mono font-semibold text-gray-600">{transactionId}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {(status === 'idle' || status === 'error') && (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {status === 'error' && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Cardholder Name */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-600">Cardholder Name</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={cardHolderName}
                                        onChange={(e) => setCardHolderName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                        placeholder="Card Name"
                                    />
                                </div>
                            </div>

                            {/* Card Number */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-gray-600">Card Number</label>
                                <div className="relative">
                                    <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={19}
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 tracking-widest"
                                        placeholder="0000 0000 0000 0000"
                                    />
                                </div>
                            </div>

                            {/* Expiry + CVV */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-600">Expiry Date</label>
                                    <div className="relative">
                                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            maxLength={5}
                                            placeholder="MM/YY"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-600">CVV</label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            maxLength={4}
                                            pattern="\d{3,4}"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                                            placeholder="•••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold rounded-xl px-4 py-3 mt-1 hover:bg-blue-700 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <Lock size={14} />
                                Pay Now
                            </button>

                            <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1 pt-1">
                                <Lock size={9} /> Your payment information is safe and encrypted.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSimulationModal;