import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import { accountingService } from '../../services/accountingService';
import PaymentSimulationModal from '../../components/common/PaymentSimulationModal';
import type { PaymentHistoryResponseDto } from '../../types/accounting';
import { usePageTitle } from '../../hooks/usePageTitle';

const PaymentsPage = () => {
    usePageTitle('Payments');
    const [payments, setPayments] = useState<PaymentHistoryResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');

    useEffect(() => {
        accountingService.getMyPaymentHistory('All')
            .then(setPayments)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const sortedPayments = useMemo(() => {
        const statusPriority = (status: number) => {
            if (status === 3) return 0; // Overdue → first
            if (status === 1) return 1; // Pending → middle
            if (status === 2) return 2; // Paid → last
            return 3;
        };

        return [...payments].sort((a, b) => {
            const priorityDiff = statusPriority(a.paymentStatus) - statusPriority(b.paymentStatus);
            if (priorityDiff !== 0) return priorityDiff;
            // within same status: sort by full date ascending (oldest due date first)
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
    }, [payments]);

    const openPaymentModal = (id: string) => {
        if (!id) {
            console.error("Error: Extracted Payment ID is empty!");
            return;
        }
        setSelectedPaymentId(id);
        setIsModalOpen(true);
    };

    const closePaymentModal = () => {
        setIsModalOpen(false);
        setSelectedPaymentId('');
    };

    const handlePaymentSuccess = async () => {
        if (!selectedPaymentId) return;
        setPayments(prev => prev.map(payment => {
            const p = payment as any;
            const currentId = p.paymentId || p.PaymentId || p.id;
            return currentId === selectedPaymentId
                ? { ...payment, paymentStatus: 2, paymentDate: new Date().toISOString() }
                : payment;
        }));
    };

    const getPaymentStatusConfig = (statusNum: number) => {
        switch (statusNum) {
            case 1: return { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock };
            case 2: return { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle };
            case 3: return { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
            default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', icon: Clock };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    // split into unpaid (overdue + pending) and paid
    const unpaidPayments = sortedPayments.filter(p => p.paymentStatus === 1 || p.paymentStatus === 3);
    const paidPayments = sortedPayments.filter(p => p.paymentStatus === 2);

    const renderPayment = (payment: PaymentHistoryResponseDto, index: number) => {
        const p = payment as any;
        const actualPaymentId = p.paymentId || p.PaymentId || p.id;
        const paymentStatus = getPaymentStatusConfig(payment.paymentStatus);
        const StatusIcon = paymentStatus.icon;
        const canPay = payment.paymentStatus === 1 || payment.paymentStatus === 3;

        return (
            <div key={actualPaymentId || index} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${paymentStatus.color}`}>
                            <StatusIcon size={16} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 text-sm">
                                Payment Due {p.unitNo || p.UnitNo ? `- Unit ${p.unitNo || p.UnitNo}` : ''}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                                {formatDate(payment.dueDate)}
                            </div>
                            {payment.paymentDate && (
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                    Paid on {formatDate(payment.paymentDate)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-3">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-[10px] text-gray-400">Amount</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-black ${paymentStatus.color}`}>
                                {paymentStatus.label}
                            </span>
                            {canPay && (
                                <button
                                    type="button"
                                    onClick={() => openPaymentModal(actualPaymentId)}
                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Pay Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Payments</h1>
                <p className="text-sm text-gray-500 mt-1">Review and pay your upcoming rent installments</p>
            </div>

            {sortedPayments.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No payments found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Overdue + Pending */}
                    {unpaidPayments.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Outstanding ({unpaidPayments.length})
                            </p>
                            {unpaidPayments.map((payment, index) => renderPayment(payment, index))}
                        </div>
                    )}

                    {/* Paid */}
                    {paidPayments.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                Paid ({paidPayments.length})
                            </p>
                            {paidPayments.map((payment, index) => renderPayment(payment, index))}
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && selectedPaymentId && (
                <PaymentSimulationModal
                    isOpen={isModalOpen}
                    paymentId={selectedPaymentId}
                    onClose={closePaymentModal}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};

export default PaymentsPage;