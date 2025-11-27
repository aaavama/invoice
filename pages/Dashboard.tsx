import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign,
  ArrowUpRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Invoice, InvoiceStatus } from '../types';
import { analyzeFinancials } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoices }) => {
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Calculate Stats
  const totalRevenue = invoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + (item.price * item.quantity), 0), 0);

  const pendingAmount = invoices
    .filter(i => i.status === InvoiceStatus.PENDING)
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + (item.price * item.quantity), 0), 0);

  const overdueAmount = invoices
    .filter(i => i.status === InvoiceStatus.OVERDUE)
    .reduce((sum, i) => sum + i.items.reduce((s, item) => s + (item.price * item.quantity), 0), 0);

  // Prepare chart data (Last 6 months simplified for demo)
  const data = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
    { name: 'Jul', amount: 3490 },
  ];

  const refreshInsights = async () => {
    setLoadingInsights(true);
    const summary = `
      Total Revenue: $${totalRevenue}. 
      Pending: $${pendingAmount}. 
      Overdue: $${overdueAmount}. 
      Total Invoices: ${invoices.length}.
    `;
    const insights = await analyzeFinancials(summary);
    setAiInsights(insights);
    setLoadingInsights(false);
  };

  useEffect(() => {
    if (invoices.length > 0 && !aiInsights) {
        refreshInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Overview of your business financials.</p>
        </div>
        <button 
          onClick={refreshInsights}
          disabled={loadingInsights}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
        >
          {loadingInsights ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
          {loadingInsights ? 'Analyzing...' : 'AI Insights'}
        </button>
      </div>

      {/* AI Insights Panel */}
      {aiInsights && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <h3 className="flex items-center gap-2 font-semibold mb-2">
              <Sparkles className="w-4 h-4" /> Gemini Analysis
            </h3>
            <p className="text-indigo-100 leading-relaxed max-w-3xl">
              {aiInsights}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +12.5%
            </span>
          </div>
          <p className="text-slate-500 text-sm">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-900">${totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Pending</p>
          <h3 className="text-2xl font-bold text-slate-900">${pendingAmount.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-slate-500 text-sm">Overdue</p>
          <h3 className="text-2xl font-bold text-slate-900">${overdueAmount.toLocaleString()}</h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
