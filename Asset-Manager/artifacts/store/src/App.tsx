import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import all pages
import StoreLayout from "@/components/layout/StoreLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Home from "@/pages/Home";
import Products from "@/pages/products/index";
import ProductDetail from "@/pages/products/[id]";
import Cart from "@/pages/cart/index";
import Checkout from "@/pages/checkout/index";
import OrderSuccess from "@/pages/order-success/index";
import Categories from "@/pages/categories/index";
import About from "@/pages/about/index";
import Contact from "@/pages/contact/index";

import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCategories from "@/pages/admin/categories/index";
import AdminProducts from "@/pages/admin/products/index";
import AdminOrders from "@/pages/admin/orders/index";
import AdminOrderDetail from "@/pages/admin/orders/[id]";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      
      <Route path="/admin" nest>
        <AdminLayout>
          <Switch>
            <Route path="/" component={AdminDashboard} />
            <Route path="/dashboard" component={AdminDashboard} />
            <Route path="/categories" component={AdminCategories} />
            <Route path="/products" component={AdminProducts} />
            <Route path="/orders" component={AdminOrders} />
            <Route path="/orders/:id" component={AdminOrderDetail} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>

      <Route path="/" nest>
        <StoreLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={Products} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/categories" component={Categories} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/order/success/:id" component={OrderSuccess} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route component={NotFound} />
          </Switch>
        </StoreLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster richColors position="top-center" dir="rtl" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
