import Donor from '../models/Donor.js';
import Notification from '../models/Notification.js';
import { sendSimulatedSMS } from './smsService.js';
import { io } from '../server.js';

export const findAndNotifyEligibleDonors = async (bloodRequest, hospital) => {
  const radiusKm = parseFloat(process.env.SEARCH_RADIUS_KM) || 10;
  const radiusRadians = radiusKm / 6378.1; // Earth radius in km

  const tenMonthsAgo = new Date();
  tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);

  // MongoDB Geospatial Query for eligible donors
  const eligibleDonors = await Donor.find({
    bloodGroup: bloodRequest.bloodGroup,
    available: true,
    $or: [
      { lastDonationDate: { $lte: tenMonthsAgo } },
      { lastDonationDate: { $exists: false } },
      { lastDonationDate: null }
    ],
    location: {
      $geoWithin: {
        $centerSphere: [hospital.location.coordinates, radiusRadians]
      }
    }
  });

  console.log(`Found ${eligibleDonors.length} eligible donors within ${radiusKm}km for request ${bloodRequest._id}`);

  // Create notifications and send SMS
  let smsCount = 0;
  const notifications = [];

  for (const donor of eligibleDonors) {
    // 1. Create Notification Document
    notifications.push({
      donorId: donor._id,
      requestId: bloodRequest._id,
      title: 'Emergency Blood Requirement',
      message: `${hospital.hospitalName} urgently requires ${bloodRequest.bloodGroup} blood. Open the application to accept the request.`,
      status: 'SENT'
    });

    // 2. Simulate SMS
    sendSimulatedSMS(donor.phone, donor.name, hospital.hospitalName, bloodRequest.bloodGroup, bloodRequest.unitsRequired);
    smsCount++;
  }

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  console.log(`Total SMS sent: ${smsCount}`);

  // 3. Emit Socket.io event for connected donors
  // Note: io might be undefined if server is not fully initialized, but since this runs after server starts it's fine.
  if (io) {
    io.emit('request-created', {
      hospitalName: hospital.hospitalName,
      bloodGroup: bloodRequest.bloodGroup,
      unitsRequired: bloodRequest.unitsRequired,
      urgency: bloodRequest.urgency,
      requestId: bloodRequest._id,
      distance: 'Nearby' // Calculate real distance if needed
    });
  }
};
