import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProductsPage from './pages/products/ProductsPage';
import OrdersPage from './pages/orders/OrdersPage';
import PromotionsPage from './pages/promotions/PromotionsPage';
import UsersPage from './pages/users/UsersPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import StockPage from './pages/stock/StockPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import BrandsPage from './pages/brands/BrandsPage';
import SubcategoriesPage from './pages/subcategories/SubcategoriesPage';
import SalesReportPage from './pages/reports/SalesReportPage';
import Toaster from './components/Toaster';
import './index.css';
import ColorsSizesPage from './pages/meta/ColorsSizesPage.jsx';
import ExpensesPage from './pages/expenses/ExpensesPage.jsx';

export default function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="promotions" element={<RequireRole roles={['admin']}><PromotionsPage /></RequireRole>} />
          <Route path="users" element={<RequireRole roles={['admin']}><UsersPage /></RequireRole>} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="stock" element={<RequireRole roles={['admin','employee']}><StockPage /></RequireRole>} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="subcategories" element={<SubcategoriesPage />} />
          <Route path="reports/sales" element={<RequireRole roles={['admin']}><SalesReportPage /></RequireRole>} />
          <Route path="meta/colors-sizes" element={<RequireRole roles={['admin']}><ColorsSizesPage /></RequireRole>} />
          <Route path="expenses" element={<RequireRole roles={['admin']}><ExpensesPage /></RequireRole>} />
        </Route>
      </Routes>
    </>
  );
}
