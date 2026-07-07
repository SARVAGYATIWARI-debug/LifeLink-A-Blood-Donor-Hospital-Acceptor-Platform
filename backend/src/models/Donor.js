import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  bloodGroup: { 
    type: String, 
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  gender: { type: String },
  age: { type: Number },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  lastDonationDate: { type: Date },
  available: { type: Boolean, default: true },
  role: { type: String, default: 'donor' }
}, { timestamps: true });

donorSchema.index({ location: '2dsphere' });

export default mongoose.model('Donor', donorSchema);
