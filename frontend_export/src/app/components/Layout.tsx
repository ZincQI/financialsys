import { useState } from 'react';
import { LayoutDashboard, FileText, FolderTree, ShoppingCart, PieChart, Search, Bell, User, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'transaction', label: '凭证录入', icon: FileText },
    { id: 'accounts', label: '会计科目', icon: FolderTree },
    { id: 'purchase', label: '采购管理', icon: ShoppingCart },
    { id: 'suppliers', label: '供应商管理', icon: Users },
    { id: 'reports', label: '报表中心', icon: PieChart },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#1A365D] text-white flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <span className="font-semibold">GnuCash-Lite</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white border-l-4 border-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-xs text-white/50">
          <p>© 2024 GnuCash-Lite</p>
          <p>v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              <span>财务管理</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900">
                {navItems.find((item) => item.id === currentPage)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="全局搜索..."
                className="pl-10 w-64 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Avatar */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}