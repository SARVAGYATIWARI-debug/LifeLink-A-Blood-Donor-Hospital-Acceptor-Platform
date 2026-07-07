import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['SENT', 'READ'], default: 'SENT' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
