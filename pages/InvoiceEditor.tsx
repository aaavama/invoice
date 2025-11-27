import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Loader2,
  Wand2
} from 'lucide-react';
import { Invoice, InvoiceStatus, LineItem, Client } from '../types';
import { generateLineItemsFromText } from '../services/geminiService';

interface InvoiceEditorProps {
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  clients: Client[];
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ onSave, onCancel, clients }) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(10);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newItems = await generateLineItemsFromText(aiPrompt);
      setItems([...items, ...newItems]);
      setShowAiModal(false);
      setAiPrompt('');
    } catch (error) {
      alert("Failed to generate items. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSave = () => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      alert("Please select a client");
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(), // Simple ID generation
      clientId,
      clientName: client.name,
      status,
      date,
      dueDate,
      items,
      notes,
      taxRate
    };
    onSave(newInvoice);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Client</span>
                <select 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {Object.values(InvoiceStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-4">
               <label className="block">
                <span className="text-sm font-medium text-slate-700">Invoice Date</span>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
               <label className="block">
                <span className="text-sm font-medium text-slate-700">Due Date</span>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* AI Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900">Gemini Magic Fill</h4>
                <p className="text-sm text-indigo-700">Describe what you did, and AI will build the line items.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" /> Use AI
            </button>
          </div>

          {/* Items Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Items</h3>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-1/2">Description</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full border-0 p-0 focus:ring-0 text-slate-900 placeholder-slate-400"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input 
                          type="number" 
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))}
                          className="w-20 text-right border-slate-200 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <input 
                          type="number" 
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                          className="w-24 text-right border-slate-200 rounded px-2 py-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 font-medium">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                        No items yet. Add one manually or use AI.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <button 
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
            >
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="flex items-center gap-2">
                  Tax Rate (%)
                  <input 
                    type="number" 
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-12 border-slate-200 rounded px-1 py-0.5 text-xs text-center"
                  />
                </span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
           {/* Notes */}
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
             <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 h-24"
              placeholder="Payment terms, thank you note, etc."
             />
           </div>

        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-end gap-4 border-t border-slate-200">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Invoice
          </button>
        </div>
      </div>

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="bg-indigo-600 p-6 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-200" />
                Gemini Magic Fill
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-indigo-200 hover:text-white">
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-sm">
                Paste raw text from an email, a chat, or just type a rough description. Gemini will parse it into structured invoice items.
              </p>
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., 'Web design for 20 hours at $50/hr, plus $120 for hosting setup and a domain fee of $15.'"
                className="w-full h-32 rounded-lg border border-slate-300 p-3 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  {isGenerating ? 'Generating...' : 'Generate Items'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceEditor;
