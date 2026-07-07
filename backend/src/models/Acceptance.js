import mongoose from 'mongoose';

const acceptanceSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  acceptedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Acceptance', acceptanceSchema);
