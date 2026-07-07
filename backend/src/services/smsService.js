export const sendSimulatedSMS = (phone, recipientName, hospitalName, bloodGroup, unitsNeeded) => {
  const message = `
==================================================
LIFELINK SMS SERVICE
SMS SENT SUCCESSFULLY

To        : ${phone}
Recipient : ${recipientName}
Hospital  : ${hospitalName}
Blood Grp : ${bloodGroup}
Units Need: ${unitsNeeded}

Message   :
Emergency!
${hospitalName} urgently requires ${bloodGroup} blood.
Please open LifeLink and accept the request if you are available.

Timestamp : ${new Date().toISOString()}
==================================================
`;
  console.log(message);
};
