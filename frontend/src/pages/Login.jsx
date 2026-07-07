import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [role, setRole] = useState('donor');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    // Attempt to get location to append if donor, for precision
    // However, login works without location too
    const success = await login(role, data);
    if (success) navigate(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Pane - Branding & Graphic */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary-dark via-primary to-primary-light overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-center px-12 max-w-xl">
          <Heart size={80} className="text-white/80 mx-auto mb-8 animate-pulse-soft" fill="currentColor" />
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">Welcome Back to LifeLink</h1>
          <p className="text-xl text-white/80 leading-relaxed">
            Log in to manage your emergency alerts, track requests, and continue saving lives.
          </p>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-2xl tracking-tight mb-8 lg:hidden">
              <Heart fill="currentColor" size={24} /> LifeLink
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
            <p className="text-gray-500 mt-2">Enter your details to access your dashboard.</p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button
              onClick={() => setRole('donor')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === 'donor' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I am a Donor
            </button>
            <button
              onClick={() => setRole('hospital')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                role === 'hospital' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              I am a Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-primary text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-primary text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark transition-colors">Forgot password?</a>
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 text-lg mt-4">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:text-primary-dark transition-colors">
              Sign up for free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
