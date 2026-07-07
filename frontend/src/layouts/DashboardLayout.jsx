import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User, Bell, Home, PlusCircle, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const role = user?.role;

  useEffect(() => {
    if (role === 'donor') {
      const fetchUnread = async () => {
        try {
          const res = await axios.get('/api/donor/notifications');
          const count = res.data.data.filter(n => n.status === 'SENT').length;
          setUnreadCount(count);
        } catch (error) {
          console.error(error);
        }
      };
      fetchUnread();
    }
  }, [role, location]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-gradient-to-br from-primary to-primary-light p-1.5 rounded-lg shadow-sm">
                  <Heart size={22} className="text-white fill-white" />
                </div>
                <span className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:block">LifeLink</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                <NavLink 
                  to={`/${role}/dashboard`} 
                  active={location.pathname === `/${role}/dashboard`}
                  icon={<Home size={18} />}
                >
                  Dashboard
                </NavLink>
                {role === 'hospital' && (
                  <NavLink 
                    to="/hospital/request/create" 
                    active={location.pathname === '/hospital/request/create'}
                    icon={<PlusCircle size={18} />}
                  >
                    New Request
                  </NavLink>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {role === 'donor' && (
                <Link to="/donor/notifications" className="relative p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 hover:bg-red-50 rounded-full">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white shadow-sm animate-pulse-soft" />
                  )}
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200 focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center border border-primary-200">
                    <User size={16} className="text-primary-dark" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 hidden md:block">
                    {user.name || user.hospitalName}
                  </span>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-glass bg-white/95 backdrop-blur-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden border border-gray-100"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        {role === 'donor' && (
                          <Link to="/donor/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium transition-colors">
                            <User size={16} /> Profile Settings
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

const NavLink = ({ to, active, children, icon }) => (
  <Link
    to={to}
    className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-semibold transition-colors duration-200 ${
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
    }`}
  >
    {icon} {children}
  </Link>
);

export default DashboardLayout;
