import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { TransactionRegister } from './components/TransactionRegister';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { PurchaseOrders } from './components/PurchaseOrders';
import { SupplierManagement } from './components/SupplierManagement';
import { ReportCenter } from './components/ReportCenter';
import { QuickEntry } from './components/QuickEntry';
import { isAuthValid, clearAuth } from './utils/auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      // 检查 localStorage 中的认证信息是否有效
      if (isAuthValid()) {
        setIsAuthenticated(true);
      } else {
        // 如果认证信息过期，清除它
        clearAuth();
        setIsAuthenticated(false);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // 处理登录成功
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // 处理退出登录
  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  // 如果正在检查认证状态，显示加载中
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 如果未认证，显示登录页面
  // 注意：即使有有效的认证信息，如果用户访问登录页面，也不自动跳转
  // 这个逻辑由 App 组件控制，用户需要手动登录
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'transaction':
        return <TransactionRegister />;
      case 'accounts':
        return <ChartOfAccounts />;
      case 'quick-entry':
        return <QuickEntry />;
      case 'purchase':
        return <PurchaseOrders />;
      case 'suppliers':
        return <SupplierManagement />;
      case 'reports':
        return <ReportCenter />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
}