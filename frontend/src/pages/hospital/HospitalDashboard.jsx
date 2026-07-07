import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, PlusCircle, AlertTriangle, CheckCircle, Clock, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, critical: 0, acceptedDonors: 0 });

  useEffect(() => {
    fetchRequests();

    if (socket) {
      socket.on('donor-accepted', (data) => {
        toast.success(`A donor accepted your request for ${data.bloodGroup}!`, { 
          icon: '🩸',
          style: { border: '1px solid #10B981', padding: '16px', fontWeight: 'bold' }
        });
        fetchRequests();
      });
      
      socket.on('request-completed', () => {
        toast.success(`Request fully fulfilled!`, {
          icon: '🎉',
          style: { border: '1px solid #3B82F6', padding: '16px', fontWeight: 'bold' }
        });
        fetchRequests();
      });
    }

    return () => {
      if (socket) {
        socket.off('donor-accepted');
        socket.off('request-completed');
      }
    };
  }, [socket]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/hospital/dashboard');
      const reqs = res.data.data.recentRequests;
      setRequests(reqs);
      
      setStats({
        active: res.data.data.stats.totalActiveRequests,
        completed: res.data.data.stats.totalCompletedRequests,
        critical: reqs.filter(r => r.urgency === 'Critical' && r.status === 'ACTIVE').length,
        acceptedDonors: res.data.data.stats.totalAcceptedDonors
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'Critical': return <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-red-50 text-red-700 border-red-200 shadow-sm flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Critical</span>;
      case 'High': return <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-amber-50 text-amber-700 border-amber-200 shadow-sm flex items-center gap-1 w-fit"><Activity size={12}/> High</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200 shadow-sm w-fit">Normal</span>;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hospital Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage emergency blood requests and track donors.</p>
        </div>
        <Link to="/hospital/request/create" className="btn-primary flex items-center gap-2 px-6 shadow-glow">
          <PlusCircle size={20} /> Create Emergency Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Activity className="text-blue-600" />}
          title="Active Requests"
          value={stats.active}
          colorClass="from-blue-50 to-blue-100/50 text-blue-600 border-blue-100"
        />
        <StatCard 
          icon={<AlertTriangle className="text-red-600" />}
          title="Critical Emergencies"
          value={stats.critical}
          colorClass="from-red-50 to-red-100/50 text-red-600 border-red-100"
        />
        <StatCard 
          icon={<CheckCircle className="text-green-600" />}
          title="Fulfilled Requests"
          value={stats.completed}
          colorClass="from-green-50 to-green-100/50 text-green-600 border-green-100"
        />
        <StatCard 
          icon={<Users className="text-purple-600" />}
          title="Donors Responded"
          value={stats.acceptedDonors}
          colorClass="from-purple-50 to-purple-100/50 text-purple-600 border-purple-100"
        />
      </div>

      {/* Requests List */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white/50">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-primary"/> Recent Requests
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading requests...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 pl-6">Blood Group</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Units Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white/60">
                {requests.map(request => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={request._id} 
                    className="hover:bg-primary-50/30 transition-colors group"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 flex items-center justify-center shadow-sm text-primary font-black text-lg">
                          {request.bloodGroup}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getUrgencyBadge(request.urgency)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-gray-900 text-sm">{request.unitsRequired - request.unitsRemaining} <span className="text-gray-400 font-medium">/ {request.unitsRequired} served</span></span>
                      </div>
                      <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${((request.unitsRequired - request.unitsRemaining) / request.unitsRequired) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-md border w-fit ${
                        request.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        request.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {request.status === 'ACTIVE' && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
                        {request.status === 'COMPLETED' && <CheckCircle size={14} />}
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link to={`/hospital/request/${request._id}`} className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-primary bg-primary-50 rounded-lg hover:bg-primary hover:text-white transition-colors border border-primary-100 hover:border-primary shadow-sm group-hover:shadow-glow">
                        View Details
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center bg-white/40">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 shadow-sm">
              <Heart className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">You haven't created any blood requests. When you do, they will appear here.</p>
            <Link to="/hospital/request/create" className="btn-primary inline-flex items-center gap-2 shadow-glow">
              <PlusCircle size={20} /> Create First Request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, colorClass }) => (
  <div className="card hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 mt-0.5 tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

export default HospitalDashboard;
