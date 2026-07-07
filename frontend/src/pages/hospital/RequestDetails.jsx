import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Activity, Droplet, Phone, MapPin, UserCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [acceptances, setAcceptances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`/api/hospital/request/${id}`);
        setRequest(res.data.data.request);
        setAcceptances(res.data.data.acceptances || []);
      } catch (error) {
        toast.error('Failed to load request details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Request not found</h2>
        <Link to="/hospital/dashboard" className="text-primary hover:underline mt-4 inline-block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Link to="/hospital/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card !p-8 relative overflow-hidden">
            {request.status === 'COMPLETED' && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -z-10"></div>
            )}
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                  Blood Request
                  {request.status === 'COMPLETED' && <CheckCircle className="text-green-500" size={28} />}
                </h1>
                <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                  <Clock size={14}/> Posted {new Date(request.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary-50 to-white text-primary border border-primary-100 font-black text-2xl px-6 py-3 rounded-xl shadow-sm">
                {request.bloodGroup}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <DetailBox label="Urgency" value={request.urgency} icon={<ShieldAlert size={16}/>} 
                colorClass={request.urgency === 'Critical' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'} />
              <DetailBox label="Status" value={request.status} icon={<Activity size={16}/>}
                colorClass={request.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'} />
              <DetailBox label="Required" value={`${request.unitsRequired} Units`} icon={<Droplet size={16}/>} />
              <DetailBox label="Remaining" value={`${request.unitsRemaining} Units`} icon={<Clock size={16}/>} />
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Progress</h3>
              <div className="flex justify-between text-sm font-bold text-gray-900 mb-2">
                <span>{request.unitsRequired - request.unitsRemaining} Units Served</span>
                <span>{request.unitsRequired} Total</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-primary to-primary-light h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${((request.unitsRequired - request.unitsRemaining) / request.unitsRequired) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Responding Donors */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24 !p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-white/50">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <UserCircle className="text-primary" size={24} /> Donors Responded
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">{acceptances.length} generous people on the way</p>
            </div>
            
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {acceptances.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                    <Activity className="text-gray-300" size={24} />
                  </div>
                  <p className="text-gray-500 font-medium">Waiting for donors to accept...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {acceptances.map((acc, idx) => (
                    <motion.div 
                      key={acc._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-green-400 group-hover:bg-green-500 transition-colors"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{acc.donorId.name}</h3>
                          <div className="flex flex-col gap-2 mt-2">
                            <a href={`tel:${acc.donorId.phone}`} className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary transition-colors bg-gray-50 w-fit px-2 py-1 rounded">
                              <Phone size={14} className="text-primary" /> {acc.donorId.phone}
                            </a>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                              <Clock size={12} /> Accepted {new Date(acc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                        <div className="bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-md text-xs border border-green-200">
                          En Route
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const DetailBox = ({ label, value, icon, colorClass = "text-gray-600 bg-gray-50" }) => (
  <div className={`p-4 rounded-xl border border-gray-100 flex flex-col gap-2 ${colorClass.includes('bg-') ? colorClass : 'bg-gray-50'}`}>
    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${colorClass.includes('text-') ? colorClass.split(' ')[0] : 'text-gray-500'}`}>
      {icon} {label}
    </div>
    <div className="text-lg font-black text-gray-900">{value}</div>
  </div>
);

export default RequestDetails;
