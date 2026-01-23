import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Package, ArrowLeft, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Inventory', path: '/admin/inventory', icon: Package },
  { name: 'Coupons', path: '/admin/coupons', icon: Tag },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border/50 z-50">
        <div className="p-6">
          <Link to="/" className="font-serif text-2xl text-foreground">
            <span className="gold-gradient-text">Maison</span> Noir
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Link to="/" className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
