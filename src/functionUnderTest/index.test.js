jest.mock('../stamps/id', () => {
  return {
    generateId: () => 'new'
  };
});

const { processBookings } = require('./index');
const {
  upsertSlot,
  deleteSlot,
  upsertSlotError,
  deleteSlotError,
  deleteSlotOneInMany
} = require('../data/campaigns');

afterAll(() => {
  jest.resetAllMocks();
});

test('no bookings', async () => {
  let noBookingCampaign = { bookedSlots: [] };
  let result = await processBookings('slots', noBookingCampaign);
  expect(JSON.stringify(result)).toBe(JSON.stringify(noBookingCampaign));
});

test('stamp new campaign', async () => {
  let newCampaign = { bookedSlots: [] };
  let result = await processBookings('slots', newCampaign);
  expect(result.id).toBe('new');
  expect(result.createdAt instanceof Date).toBe(true);
});

test('timestamp new booking and upsert campaign', async () => {
  let result = await processBookings('slots', upsertSlot.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(upsertSlot.expected));
});

test('error on insert new slot', async () => {
  let result = await processBookings('slots', upsertSlotError.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(upsertSlotError.expected));
});

test('delete slot', async () => {
  let result = await processBookings('slots', deleteSlot.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(deleteSlot.expected));
});

test('delete slot error', async () => {
  let result = await processBookings('slots', deleteSlotError.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(deleteSlotError.expected));
});

test('delete one in many', async () => {
  let result = await processBookings('slots', deleteSlotOneInMany.given);
  expect(JSON.stringify(result)).toBe(
    JSON.stringify(deleteSlotOneInMany.expected)
  );
});
