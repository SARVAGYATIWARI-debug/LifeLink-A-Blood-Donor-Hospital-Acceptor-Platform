import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/hospital/request', data);
      if (res.data.success) {
        toast.success(`Request created! Notified ${res.data.data.donorsNotified} nearby donors.`);
        navigate('/hospital/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/hospital/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Emergency Request</h1>
          <p className="text-gray-500 mt-1">Raise a blood request to alert nearby eligible donors immediately.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group Needed</label>
              <div className="grid grid-cols-4 gap-3">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <label key={bg} className="relative cursor-pointer">
                    <input 
                      type="radio" 
                      value={bg} 
                      {...register("bloodGroup", { required: "Please select a blood group" })}
                      className="peer sr-only"
                    />
                    <div className="rounded-lg border border-gray-200 px-4 py-3 text-center hover:bg-gray-50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary peer-checked:font-bold transition-all">
                      {bg}
                    </div>
                  </label>
                ))}
              </div>
              {errors.bloodGroup && <span className="text-red-500 text-xs mt-1 block">{errors.bloodGroup.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Units Required (Pints)</label>
              <input
                type="number"
                {...register("unitsRequired", { required: "Units required is mandatory", min: { value: 1, message: "Min 1 unit" }, max: 50 })}
                className="input-field"
                placeholder="e.g., 3"
              />
              {errors.unitsRequired && <span className="text-red-500 text-xs">{errors.unitsRequired.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
              <select
                {...register("urgency", { required: "Urgency is required" })}
                className="input-field bg-white"
              >
                <option value="Normal">Normal (Next 48 Hours)</option>
                <option value="High">High (Next 12 Hours)</option>
                <option value="Critical">Critical (Immediate/Emergency)</option>
              </select>
              {errors.urgency && <span className="text-red-500 text-xs">{errors.urgency.message}</span>}
            </div>

          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Activity size={24} />}
              Broadcast Emergency Request
            </button>
            <p className="mt-3 text-center text-xs text-gray-500">
              Upon creation, our matching algorithm will instantly SMS nearby eligible donors.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateRequest;
