import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Settings, DollarSign, Package, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Settings, label: 'Configuration', path: '/admin/config' },
    { icon: DollarSign, label: 'Payments', path: '/admin/payments' },
    { icon: Package, label: 'Listings', path: '/admin/listings' },
    { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{title}</h1>
                <Badge variant="secondary">Admin</Badge>
              </div>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={window.location.pathname === item.path ? 'default' : 'outline'}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
