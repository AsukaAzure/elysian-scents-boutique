import AdminLayout from './AdminLayout';
import { Search, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-green-500/10 text-green-500',
};

const AdminOrders = () => {
  const { data: orders, isLoading } = useAdminOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId);

  const filteredOrders = orders?.filter((order) =>
    order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'completed') => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage customer orders</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 luxury-input"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Orders List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={`bg-card border border-border/50 p-6 space-y-4 hover:border-primary/30 transition-colors cursor-pointer ${
                    selectedOrderId === order.id ? 'border-primary/50' : ''
                  }`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.full_name}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {(order as any).order_items?.length || 0} item(s)
                    </span>
                    <span className="text-primary font-medium">${order.total}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div className="lg:col-span-1">
              {selectedOrder ? (
                <div className="sticky top-8 bg-card border border-border/50 p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl text-foreground">Order Details</h3>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value: 'pending' | 'completed') =>
                        handleStatusChange(selectedOrder.id, value)
                      }
                    >
                      <SelectTrigger className={`w-32 ${statusColors[selectedOrder.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Order ID
                      </p>
                      <p className="text-sm text-foreground font-mono">
                        {selectedOrder.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Customer
                      </p>
                      <p className="text-sm text-foreground">{selectedOrder.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <p className="text-sm text-foreground">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-foreground">{selectedOrder.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Address
                      </p>
                      <p className="text-sm text-foreground">{selectedOrder.shipping_address}</p>
                    </div>
                  </div>

                  <div className="luxury-divider !mx-0 !w-full" />

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Items
                    </p>
                    <div className="space-y-3">
                      {(selectedOrder as any).order_items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product_name} × {item.quantity}
                          </span>
                          <span className="text-foreground">
                            ${(item.product_price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="luxury-divider !mx-0 !w-full" />

                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">${selectedOrder.subtotal}</span>
                    </div>
                  )}

                  {selectedOrder.discount && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>Discount</span>
                      <span>-${selectedOrder.discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-primary text-lg font-medium">${selectedOrder.total}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border/50 p-6 text-center">
                  <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
