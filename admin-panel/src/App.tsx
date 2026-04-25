import { Routes, Route } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import SalonAdminLayout from './layouts/SalonAdminLayout';
import StaffLayout from './layouts/StaffLayout';

// Auth
import Login from './pages/Login';
import { SuperAdminRoute, SalonAdminRoute, StaffRoute } from './components/ProtectedRoute';

// Super Admin Pages
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
import Tenants from './pages/Tenants';
import Subscriptions from './pages/Subscriptions';
import LicenseKeys from './pages/LicenseKeys';
import ActivityLog from './pages/ActivityLog';
import SystemHealth from './pages/SystemHealth';
import Commissions from './pages/Commissions';
import AdminNotifications from './pages/AdminNotifications';
import BackupRestore from './pages/BackupRestore';
import LandingPages from './pages/LandingPages';
import WhatsApp from './pages/WhatsApp';
import AdminExpenses from './pages/AdminExpenses';
import AdminShifts from './pages/AdminShifts';
import AdminReports from './pages/AdminReports';
import Plans from './pages/Plans';
import StoreAnalytics from './pages/StoreAnalytics';

// Salon Admin Pages
import SalonDashboard from './pages/salon/Dashboard';
import SalonAppointments from './pages/salon/Appointments';
import SalonStaff from './pages/salon/Staff';
import SalonServices from './pages/salon/SalonServices';
import Customers from './pages/salon/Customers';
import SalonPayments from './pages/salon/SalonPayments';
import SalonAnalytics from './pages/salon/Analytics';
import SalonShifts from './pages/salon/SalonShifts';
import SalonExpenses from './pages/salon/SalonExpenses';
import SalonSettings from './pages/salon/SalonSettings';
import SalonSubscription from './pages/salon/Subscription';
import SalonCoupons from './pages/salon/SalonCoupons';

// Staff Pages
import StaffSchedule from './pages/staff/Schedule';
import StaffAppointments from './pages/staff/StaffAppointments';
import StaffProfile from './pages/staff/StaffProfile';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Super Admin Dashboard */}
            <Route path="/" element={<SuperAdminRoute><DashboardLayout /></SuperAdminRoute>}>
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
                <Route path="tenants" element={<Tenants />} />
                <Route path="subscriptions" element={<Subscriptions />} />
                <Route path="license-keys" element={<LicenseKeys />} />
                <Route path="activity-log" element={<ActivityLog />} />
                <Route path="system-health" element={<SystemHealth />} />
                <Route path="commissions" element={<Commissions />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="backup" element={<BackupRestore />} />
                <Route path="landing-pages" element={<LandingPages />} />
                <Route path="whatsapp" element={<WhatsApp />} />
                <Route path="expenses" element={<AdminExpenses />} />
                <Route path="shifts" element={<AdminShifts />} />
                <Route path="admin-reports" element={<AdminReports />} />
                <Route path="plans" element={<Plans />} />
                <Route path="store-analytics" element={<StoreAnalytics />} />
            </Route>

            {/* Salon Admin Dashboard */}
            <Route path="/salon" element={<SalonAdminRoute><SalonAdminLayout /></SalonAdminRoute>}>
                <Route index element={<SalonDashboard />} />
                <Route path="appointments" element={<SalonAppointments />} />
                <Route path="staff" element={<SalonStaff />} />
                <Route path="services" element={<SalonServices />} />
                <Route path="coupons" element={<SalonCoupons />} />
                <Route path="customers" element={<Customers />} />
                <Route path="payments" element={<SalonPayments />} />
                <Route path="analytics" element={<SalonAnalytics />} />
                <Route path="shifts" element={<SalonShifts />} />
                <Route path="expenses" element={<SalonExpenses />} />
                <Route path="settings" element={<SalonSettings />} />
                <Route path="subscription" element={<SalonSubscription />} />
            </Route>

            {/* Staff Dashboard */}
            <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
                <Route index element={<StaffSchedule />} />
                <Route path="appointments" element={<StaffAppointments />} />
                <Route path="profile" element={<StaffProfile />} />
            </Route>
        </Routes>
    );
}

export default App;
