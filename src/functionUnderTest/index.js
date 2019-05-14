const { upsertBooking, upsertCampaign } = require('../db/dynamo');
let { generateId } = require('../stamps/id');

const processBookings = async (tableName, campaign) => {
  if (!campaign.id) {
    campaign.id = generateId();
    campaign.createdAt = new Date();
  }
  let counter = 0;
  if (campaign.bookedSlots && campaign.bookedSlots.length > 0) {
    for (let i = 0; i < campaign.bookedSlots.length; i++) {
      const slot = campaign.bookedSlots[i];
      //if a slot to be booked
      if (!slot.id) {
        counter += 1;
        slot.id = generateId();
        const canBook = await upsertBooking(slot, true);
        if (!canBook) {
          counter += 1;
        }
        break;
      }
      //if a slot to be removed
      if (slot.id === '0') {
        counter += 1;
        const canRemove = await upsertBooking(slot, false);
        if (canRemove) {
          campaign.bookedSlots.splice(i, 1);
        } else {
          counter += 1;
        }
        break;
      }
    }
  }
  if (counter > 1) {
    return {
      success: false,
      statusCode: 400
    };
  }
  return await upsertCampaign(tableName, campaign);
};

module.exports = { processBookings };
