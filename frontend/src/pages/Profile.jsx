import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Droplet, Activity, Building, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, login } = useAuth(); // login updates the context user
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleAvailability = async () => {
    try {
      setIsUpdating(true);
      const res = await axios.put('/api/donor/availability', { available: !user.available });
      if (res.data.success) {
        toast.success(`Availability updated to: ${res.data.data.available ? 'Available' : 'Not Available'}`);
        login(res.data.data); // Update context
      }
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsUpdating(true);
    toast('Fetching precise location...', { icon: '📡' });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.put('/api/donor/location', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
          });
          if (res.data.success) {
            toast.success('Location updated successfully!');
            login(res.data.data);
          }
        } catch (error) {
          toast.error('Failed to update location on server');
        } finally {
          setIsUpdating(false);
        }
      },
      (error) => {
        toast.error('Failed to get browser location. Please allow access.');
        setIsUpdating(false);
      }
    );
  };

  const isHospital = user.role === 'hospital';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center"
          >
            <div className="bg-primary/5 p-8 border-b border-gray-50">
              <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                {isHospital ? <Building size={40} className="text-primary" /> : <User size={40} className="text-primary" />}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{isHospital ? user.hospitalName : user.name}</h2>
              <p className="text-gray-500 text-sm mt-1 capitalize">{user.role}</p>
            </div>
            
            <div className="p-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{user.phone}</span>
              </div>
              
              {!isHospital && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Droplet size={16} className="text-red-400" />
                  <span className="font-bold text-gray-900">{user.bloodGroup}</span> Blood Type
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Settings & Info */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="text-primary" size={20} /> Preferences & Actions
            </h3>
            
            {isHospital ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Hospital Address</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 flex items-start gap-3">
                    <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                    <span>{user.address}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Location Coordinates</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 font-mono text-sm text-gray-600">
                    [Lng: {user.location.coordinates[0].toFixed(4)}, Lat: {user.location.coordinates[1].toFixed(4)}]
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Availability Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-bold text-gray-900">Donation Availability</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-md">Toggle your availability. When turned off, you will not receive emergency SMS alerts or match with new requests.</p>
                    </div>
                    <button 
                      onClick={toggleAvailability}
                      disabled={isUpdating}
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${user.available ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${user.available ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Location Update */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-bold text-gray-900">Precise Geolocation</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-md">Update your exact GPS coordinates to ensure you are matched accurately with nearby hospitals.</p>
                    </div>
                    <button 
                      onClick={updateLocation}
                      disabled={isUpdating}
                      className="btn-secondary px-4 py-2 flex items-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <MapPin size={16} />}
                      Update Location
                    </button>
                  </div>
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-blue-800 text-sm font-mono flex items-center gap-2">
                    <Activity size={14} /> Current: [{user.location.coordinates[0].toFixed(4)}, {user.location.coordinates[1].toFixed(4)}]
                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
