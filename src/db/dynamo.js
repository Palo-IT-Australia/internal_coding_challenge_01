/**
 * DO NOT MODIFY !!
 * Module mocking the dynamo db methods
 */

const save = () => new Promise(resolve => setInterval(() => resolve(), 100));

const upsertBooking = async (slot) => {
  if (slot.error) return false;
  await save();
  return true;
};

const upsertCampaign = async (tableName, campaign) => {
  await save(tableName);
  return campaign;
};

module.exports = {
  upsertBooking,
  upsertCampaign
};
