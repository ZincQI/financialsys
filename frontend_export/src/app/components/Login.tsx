import { useState } from 'react';
import { Lock, User, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { saveAuth } from '../utils/auth';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simple hard-coded authentication
    if (username === 'admin' && password === '123456') {
      // 保存认证信息到 localStorage
      saveAuth(username);
      onLoginSuccess();
    } else {
      setError('账号或密码错误，请重试');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* 装饰性背景元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A365D] to-[#2A4A7D] flex items-center justify-center text-white shadow-lg">
                <PieChart className="w-8 h-8" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                GnuCash-Lite
              </CardTitle>
              <CardDescription className="text-gray-500 text-base">
                企业财务管理系统
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* 账号输入 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-gray-400" />
                    账号
                  </label>
                  <Input
                    autoFocus
                    placeholder="请输入账号"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 w-20 flex-shrink-0 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-gray-400" />
                    密码
                  </label>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                  {error}
                </div>
              )}

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full h-11 mt-6 bg-gradient-to-r from-[#1A365D] to-[#2A4A7D] hover:from-[#2A4A7D] hover:to-[#3A5A9D] text-white font-medium shadow-md transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? '正在验证...' : '登录'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}


