/**
 * DO NOT MODIFY !!
 * Tests to make sure your method does what it's suppose to
 */

const mockGenerateId = jest.fn().mockName('generateId').mockReturnValue('new');
const mockUpsertCampaign = jest.fn(async (tableName, campaign) => {
  await new Promise(resolve => setInterval(() => resolve(), 10));
  return campaign;
}).mockName('upsertCampaign');
const mockUpsertBooking = jest.fn(async (slot) => {
  if (slot.error) return false;
  await new Promise(resolve => setInterval(() => resolve(), 100));
  return true;
}).mockName('upsertBooking');
const { performance, PerformanceObserver } = require('perf_hooks');

const BIG_ARRAY_SIZE = 100 * 1000;
jest.mock('../stamps/id', () => ({ generateId: mockGenerateId }));

jest.mock('../db/dynamo', () => ({
  upsertCampaign: mockUpsertCampaign,
  upsertBooking: mockUpsertBooking
}));

const { processBookings } = require('./index');
const {
  upsertSlot,
  upsertManySlots,
  deleteSlot,
  deleteManySlots,
  upsertSlotError,
  deleteSlotError,
  deleteSlotOneInMany
} = require('../data/campaigns');


describe('processBookings', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('basic tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('function exists', () => {
      expect(processBookings).toBeDefined();
      expect(mockGenerateId).not.toBeCalled();
      expect(mockUpsertBooking).not.toBeCalled();
      expect(mockUpsertCampaign).not.toBeCalled();
    });

    test('return expected value for undefined parameters', async () => {
      const ret = await processBookings();
      const expectedResponse = { id: 'new', createdAt: expect.any(Date) };
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).not.toBeCalled();
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(undefined, expectedResponse);
      expect(ret).toMatchObject(expect.objectContaining(expectedResponse));
    });

    test('return expected value when called only with table name', async () => {
      const mockTableName = 'tableName';
      const ret = await processBookings(mockTableName);
      const expectedResponse = { id: 'new', createdAt: expect.any(Date) };
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).not.toBeCalled();
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, expectedResponse);
      expect(ret).toMatchObject(expect.objectContaining(expectedResponse));
    });
  });

  describe('real usage scenarios', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    test('upsert campaign without bookings', async () => {
      const mockTableName = 'slots';
      const noBookingCampaign = { bookedSlots: [] };
      const expectedResponse = { bookedSlots: [], id: 'new', createdAt: expect.any(Date) };
      const result = await processBookings(mockTableName, noBookingCampaign);
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).not.toBeCalled();
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, expectedResponse);
      expect(result).toMatchObject(expect.objectContaining(expectedResponse));
    });

    test('add new booking and upsert campaign', async () => {
      const mockNewSlot = { id: 'new' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, upsertSlot.given);
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, upsertSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(result).toMatchObject(upsertSlot.expected);
    });

    test('add many bookings and upsert campaign', async () => {
      const mockNewSlot = { id: 'new1' };
      const mockNewSlot2 = { id: 'new1' };
      const mockTableName = 'slots';
      mockGenerateId.mockReturnValueOnce('new1').mockReturnValueOnce('new2');
      const result = await processBookings(mockTableName, upsertManySlots.given);
      expect(mockGenerateId).toBeCalledTimes(2);
      expect(mockUpsertBooking).toBeCalledTimes(2);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, upsertManySlots.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot2, true);
      expect(result).toMatchObject(upsertManySlots.expected);
    });

    test('add one new booking and error', async () => {
      const mockNewSlot = { error: true, id: 'new' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, upsertSlotError.given);
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(mockUpsertCampaign).toBeCalledTimes(0);
      expect(result).toMatchObject(upsertSlotError.expected);
    });

    test('delete slot and upsert campaign', async () => {
      const mockNewSlot = { id: '0' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, deleteSlot.given);
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, deleteSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(result).toMatchObject(deleteSlot.expected);
    });


    test('delete many bookings and upsert campaign', async () => {
      const mockNewSlot = { id: '0' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, deleteManySlots.given);
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(2);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, deleteManySlots.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(result).toMatchObject(deleteManySlots.expected);
    });

    test('delete slot error', async () => {
      const mockNewSlot = { error: true, id: '0' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, deleteSlotError.given);
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(mockUpsertCampaign).toBeCalledTimes(0);
      expect(result).toMatchObject(deleteSlotError.expected);
    });

    test('delete one in many', async () => {
      const mockNewSlot = { id: '0' };
      const mockTableName = 'slots';
      const result = await processBookings(mockTableName, deleteSlotOneInMany.given);
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, deleteSlotOneInMany.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(result).toMatchObject(deleteSlotOneInMany.expected);
    });
  });


  describe('measure performance for big data sets', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const obs = new PerformanceObserver((list) => {
      const { duration, name } = list.getEntries()[0];
      // eslint-disable-next-line no-console
      console.warn(`${name} result: ${duration}`);
      expect(duration).toBeLessThan(800);
    });
    obs.observe({ entryTypes: ['measure'] });

    test('TEST 1: add new booking and upsert campaign (100k booked slots)', async () => {
      const mockNewSlot = { id: 'new' };
      const mockTableName = 'slots';
      const inputArray = [...new Array(10)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push({});
      resultArray.push(mockNewSlot);
      upsertSlot.given.bookedSlots = inputArray;
      upsertSlot.expected.bookedSlots = resultArray;
      performance.mark('A1');
      const result = await processBookings('slots', upsertSlot.given);
      performance.mark('B1');
      performance.measure('TEST 1', 'A1', 'B1');
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, upsertSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(result).toMatchObject(upsertSlot.expected);
    });


    test('TEST 2: add many new bookings and upsert campaign (100k booked slots)', async () => {
      const mockNewSlot = { id: 'new' };
      const mockTableName = 'slots';
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push({});
      resultArray.push(mockNewSlot);
      inputArray.unshift({});
      resultArray.unshift(mockNewSlot);
      inputArray.splice(99, 0, {});
      resultArray.splice(99, 0, mockNewSlot);
      upsertSlot.given.bookedSlots = inputArray;
      upsertSlot.expected.bookedSlots = resultArray;
      performance.mark('A1');
      const result = await processBookings('slots', upsertSlot.given);
      performance.mark('B1');
      performance.measure('TEST 2', 'A1', 'B1');
      expect(mockGenerateId).toBeCalledTimes(3);
      expect(mockUpsertBooking).toBeCalledTimes(3);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, upsertSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(result).toMatchObject(upsertSlot.expected);
    });

    test('TEST 3: add new booking and error (100k booked slots)', async () => {
      const mockNewSlot = { error: true, id: 'new' };
      const mockTableName = 'slots';
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      inputArray.push({ error: true });
      upsertSlotError.given.bookedSlots = inputArray;
      performance.mark('A3');
      const result = await processBookings(mockTableName, upsertSlotError.given);
      performance.mark('B3');
      performance.measure('TEST 3', 'A3', 'B3');
      expect(mockGenerateId).toBeCalledTimes(1);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, true);
      expect(result).toMatchObject(upsertSlotError.expected);
    });

    test('TEST 4: delete slot and upsert campaign (100k booked slots)', async () => {
      const mockNewSlot = { id: '0' };
      const mockTableName = 'slots';
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push({ id: '0' });
      deleteSlot.given.bookedSlots = inputArray;
      deleteSlot.expected.bookedSlots = resultArray;
      performance.mark('A4');
      const result = await processBookings('slots', deleteSlot.given);
      performance.mark('B4');
      performance.measure('TEST 4', 'A4', 'B4');
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, deleteSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(result).toMatchObject(deleteSlot.expected);
    });


    test('TEST 5: delete many slots and upsert campaign (100k booked slots)', async () => {
      const mockNewSlot = { id: '0' };
      const mockTableName = 'slots';
      const inputArray = [...new Array(100)].map((x, index) => ({ id: `${index + 1}` }));
      const resultArray = [...inputArray];
      inputArray.push(mockNewSlot);
      inputArray.unshift(mockNewSlot);
      inputArray.splice(99, 0, mockNewSlot);
      deleteSlot.given.bookedSlots = inputArray;
      deleteSlot.expected.bookedSlots = resultArray;
      performance.mark('A5');
      const result = await processBookings('slots', deleteSlot.given);
      performance.mark('B5');
      performance.measure('TEST 5', 'A5', 'B5');
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(3);
      expect(mockUpsertCampaign).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledWith(mockTableName, deleteSlot.expected);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(result).toMatchObject(deleteSlot.expected);
    });

    test('TEST 6: add new booking and error (100k booked slots)', async () => {
      const mockNewSlot = { id: '0', error: true };
      const mockTableName = 'slots';
      const inputArray = [...new Array(BIG_ARRAY_SIZE)].map((x, index) => ({ id: `${index + 1}` }));
      inputArray.push(mockNewSlot);
      deleteSlotError.given.bookedSlots = inputArray;
      performance.mark('A6');
      const result = await processBookings(mockTableName, deleteSlotError.given);
      performance.mark('B6');
      performance.measure('TEST 6', 'A6', 'B6');
      expect(mockGenerateId).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledTimes(1);
      expect(mockUpsertCampaign).toBeCalledTimes(0);
      expect(mockUpsertBooking).toBeCalledWith(mockNewSlot, false);
      expect(result).toMatchObject(deleteSlotError.expected);
    });
  });
});
