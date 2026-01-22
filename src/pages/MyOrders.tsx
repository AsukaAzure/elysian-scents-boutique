import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useUserOrders } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const MyOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: orders, isLoading } = useUserOrders();

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="luxury-container py-32">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="luxury-container py-32 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-serif text-3xl text-foreground mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">Please sign in to view your orders</p>
          <Button asChild variant="luxury" size="luxuryLg">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-16 lg:py-24">
        <div className="luxury-container">
          <div className="text-center mb-12">
            <p className="luxury-subheading mb-4">Your Account</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              My <span className="gold-gradient-text">Orders</span>
            </h1>
            <div className="luxury-divider" />
          </div>

          {orders && orders.length > 0 ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border/50 p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-lg text-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placed on {format(new Date(order.created_at), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 text-xs uppercase tracking-wider rounded ${
                          order.status === 'completed'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-primary font-medium">${order.total}</span>
                    </div>
                  </div>

                  <div className="luxury-divider !mx-0 !w-full" />

                  <div className="space-y-2">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="text-foreground">
                          ${(item.product_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-accent">
                      <span>Discount Applied</span>
                      <span>-${order.discount}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Shipping to: {order.shipping_address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="font-serif text-2xl text-foreground mb-4">No Orders Yet</h2>
              <p className="text-muted-foreground mb-8">
                You haven't placed any orders yet. Start exploring our collection.
              </p>
              <Button asChild variant="luxury" size="luxuryLg">
                <Link to="/">
                  Start Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MyOrders;
