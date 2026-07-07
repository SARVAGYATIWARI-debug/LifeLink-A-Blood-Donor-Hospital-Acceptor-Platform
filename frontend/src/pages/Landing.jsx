import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Activity, Shield, Clock, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-50/50 blur-3xl opacity-60 mix-blend-multiply"></div>
        <div className="absolute top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-blue-50/50 blur-3xl opacity-60 mix-blend-multiply"></div>
      </div>

      {/* Navbar Placeholder - Note: Assuming DashboardLayout or App handles this, but if Landing is standalone, here's a minimal nav */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-primary to-primary-light p-2 rounded-xl shadow-glow">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">LifeLink</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors">Log in</Link>
          <Link to="/register" className="btn-primary py-2 px-5 text-sm shadow-md">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-dark font-medium text-sm mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              Real-time Emergency Blood Matching
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Connect to Save <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
                Every Single Life.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              LifeLink bridges the gap between hospitals facing critical shortages and nearby voluntary donors ready to help. Real-time alerts, exact GPS matching, zero delays.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/register" className="w-full sm:w-auto btn-primary py-4 px-8 text-lg group">
                Register as a Donor
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="w-full sm:w-auto btn-secondary py-4 px-8 text-lg">
                Register Hospital
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="flex-1 relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full max-w-lg mx-auto aspect-square rounded-full bg-gradient-to-br from-primary-100 to-white flex items-center justify-center shadow-2xl p-12 overflow-hidden border border-white/50">
               {/* Decorative UI elements floating */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3"
               >
                 <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">O-</div>
                 <div>
                   <p className="text-xs text-gray-500 font-medium">Critical Request</p>
                   <p className="text-sm font-bold text-gray-900">2 Units Needed</p>
                 </div>
               </motion.div>

               <motion.div 
                 animate={{ y: [0, 15, 0] }} 
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                 className="absolute bottom-16 left-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-10"
               >
                 <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Activity size={20} className="text-green-600"/></div>
                 <div>
                   <p className="text-sm font-bold text-gray-900">Match Found!</p>
                   <p className="text-xs text-gray-500 font-medium">Donor is 2.4 km away</p>
                 </div>
               </motion.div>

               {/* Center abstract graphic */}
               <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-primary to-primary-light shadow-glow flex items-center justify-center text-white relative z-0">
                  <Heart size={100} className="fill-white/20" strokeWidth={1} />
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="bg-white py-24 border-t border-gray-100">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why LifeLink?</h2>
            <p className="text-gray-600">Our platform is designed to eliminate friction in the blood donation process, ensuring hospitals get the blood they need instantly.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="text-primary" size={32} />}
              title="Secure & Private"
              description="Your data is encrypted. We only share exact contact details with verified hospitals upon accepting a request."
            />
            <FeatureCard 
              icon={<Activity className="text-primary" size={32} />}
              title="Real-Time Alerts"
              description="Get instant web and SMS notifications the moment an emergency matching your blood group occurs nearby."
            />
            <FeatureCard 
              icon={<Clock className="text-primary" size={32} />}
              title="Zero Delays"
              description="Direct connection between hospitals and donors without middlemen, saving crucial hours."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="card hover:-translate-y-2 transition-transform duration-300">
    <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Landing;
