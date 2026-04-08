import { useEffect, useState, useMemo } from 'react';
import {
    TrendingUp,
    DollarSign,
    AlertTriangle,
    Clock,
    Building2,
    User,
    Phone,
    Home,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    CreditCard, Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountingService } from '../../services/accountingService.ts';
import type { ExpectedPayment, OverduePayment, AccountingStats } from '../../types/accounting.ts';
import { usePageTitle } from '../../hooks/usePageTitle.ts';

type TimeRange = '1' | '3' | '6' | '12' | '60';

const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1', label: '1M' },
    { value: '3', label: '3M' },
    { value: '6', label: '6M' },
    { value: '12', label: '1Y' },
    { value: '60', label: '5Y' },
];

const getDateRangeFromFilter = (month: TimeRange) => {
    const months = Number(month);
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const overdueStart = new Date(todayStart);
    overdueStart.setMonth(overdueStart.getMonth() - months);

    const expectedEnd = new Date(todayEnd);
    expectedEnd.setMonth(expectedEnd.getMonth() + months);

    return {
        overdueStart,
        todayStart,
        todayEnd,
        expectedEnd,
    };
};

const AccountingPage = () => {
    usePageTitle('Accounting');
    const [expectedPayments, setExpectedPayments] = useState<ExpectedPayment[]>([]);
    const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
    const [stats, setStats] = useState<AccountingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'expected' | 'overdue'>('expected');
    const [timeRange, setTimeRange] = useState<TimeRange>('1');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { overdueStart, todayStart, expectedEnd } = getDateRangeFromFilter(timeRange);
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const rangeMonths = Number(timeRange);
                const expectedStartDate = todayStart.toISOString();
                const expectedEndDate = expectedEnd.toISOString();
                const overdueStartDate = overdueStart.toISOString();
                const overdueEndDate = todayStart.toISOString();

                const [expected, overdue, statsData] = await Promise.all([
                    accountingService.getExpected(expectedStartDate, expectedEndDate),
                    accountingService.getOverdue(overdueStartDate, overdueEndDate),
                    accountingService.getStats(month, year, overdueStartDate, expectedEndDate, rangeMonths)
                ]);
                setExpectedPayments(expected);
                setOverduePayments(overdue);
                setStats(statsData);
            } catch (error) {
                console.error('Failed to load accounting data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    const { filteredExpected, filteredOverdue } = useMemo(() => {
        const { overdueStart, todayStart, expectedEnd } = getDateRangeFromFilter(timeRange);
        
        const filteredExpected = expectedPayments.filter(p => {
            const dueDate = new Date(p.dueDate);
            return dueDate >= todayStart && dueDate <= expectedEnd;
        });
        
        const filteredOverdue = overduePayments.filter(p => {
            const dueDate = new Date(p.dueDate);
            return dueDate >= overdueStart && dueDate <= todayStart;
        });
        
        return { filteredExpected, filteredOverdue };
    }, [expectedPayments, overduePayments, timeRange]);

    // Generate chart data points - cumulative expected income over time
    const chartData = useMemo(() => {
        const allPayments = [
            ...filteredOverdue.map(payment => ({ ...payment, pointType: 'overdue' as const })),
            ...filteredExpected.map(payment => ({ ...payment, pointType: 'expected' as const }))
        ];
        if (allPayments.length === 0) return { points: [], minY: 0, maxY: 100, dates: [] };
        
        // Sort by due date
        const sorted = allPayments.sort((a, b) => 
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        // Calculate cumulative amounts
        let cumulative = 0;
        const points: { date: Date; amount: number; cumulative: number; pointType: 'overdue' | 'expected' }[] = [];
        
        sorted.forEach(p => {
            cumulative += p.amount;
            points.push({
                date: new Date(p.dueDate),
                amount: p.amount,
                cumulative,
                pointType: p.pointType
            });
        });
        
        const amounts = points.map(p => p.cumulative);
        const minY = 0;
        const maxY = Math.max(...amounts) * 1.1 || 100;
        
        return { points, minY, maxY, dates: points.map(p => p.date) };
    }, [filteredExpected, filteredOverdue]);

    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; data: typeof chartData.points[0] } | null>(null);

    const totalExpected = filteredExpected.reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = filteredOverdue.reduce((sum, p) => sum + p.amount, 0);
    const collectionRate = stats ? (stats.totalCollectedMonth / (stats.totalExpectedMonth || 1)) * 100 : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header with Time Range Selector */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Financial Overview</h1>
                    <p className="text-sm text-gray-500">Track payments, revenue, and occupancy metrics</p>
                </div>
                <Link
                    to="/accounting/payments"
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium shadow-sm"
                >
                    <CreditCard size={16} />
                    View Contract Payments
                </Link>
            </div>

            {/* Stats Cards - Stock-like view */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Expected in Period */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <DollarSign size={20} className="text-blue-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={14} /> {filteredExpected.length} payments
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">${totalExpected.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Expected ({timeRange})</p>
                </div>

                {/* Collected This Month */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            <ArrowUpRight size={14} /> +{collectionRate.toFixed(1)}%
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">${stats?.totalCollectedMonth.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Collected this month</p>
                </div>

                {/* Overdue Amount */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-50 rounded-xl">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                            <ArrowDownRight size={14} /> {filteredOverdue.length} overdue
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">${totalOverdue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">Overdue ({timeRange})</p>
                </div>

                {/* Occupancy Rate */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-50 rounded-xl">
                            <PieChart size={20} className="text-purple-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                            Occupancy
                        </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{(stats?.occupancyRate || 0).toFixed(1)}%</p>
                    <p className="text-xs text-gray-500 mt-1">Current occupancy rate</p>
                </div>
            </div>

            {/* Stock-style Chart */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                {/* Chart Header */}
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-black text-white">
                                ${chartData.points.length > 0 ? chartData.points[chartData.points.length - 1].cumulative.toLocaleString() : '0'}
                            </span>
                                <span className={`text-sm font-bold ${totalExpected > totalOverdue ? 'text-gray-300' : 'text-gray-400'}`}>
                                {totalExpected > totalOverdue ? '+' : '-'}${Math.abs(totalExpected - totalOverdue).toLocaleString()}
                                <span className="text-gray-500 ml-1">({timeRange})</span>
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Cumulative Expected Revenue</p>
                    </div>
                    
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 bg-gray-800 p-1 rounded-lg">
                        {timeRangeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                                    timeRange === option.value
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SVG Chart */}
                <div className="relative h-64 mt-4">
                    {chartData.points.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            No payment data for this period
                        </div>
                    ) : (
                        <svg 
                            className="w-full h-full" 
                            viewBox="0 0 800 250" 
                            preserveAspectRatio="none"
                        >
                            {/* Grid lines */}
                            <defs>
                                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#9ca3af" stopOpacity="0.28" />
                                    <stop offset="100%" stopColor="#9ca3af" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            
                            {/* Horizontal grid lines */}
                            {[0, 1, 2, 3, 4].map(i => (
                                <line 
                                    key={i}
                                    x1="0" 
                                    y1={i * 62.5} 
                                    x2="800" 
                                    y2={i * 62.5} 
                                    stroke="#374151" 
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                />
                            ))}
                            
                            {/* Area fill */}
                            <path
                                d={`
                                    M 0 250
                                    ${chartData.points.map((point, i) => {
                                        const x = (i / (chartData.points.length - 1 || 1)) * 800;
                                        const y = 250 - ((point.cumulative - chartData.minY) / (chartData.maxY - chartData.minY)) * 230;
                                        return `L ${x} ${y}`;
                                    }).join(' ')}
                                    L 800 250
                                    Z
                                `}
                                fill="url(#chartGradient)"
                            />
                            
                            {/* Line */}
                            <path
                                d={chartData.points.map((point, i) => {
                                    const x = (i / (chartData.points.length - 1 || 1)) * 800;
                                    const y = 250 - ((point.cumulative - chartData.minY) / (chartData.maxY - chartData.minY)) * 230;
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                }).join(' ')}
                                fill="none"
                                stroke="#9ca3af"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            
                            {/* Data points */}
                            {chartData.points.map((point, i) => {
                                const x = (i / (chartData.points.length - 1 || 1)) * 800;
                                const y = 250 - ((point.cumulative - chartData.minY) / (chartData.maxY - chartData.minY)) * 230;
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={y}
                                        r={hoveredPoint?.data === point ? 6 : 4}
                                        fill={point.pointType === 'expected' ? '#d1d5db' : '#9ca3af'}
                                        stroke="#111827"
                                        strokeWidth="2"
                                        className="cursor-pointer transition-all"
                                        onMouseEnter={() => setHoveredPoint({ x, y, data: point })}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                );
                            })}
                        </svg>
                    )}
                    
                    {/* Tooltip */}
                    {hoveredPoint && (
                        <div 
                            className="absolute bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm shadow-xl pointer-events-none z-10"
                            style={{ 
                                left: `${(hoveredPoint.x / 800) * 100}%`, 
                                top: `${(hoveredPoint.y / 250) * 100 - 15}%`,
                                transform: 'translate(-50%, -100%)'
                            }}
                        >
                            <p className="text-white font-bold">${hoveredPoint.data.cumulative.toLocaleString()}</p>
                            <p className="text-gray-400 text-xs">
                                {hoveredPoint.data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-gray-300 text-xs">+${hoveredPoint.data.amount.toLocaleString()}</p>
                        </div>
                    )}
                    
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-1">
                        <span>${(chartData.maxY).toLocaleString()}</span>
                        <span>${(chartData.maxY * 0.75).toLocaleString()}</span>
                        <span>${(chartData.maxY * 0.5).toLocaleString()}</span>
                        <span>${(chartData.maxY * 0.25).toLocaleString()}</span>
                        <span>$0</span>
                    </div>
                </div>
                
                {/* X-axis labels */}
                {chartData.points.length > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-8">
                        {(() => {
                            const points = chartData.points;
                            const labelsToShow = Math.min(6, points.length);
                            const step = Math.floor(points.length / labelsToShow) || 1;
                            return points
                                .filter((_, i) => i % step === 0 || i === points.length - 1)
                                .slice(0, 6)
                                .map((point, i) => (
                                    <span key={i}>
                                        {point.date.toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            ...(timeRange === '12' || timeRange === '60' ? { year: '2-digit' } : {})
                                        })}
                                    </span>
                                ));
                        })()}
                    </div>
                )}
            </div>

            {/* Payments Table with Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tab Header */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('expected')}
                        className={`flex-1 px-6 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'expected'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Clock size={18} />
                        Expected Payments
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeTab === 'expected' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {filteredExpected.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('overdue')}
                        className={`flex-1 px-6 py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                            activeTab === 'overdue'
                                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <AlertTriangle size={18} />
                        Overdue Payments
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                            activeTab === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {filteredOverdue.length}
                        </span>
                    </button>
                </div>

                {/* Table Content */}
                {activeTab === 'expected' ? (
                    filteredExpected.length === 0 ? (
                        <div className="p-12 text-center">
                            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-600">No expected payments</h3>
                            <p className="text-sm text-gray-400 mt-1">No payments due in this period ({timeRange})</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Renter</th>
                                    <th className="px-6 py-4">Property / Unit</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Days Until Due</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredExpected.map((payment) => (
                                    <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <User size={18} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{payment.renterName}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Phone size={10} /> {payment.renterPhoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{payment.propertyName}</span>
                                                <span className="text-gray-300">•</span>
                                                <Home size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium">#{payment.unitNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(payment.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                                payment.daysUntilDue <= 3 
                                                    ? 'bg-amber-100 text-amber-700' 
                                                    : 'bg-green-100 text-green-700'
                                            }`}>
                                                {payment.daysUntilDue} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-gray-900">${payment.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-100">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-sm font-bold text-gray-600">
                                        Total Expected
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-black text-blue-600">
                                        ${totalExpected.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )
                ) : (
                    filteredOverdue.length === 0 ? (
                        <div className="p-12 text-center">
                            <TrendingUp size={48} className="mx-auto text-green-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-600">No overdue payments</h3>
                            <p className="text-sm text-gray-400 mt-1">No overdue payments in this period ({timeRange})</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Renter</th>
                                    <th className="px-6 py-4">Property / Unit</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4">Days Overdue</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOverdue.map((payment) => (
                                    <tr key={payment.paymentId} className="hover:bg-red-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                                    <User size={18} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{payment.renterName}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Phone size={10} /> {payment.renterPhoneNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-600">{payment.propertyName}</span>
                                                <span className="text-gray-300">•</span>
                                                <Home size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium">#{payment.unitNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(payment.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700">
                                                {Math.abs(payment.daysUntilDue)} days late
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-red-600">${payment.amount.toLocaleString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-red-50 border-t border-red-100">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-sm font-bold text-red-700">
                                        Total Overdue
                                    </td>
                                    <td className="px-6 py-4 text-right text-lg font-black text-red-600">
                                        ${totalOverdue.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    )
                )}
            </div>
        </div>
    );
};

export default AccountingPage;
