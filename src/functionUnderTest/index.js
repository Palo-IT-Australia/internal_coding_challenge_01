// use upsertBooking to save each of the bookedSlots in the campaign
// use upsertCampaign to save the new campaign
const { upsertBooking, upsertCampaign } = require('../db/dynamo');

// use generate id to create id stamps
const { generateId } = require('../stamps/id');


/**
 * IMPLEMENT THIS FUNCTION !!
 *
 * @function processBookings async function processing bookings.
 * It iterates over the campaign list, modifies bookings based on data from tableName
 * and campaign, then upserts the campaign.
 *
 * @param {string} tableName Name of the table to be updated.
 * @param {object} campaign Campaign object.
 * @param {string} [campaign.id] optional Identifier.
 * @param {Date} [campaign.createdAt] optional Date of creation.
 * @param {Array} [campaign.bookingSlots] List of booking slots to process
 *
 * @returns upsert result
 */
const processBookings = async (tableName, campaign = {}) => {
  /**
   */
  if (!campaign.id) {
    campaign.id = generateId();
    campaign.createdAt = new Date();
  }
  let counter = 0;
  if (campaign.bookedSlots && campaign.bookedSlots.length > 0) {
    for (let i = 0; i < campaign.bookedSlots.length; i++) {
      const slot = campaign.bookedSlots[i];
      // if a slot to be booked
      if (!slot.id) {
        counter += 1;
        slot.id = generateId();
        const canBook = await upsertBooking(slot, true);
        if (!canBook) {
          counter += 1;
        }
        break;
      }
      // if a slot to be removed
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
  return upsertCampaign(tableName, campaign);
};

module.exports = { processBookings };
