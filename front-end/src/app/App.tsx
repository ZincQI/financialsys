import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionRegister } from './components/TransactionRegister';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { PurchaseOrders } from './components/PurchaseOrders';
import { SupplierManagement } from './components/SupplierManagement';
import { ReportCenter } from './components/ReportCenter';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transaction':
        return <TransactionRegister />;
      case 'accounts':
        return <ChartOfAccounts />;
      case 'purchase':
        return <PurchaseOrders />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'reports':
        return <ReportCenter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}