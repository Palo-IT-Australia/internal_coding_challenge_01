jest.mock('../stamps/id', () => {
  return {
    generateId: () => '1111'
  };
});

const { processBookings } = require('./index');

afterAll(() => {
  jest.resetAllMocks();
});

test('no bookings', async () => {
  let noBookingCampaign = { bookedSlots: [] };
  let result = await processBookings('slots', noBookingCampaign);
  expect(result).toMatchObject(noBookingCampaign);
});

test('stamp new campaign', async () => {
  let newCampaign = { bookedSlots: [] };
  let result = await processBookings('slots', newCampaign);
  expect(result.id).toBe('1111');
  expect(result.createdAt instanceof Date).toBe(true);
});
