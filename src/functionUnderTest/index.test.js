/**
 * DO NOT MODIFY !!
 * Tests to make sure your method does what it's suppose to
 */

const { performance, PerformanceObserver } = require('perf_hooks');

const BIG_ARRAY_SIZE = 1000 * 1000;
jest.mock('../stamps/id', () => ({ generateId: () => 'new' }));

jest.mock('../db/dynamo', () => ({
  upsertCampaign: async (tableName, campaign) => {
    await new Promise(resolve => setInterval(() => resolve(), 100));
    return campaign;
  },
  upsertBooking: async (slot) => {
    if (slot.error) return false;
    await new Promise(resolve => setInterval(() => resolve(), 100));
    return true;
  }
}));

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


describe('processBookings', () => {
  describe('basic tests', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('function exists', () => {
      expect(processBookings).toBeDefined();
    });

    test('return expected value for undefined parameters', async () => {
      const ret = await processBookings();
      const expectedResponse = { id: 'new', createdAt: expect.any(Date) };
      expect(ret).toMatchObject(expect.objectContaining(expectedResponse));
    });

    test('return expected value when called only with table name', async () => {
      const ret = await processBookings('tableName');
      const expectedResponse = { id: 'new', createdAt: expect.any(Date) };
      expect(ret).toMatchObject(expect.objectContaining(expectedResponse));
    });
  });

  describe('real usage scenarios', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    test('upsert campaign without bookings', async () => {
      const noBookingCampaign = { bookedSlots: [] };
      const expectedResponse = { bookedSlots: [], id: 'new', createdAt: expect.any(Date) };
      const result = await processBookings('slots', noBookingCampaign);
      expect(result).toMatchObject(expect.objectContaining(expectedResponse));
    });

    test('add new booking and upsert campaign', async () => {
      const result = await processBookings('slots', upsertSlot.given);
      expect(result).toMatchObject(upsertSlot.expected);
    });

    test('add new booking and error', async () => {
      const result = await processBookings('slots', upsertSlotError.given);
      expect(result).toMatchObject(upsertSlotError.expected);
    });

    test('delete slot and upsert campaign', async () => {
      const result = await processBookings('slots', deleteSlot.given);
      expect(result).toMatchObject(deleteSlot.expected);
    });

    test('delete slot error', async () => {
      const result = await processBookings('slots', deleteSlotError.given);
      expect(result).toMatchObject(deleteSlotError.expected);
    });

    test('delete one in many', async () => {
      const result = await processBookings('slots', deleteSlotOneInMany.given);
      expect(result).toMatchObject(deleteSlotOneInMany.expected);
    });
  });


  describe('measure performance for big datasets', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
    const obs = new PerformanceObserver((list) => {
      const { duration, name } = list.getEntries()[0];
      // eslint-disable-next-line no-console
      console.warn(`${name} result: ${duration}`);
      expect(duration).toBeLessThan(300);
    });
    obs.observe({ entryTypes: ['measure'] });

    test('TEST 1: add new booking and upsert campaign (1M booked slots)', async () => {
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push({});
      resultArray.push({ id: 'new' });
      upsertSlot.given.bookedSlots = inputArray;
      upsertSlot.expected.bookedSlots = resultArray;
      performance.mark('A1');
      const result = await processBookings('slots', upsertSlot.given);
      performance.mark('B1');
      performance.measure('TEST 1', 'A1', 'B1');
      expect(result).toMatchObject(upsertSlot.expected);
    });

    test('TEST 2: add new booking and error (1M booked slots)', async () => {
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      inputArray.push({ error: true });
      upsertSlotError.given.bookedSlots = inputArray;
      performance.mark('A2');
      const result = await processBookings('slots', upsertSlotError.given);
      performance.mark('B2');
      performance.measure('TEST 2', 'A2', 'B2');
      expect(result).toMatchObject(upsertSlotError.expected);
    });

    test('TEST 3: delete slot and upsert campaign (1M booked slots)', async () => {
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push({ id: '0' });
      deleteSlot.given.bookedSlots = inputArray;
      deleteSlot.expected.bookedSlots = resultArray;
      performance.mark('A3');
      const result = await processBookings('slots', deleteSlot.given);
      performance.mark('B3');
      performance.measure('TEST 3', 'A3', 'B3');
      expect(result).toMatchObject(deleteSlot.expected);
    });

    test('TEST 4: add new booking and error (1M booked slots)', async () => {
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      inputArray.push({ error: true });
      deleteSlotError.given.bookedSlots = inputArray;
      performance.mark('A4');
      const result = await processBookings('slots', deleteSlotError.given);
      performance.mark('B4');
      performance.measure('TEST 4', 'A4', 'B4');
      expect(result).toMatchObject(deleteSlotError.expected);
    });
  });
});
