jest.mock('../stamps/id', () => ({ generateId: () => 'new' }));

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
  const noBookingCampaign = { bookedSlots: [] };
  const result = await processBookings('slots', noBookingCampaign);
  expect(JSON.stringify(result)).toBe(JSON.stringify(noBookingCampaign));
});

test('stamp new campaign', async () => {
  const newCampaign = { bookedSlots: [] };
  const result = await processBookings('slots', newCampaign);
  expect(result.id).toBe('new');
  expect(result.createdAt instanceof Date).toBe(true);
});

test('timestamp new booking and upsert campaign', async () => {
  const result = await processBookings('slots', upsertSlot.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(upsertSlot.expected));
});

test('error on insert new slot', async () => {
  const result = await processBookings('slots', upsertSlotError.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(upsertSlotError.expected));
});

test('delete slot', async () => {
  const result = await processBookings('slots', deleteSlot.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(deleteSlot.expected));
});

test('delete slot error', async () => {
  const result = await processBookings('slots', deleteSlotError.given);
  expect(JSON.stringify(result)).toBe(JSON.stringify(deleteSlotError.expected));
});

test('delete one in many', async () => {
  const result = await processBookings('slots', deleteSlotOneInMany.given);
  expect(JSON.stringify(result)).toBe(
    JSON.stringify(deleteSlotOneInMany.expected)
  );
});
