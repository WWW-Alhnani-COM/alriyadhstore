import { useState } from "react";
import { Link } from "wouter";
import { useAdminListOrders } from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Eye } from "lucide-react";

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
const { data: orders, isLoading } = useAdminListOrders(
  statusFilter !== "all" ? { status: statusFilter as any } : {}
);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string, color: string }> = {
      pending: { label: "بانتظار الدفع", color: "bg-amber-100 text-amber-800" },
      paid: { label: "تم الدفع", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "تم الشحن", color: "bg-emerald-100 text-emerald-800" },
      cancelled: { label: "ملغي", color: "bg-destructive/10 text-destructive" },
    };
    const s = map[status] || { label: status, color: "bg-muted text-muted-foreground" };
    return <Badge className={`${s.color} border-none font-bold`}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">الطلبات</h1>
            <p className="text-muted-foreground text-sm">متابعة وإدارة طلبات العملاء</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">تصفية بالحالة:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-none font-medium">
              <SelectValue placeholder="الكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">بانتظار الدفع</SelectItem>
              <SelectItem value="paid">تم الدفع</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card border rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({length: 6}).map((_,i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold py-4">رقم الطلب</TableHead>
                <TableHead className="font-bold py-4">العميل</TableHead>
                <TableHead className="font-bold py-4">التاريخ</TableHead>
                <TableHead className="font-bold py-4">الحالة</TableHead>
                <TableHead className="font-bold py-4">الإجمالي</TableHead>
                <TableHead className="text-left font-bold py-4">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!orders?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    لا توجد طلبات مطابقة للبحث.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-mono font-bold">#{order.id}</TableCell>
                    <TableCell>
                      <div className="font-bold">{order.customerName}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-1">{order.phone}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium text-sm">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="font-black text-primary">{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell className="text-left">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2 font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Eye className="w-4 h-4" /> عرض
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
