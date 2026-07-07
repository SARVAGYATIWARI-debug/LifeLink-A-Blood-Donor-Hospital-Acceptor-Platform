import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, Droplet, CheckCircle, MapPin, AlertCircle } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (R * c).toFixed(1); 
};

const DonorDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [activeRequests, setActiveRequests] = useState([]);
  const [stats, setStats] = useState({ unread: 0, accepted: 0 });
  const [loading, setLoading] = useState(true);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('request-created', (data) => {
        if (data.bloodGroup === user.bloodGroup) {
          setEmergencyAlert(data);
          toast.error(`EMERGENCY: ${data.hospitalName} needs ${data.bloodGroup} blood!`, {
            icon: '🚨',
            duration: 8000,
            style: { border: '1px solid #F43F5E', padding: '16px', color: '#BE123C' },
          });
          fetchDashboardData();
        }
      });
      
      socket.on('request-completed', () => {
        fetchDashboardData();
      });
    }

    return () => {
      if (socket) {
        socket.off('request-created');
        socket.off('request-completed');
      }
    };
  }, [socket, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [reqRes, notifRes] = await Promise.all([
        axios.get('/api/donor/requests'),
        axios.get('/api/donor/notifications')
      ]);
      
      setActiveRequests(reqRes.data.data);
      const unreadCount = notifRes.data.data.filter(n => n.status === 'SENT').length;
      setStats({ unread: unreadCount, accepted: 0 }); 
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await axios.post(`/api/donor/request/${requestId}/accept`);
      if (res.data.success) {
        toast.success('Thank you! You have accepted the request.', {
          style: { border: '1px solid #10B981', padding: '16px' }
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const isEligible = () => {
    if (!user.lastDonationDate) return true;
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
    return new Date(user.lastDonationDate) <= tenMonthsAgo;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1 font-medium">Ready to save lives in your area?</p>
        </div>
        <div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border ${
            user.available ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${user.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {user.available ? 'Currently Available' : 'Not Available'}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {emergencyAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0, mb: 0 }}
            animate={{ opacity: 1, height: 'auto', mb: 32 }}
            exit={{ opacity: 0, height: 0, mb: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-50 to-white border-l-4 border-primary p-5 rounded-xl shadow-md flex items-start gap-4">
              <div className="bg-red-100 p-2 rounded-full mt-0.5 animate-pulse-soft">
                <AlertCircle className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-primary-dark font-extrabold text-lg">EMERGENCY ALERT: {emergencyAlert.bloodGroup} Blood Required</h3>
                <p className="text-gray-700 mt-1 font-medium">
                  {emergencyAlert.hospitalName} urgently requires {emergencyAlert.unitsRequired} units of {emergencyAlert.bloodGroup} blood.
                </p>
              </div>
              <button 
                onClick={() => setEmergencyAlert(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Droplet className="text-primary" />}
          title="Blood Group"
          value={user.bloodGroup}
          colorClass="from-rose-50 to-rose-100/50 text-primary border-rose-100"
        />
        <StatCard 
          icon={<Activity className={isEligible() ? "text-emerald-600" : "text-amber-600"} />}
          title="Eligibility"
          value={isEligible() ? 'Eligible' : 'Not Eligible'}
          subtitle={user.lastDonationDate ? `Last: ${new Date(user.lastDonationDate).toLocaleDateString()}` : 'Never donated'}
          colorClass={isEligible() ? "from-emerald-50 to-emerald-100/50 text-emerald-600 border-emerald-100" : "from-amber-50 to-amber-100/50 text-amber-600 border-amber-100"}
        />
        <StatCard 
          icon={<Bell className="text-indigo-600" />}
          title="Unread Alerts"
          value={stats.unread}
          colorClass="from-indigo-50 to-indigo-100/50 text-indigo-600 border-indigo-100"
        />
        <StatCard 
          icon={<CheckCircle className="text-blue-600" />}
          title="Lives Saved"
          value={stats.accepted || 0}
          subtitle="Total accepted requests"
          colorClass="from-blue-50 to-blue-100/50 text-blue-600 border-blue-100"
        />
      </div>

      {/* Active Requests */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <div className="bg-primary-50 p-2 rounded-lg"><Activity size={24} className="text-primary" /></div>
          Active Nearby Requests
        </h2>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="card h-56 animate-pulse bg-gray-50 border-gray-100" />)}
          </div>
        ) : activeRequests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRequests.map((request, idx) => (
              <motion.div 
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`card relative overflow-hidden flex flex-col justify-between group ${
                  request.urgency === 'Critical' ? 'border-primary/50 shadow-glow' : 'hover:border-gray-300'
                }`}
              >
                {request.urgency === 'Critical' && (
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-light to-primary animate-pulse-soft"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-start mb-5 mt-2">
                    <div className="pr-4">
                      <h3 className="font-extrabold text-lg text-gray-900 truncate leading-tight">{request.hospitalId.hospitalName}</h3>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-1.5 mt-2 bg-gray-50 inline-flex px-2.5 py-1 rounded-md border border-gray-100">
                        <MapPin size={14} className="text-gray-400" /> 
                        {user?.location?.coordinates && request?.hospitalId?.location?.coordinates 
                          ? `${calculateDistance(
                              user.location.coordinates[1], user.location.coordinates[0],
                              request.hospitalId.location.coordinates[1], request.hospitalId.location.coordinates[0]
                            )} km away`
                          : 'Nearby'}
                      </p>
                    </div>
                    <div className="bg-primary/10 text-primary font-black px-3 py-1.5 rounded-lg shrink-0 border border-primary/20 shadow-sm">
                      {request.bloodGroup}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-500">Units Needed:</span>
                      <span className="text-gray-900 bg-gray-100 px-2 rounded">{request.unitsRemaining} / {request.unitsRequired}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${(request.unitsRemaining / request.unitsRequired) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleAcceptRequest(request._id)}
                  disabled={!user.available || !isEligible()}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
                    user.available && isEligible() 
                      ? 'bg-primary hover:bg-primary-hover text-white hover:shadow-glow transform hover:-translate-y-0.5' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  }`}
                >
                  {user.available && isEligible() ? (
                    <>Accept Request <ArrowRightIcon /></>
                  ) : (
                    'Not Eligible to Accept'
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-panel text-center py-20 flex flex-col items-center rounded-2xl">
            <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900">No active requests</h3>
            <p className="text-gray-500 mt-2 max-w-md text-lg">Your area is safe! We will notify you immediately when an emergency arises.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, colorClass }) => (
  <div className="card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs font-semibold text-gray-400 mt-1 bg-gray-50 inline-block px-1.5 rounded">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
);

export default DonorDashboard;
