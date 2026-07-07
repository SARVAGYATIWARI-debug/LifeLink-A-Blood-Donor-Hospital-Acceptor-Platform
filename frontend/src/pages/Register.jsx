import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [role, setRole] = useState('donor');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Attempt to get location to append
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          data.longitude = position.coords.longitude;
          data.latitude = position.coords.latitude;
          const success = await registerUser(role, data);
          if (success) navigate(`/${role}/dashboard`);
        },
        async (error) => {
          // Fallback to a default location (e.g., center of city) if denied for testing
          data.longitude = -73.935242;
          data.latitude = 40.730610;
          const success = await registerUser(role, data);
          if (success) navigate(`/${role}/dashboard`);
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-center px-12 max-w-xl">
          <Heart size={80} className="text-white/80 mx-auto mb-8 animate-pulse-soft" fill="currentColor" />
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">Join the Lifeline</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Create an account to become a hero in your community. Every drop counts.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-xl mx-auto"
        >
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl tracking-tight mb-8 lg:hidden">
              <Heart fill="currentColor" size={24} /> LifeLink
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
            <p className="text-gray-500 mt-2">Join us and start making a difference today.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('donor')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === 'donor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register as Donor
            </button>
            <button
              onClick={() => setRole('hospital')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === 'hospital' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{role === 'donor' ? 'Full Name' : 'Hospital Name'}</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={role === 'donor' ? "John Doe" : "City Hospital"}
                  {...register(role === 'donor' ? 'name' : 'hospitalName', { required: 'This field is required' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="hello@example.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="+1 (555) 000-0000"
                  {...register('phone', { required: 'Phone is required' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="123 Main St, City"
                {...register('address', { required: 'Address is required' })}
              />
            </div>

            {role === 'donor' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                  <select className="input-field" {...register('bloodGroup', { required: 'Required' })}>
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select className="input-field" {...register('gender')}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                  <input type="number" className="input-field" {...register('age')} />
                </div>
              </div>
            )}

            <button type="submit" className="w-full btn-primary py-3 text-lg mt-8">
              Create Account
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
