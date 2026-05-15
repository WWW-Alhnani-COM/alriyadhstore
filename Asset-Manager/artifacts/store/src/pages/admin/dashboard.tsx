import { Link } from "wouter";
import { useAdminGetStats } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, DollarSign, Package, Tags, AlertTriangle, ArrowUpRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      pending: { label: "بانتظار الدفع", color: "bg-amber-100 text-amber-800" },
      paid: { label: "تم الدفع", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "تم الشحن", color: "bg-emerald-100 text-emerald-800" },
      cancelled: { label: "ملغي", color: "bg-destructive/10 text-destructive" },
    };
    const s = map[status] || { label: status, color: "bg-muted text-muted-foreground" };
    return <Badge variant="outline" className={`${s.color} border-none`}>{s.label}</Badge>;
  };

  const statusData = stats.ordersByStatus.map(s => {
    const labels: Record<string, string> = { pending: 'بانتظار الدفع', paid: 'تم الدفع', shipped: 'تم الشحن', cancelled: 'ملغي' };
    return { name: labels[s.status] || s.status, value: s.count };
  });

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="rounded-2xl border-none shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-primary-foreground/80">إجمالي المبيعات</h3>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-2xl font-black">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">الطلبات</h3>
              <ShoppingCart className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">طلبات معلقة</h3>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">
                {stats.pendingOrders}
              </div>
            </div>
            <div className="text-3xl font-black text-foreground">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">المنتجات</h3>
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-muted-foreground">الأقسام</h3>
              <Tags className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-3xl font-black text-foreground">{stats.totalCategories}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Charts */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">المبيعات حسب القسم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueByCategory} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} barSize={30}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="categoryName" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border p-3 rounded-lg shadow-lg">
                            <p className="font-bold mb-1">{payload[0].payload.categoryName}</p>
                            <p className="text-primary font-medium">{formatCurrency(payload[0].value as number)}</p>
                            <p className="text-xs text-muted-foreground mt-1">{payload[0].payload.ordersCount} طلب</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">حالات الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border p-2 rounded-lg shadow-lg">
                            <p className="font-bold">{payload[0].name}: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between py-4">
            <CardTitle className="text-lg">أحدث الطلبات</CardTitle>
            <Link href="/admin/orders" className="text-sm font-medium text-primary flex items-center hover:underline">
              عرض الكل <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-20">الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد طلبات حديثة</TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono font-medium">#{order.id}</TableCell>
                      <TableCell className="font-bold">{order.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-left font-black text-primary">{formatCurrency(order.totalPrice)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-destructive/5 text-destructive border-b flex flex-row items-center gap-2 py-4">
            <AlertTriangle className="w-5 h-5" />
            <CardTitle className="text-lg">تنبيهات المخزون</CardTitle>
          </CardHeader>
          <div className="p-0">
            {stats.lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">جميع المنتجات متوفرة بكميات كافية</div>
            ) : (
              <ul className="divide-y">
                {stats.lowStockProducts.map((product) => (
                  <li key={product.id} className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm mb-1">{product.name}</h4>
                      <div className="text-xs text-muted-foreground">رقم المنتج: {product.id}</div>
                    </div>
                    <Badge variant="destructive" className="rounded-full px-3 w-12 justify-center font-bold">
                      {product.quantity}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}