import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Salons from './pages/Salons';
import Bookings from './pages/Bookings';
import Coupons from './pages/Coupons';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Services from './pages/Services';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="salons" element={<Salons />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="coupons" element={<Coupons />} />
        <Route path="payments" element={<Payments />} />
        <Route path="messages" element={<Messages />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="services" element={<Services />} />
      </Route>
    </Routes>
  );
}

export default App;
