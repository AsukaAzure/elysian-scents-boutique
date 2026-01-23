import AdminLayout from './AdminLayout';
import { Users, ShoppingBag, Package, DollarSign, Tag } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get user count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get order stats
      const { data: orders } = await supabase
        .from('orders')
        .select('total, status');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const pendingOrders = orders?.filter((o) => o.status === 'pending').length || 0;

      // Get product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('name, in_stock')
        .eq('in_stock', false)
        .limit(5);

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, full_name, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        userCount: userCount || 0,
        totalOrders,
        totalRevenue,
        pendingOrders,
        productCount: productCount || 0,
        lowStockProducts: lowStockProducts || [],
        recentOrders: recentOrders || [],
      };
    },
  });

  const statCards = [
    { name: 'Total Users', value: stats?.userCount || 0, icon: Users, change: '' },
    { name: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, change: `${stats?.pendingOrders || 0} pending` },
    { name: 'Products', value: stats?.productCount || 0, icon: Package, change: '' },
    { name: 'Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, change: '' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to Maison Noir admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-card border border-border/50 p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5 text-primary" />
                  {stat.change && (
                    <span className="text-xs text-muted-foreground">{stat.change}</span>
                  )}
                </div>
                <div>
                  <p className="text-3xl font-serif text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-card border border-border/50 p-6">
            <h3 className="font-serif text-xl text-foreground mb-4">Recent Orders</h3>
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-foreground">
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-primary">${order.total}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            )}
          </div>

          {/* Out of Stock */}
          <div className="bg-card border border-border/50 p-6">
            <h3 className="font-serif text-xl text-foreground mb-4">Out of Stock</h3>
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <p className="text-sm text-foreground">{item.name}</p>
                    <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">
                      Out of stock
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All products in stock</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
