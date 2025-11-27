import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  FileText,
  Filter
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  onCreateNew: () => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onCreateNew }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesFilter = filter === 'All' || inv.status === filter;
    const matchesSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.id.includes(search);
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700';
      case InvoiceStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage and track your payments.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search client or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400" />
          {['All', ...Object.values(InvoiceStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                ${filter === status 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const total = inv.items.reduce((sum, i) => sum + (i.price * i.quantity), 0) * (1 + inv.taxRate/100);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">#{inv.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {inv.clientName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 font-medium">{inv.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.date}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">${total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p>No invoices found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
