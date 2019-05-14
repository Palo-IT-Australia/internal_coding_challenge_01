// DO NOT modify this file

const save = () => {
  return new Promise(resolve => setInterval(() => resolve(), 300));
};

const upsertItemToLedger = async (slot, insert) => {
  if (slot.error) return false;
  await save();
  return true;
};

const upsertItemWithParams = async (tableName, campaign) => {
  await save();
  return campaign;
};

module.exports = {
  upsertBooking: upsertItemToLedger,
  upsertCampaign: upsertItemWithParams
};
