import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages (Donor)
import DonorDashboard from './pages/donor/DonorDashboard';
import Notifications from './pages/donor/Notifications';
import Profile from './pages/Profile';

// Protected Pages (Hospital)
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import CreateRequest from './pages/hospital/CreateRequest';
import RequestDetails from './pages/hospital/RequestDetails';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<DashboardLayout />}>
          {/* Shared */}
          <Route path="/profile" element={<Profile />} />

          {/* Donor */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/notifications" element={<Notifications />} />

          {/* Hospital */}
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/request/create" element={<CreateRequest />} />
          <Route path="/hospital/request/:id" element={<RequestDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
