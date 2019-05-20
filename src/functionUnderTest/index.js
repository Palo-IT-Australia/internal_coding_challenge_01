// use upsertBooking to save each of the bookedSlots in the campaign
// use upsertCampaign to save the new campaign
const { upsertBooking, upsertCampaign } = require('../db/dynamo');

// use generate id to create id stamps
const { generateId } = require('../stamps/id');

/**
 * A Slot
 * @typedef {Object} Slot
 * @property {string=} id - The identifier
 * @property {boolean=} error determines there is an error in the slot
 *
 * @example { id: '22', error: false }
 */

/**
 * A campaign
 * @typedef {Object} Campaign
 * @property {string=} id - The identifier
 * @property {Date=} createdAt - The date
 * @property {Slot[]} bookingSlots - The list of booking slot objects
 *
 * @example {id: 'qwe', createdAt: new Date(), bookingSlots: [ ... ] }
 */

/**
 * IMPLEMENT THIS FUNCTION !!
 *
 * @function processBookings async function processing bookings.
 * It iterates over the campaign list, modifies bookings based on data from tableName
 * and campaign, then upserts the campaign.
 *
 * @param {string} tableName Name of the table to be updated.
 * @param {Campaign=} campaign object.
 * @example can be found in `src/data/campaigns
 *
 * @returns upsert result
 */
const processBookings = async (tableName, campaign = {}) => {
  const updatedCampaign = campaign;
  const { id, createdAt, bookedSlots } = campaign;
  if (!id) {
    updatedCampaign.id = generateId();
  }
  if (!createdAt) {
    updatedCampaign.createdAt = new Date();
  }
  if (!bookedSlots) {
    return upsertCampaign(tableName, updatedCampaign);
  }
  const slotsToBeRemoved = bookedSlots.filter(item => item.id === '0');
  const slotsToBeAdded = bookedSlots.filter(item => (!item.id));
  const removeSlotsQueries = slotsToBeRemoved.map(slot => upsertBooking(slot, false));
  const addSlotsQueries = slotsToBeAdded.map((slot) => {
    const updateData = slot;
    updateData.id = generateId();
    return upsertBooking(updateData, true);
  });
  const upsertBookingResult = await Promise.all([...addSlotsQueries, ...removeSlotsQueries]);
  if (upsertBookingResult.includes(false)) {
    return {
      success: false,
      statusCode: 400
    };
  }
  updatedCampaign.bookedSlots = bookedSlots.filter(item => item.id !== '0');
  return upsertCampaign(tableName, updatedCampaign);
};

module.exports = { processBookings };
