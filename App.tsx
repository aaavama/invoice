import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import InvoiceEditor from './pages/InvoiceEditor';
import { Client, Invoice, InvoiceStatus } from './types';

// Mock Data
const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'TechStart Inc', email: 'billing@techstart.io' },
  { id: '2', name: 'Global Logistics', email: 'accounts@globallog.com' },
  { id: '3', name: 'Creative Studio', email: 'hello@creative.studio' },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_123456',
    clientId: '1',
    clientName: 'TechStart Inc',
    status: InvoiceStatus.PAID,
    date: '2023-10-15',
    dueDate: '2023-10-30',
    taxRate: 10,
    items: [
      { id: '1', description: 'Frontend Development', quantity: 40, price: 100 },
      { id: '2', description: 'UI Design', quantity: 10, price: 120 },
    ]
  },
  {
    id: 'inv_789012',
    clientId: '2',
    clientName: 'Global Logistics',
    status: InvoiceStatus.PENDING,
    date: '2023-10-28',
    dueDate: '2023-11-12',
    taxRate: 10,
    items: [
      { id: '3', description: 'Consultation', quantity: 5, price: 200 },
    ]
  },
   {
    id: 'inv_345678',
    clientId: '3',
    clientName: 'Creative Studio',
    status: InvoiceStatus.OVERDUE,
    date: '2023-09-01',
    dueDate: '2023-09-15',
    taxRate: 10,
    items: [
      { id: '4', description: 'Logo Redesign', quantity: 1, price: 1500 },
    ]
  }
];

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<'dashboard' | 'invoices' | 'clients' | 'settings'>('dashboard');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
    setIsCreatingInvoice(false);
    setActivePage('invoices');
  };

  const renderContent = () => {
    if (isCreatingInvoice) {
      return (
        <InvoiceEditor 
          clients={MOCK_CLIENTS}
          onSave={handleCreateInvoice}
          onCancel={() => setIsCreatingInvoice(false)}
        />
      );
    }

    switch (activePage) {
      case 'dashboard':
        return <Dashboard invoices={invoices} />;
      case 'invoices':
        return (
          <InvoiceList 
            invoices={invoices} 
            onCreateNew={() => setIsCreatingInvoice(true)} 
          />
        );
      case 'clients':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <h2 className="text-xl font-semibold mb-2">Client Management</h2>
            <p>Coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p>Coming soon...</p>
          </div>
        );
      default:
        return <Dashboard invoices={invoices} />;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={(page) => {
      setActivePage(page);
      setIsCreatingInvoice(false);
    }}>
      {renderContent()}
    </Layout>
  );
};

export default App;
