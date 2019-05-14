const db = require('../db/dynamo');
let { generateId } = require('../stamps/id');

const upsertItemToLedger = async (slot, insert) => {
  if (!slot || !insert) {
    throw new Error('Error');
  }
  await db.save();
  return true;
};

const upsertItemWithParams = async (tableName, args) => {
  if (!tableName) {
    throw new Error('error');
  }
  await db.save();
  return args;
};

const processBookings = async (tableName, args) => {
  if (!args.id) {
    args.id = generateId();
    args.createdAt = new Date();
  }
  let counter = 0;
  if (args.bookedSlots && args.bookedSlots.length > 0) {
    for (let i = 0; i < args.bookedSlots.length; i++) {
      const slot = args.bookedSlots[i];
      //if a slot to be booked
      if (!slot.id) {
        counter += 1;
        slot.timestamp = Date.now();
        slot.id = generateId();
        const canBook = upsertItemToLedger(slot, true);
        if (!canBook) {
          counter += 1;
        }
        break;
      }
      //if a slot to be removed
      if (slot.id === '0') {
        counter += 1;
        const canRemove = upsertItemToLedger(slot, false);
        if (canRemove) {
          args.bookedSlots.splice(i, 1);
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
  return await upsertItemWithParams(tableName, args);
};

module.exports = { processBookings };
