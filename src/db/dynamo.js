/**
 * DO NOT MODIFY !!
 * Module mocking the dynamo db methods
 */

const save = () => {
  return new Promise(resolve => setInterval(() => resolve(), 300));
};

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
