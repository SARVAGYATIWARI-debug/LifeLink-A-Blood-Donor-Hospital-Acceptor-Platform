import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bell, CheckCircle, Clock, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/donor/notifications');
      setNotifications(res.data.data);
      
      // Optionally, mark all as read here or have a separate button
      // To keep it simple, we assume viewing the page is enough for now, 
      // but in a production app we'd trigger a PUT /read endpoint.
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'Critical': return <AlertCircle className="text-red-500" size={24} />;
      case 'High': return <Bell className="text-amber-500" size={24} />;
      default: return <Bell className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="text-primary" size={32} /> Notifications
        </h1>
        <p className="text-gray-500 mt-2">Your history of emergency SMS alerts and system updates.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center">
            <Clock className="animate-spin text-gray-400 mb-2" size={28} />
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif, idx) => (
              <motion.div 
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 transition-colors hover:bg-gray-50 flex gap-4 ${notif.status === 'SENT' ? 'bg-blue-50/30' : ''}`}
              >
                <div className="shrink-0 mt-1">
                  {notif.requestId ? getUrgencyIcon(notif.requestId.urgency) : <CheckCircle className="text-green-500" size={24} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold text-lg ${notif.status === 'SENT' ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.type === 'SMS' ? 'Emergency SMS Alert' : 'System Update'}
                    </h3>
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-100 mt-3">
                    {notif.message}
                  </p>

                  {notif.requestId && (
                    <div className="mt-4 flex gap-4 items-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-100 text-red-800 rounded">
                        Blood Needed: {notif.requestId.bloodGroup}
                      </span>
                      {notif.requestId.hospitalId && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
                          <MapPin size={12} /> {notif.requestId.hospitalId.hospitalName}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-400" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-500 max-w-sm mx-auto">You have no notifications yet. We'll send you an SMS alert when a nearby hospital needs your blood group.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
