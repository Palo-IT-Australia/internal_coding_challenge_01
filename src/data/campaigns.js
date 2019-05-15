/**
 * DO NOT MODIFY !!
 * Test data
 */

const mockCreatedAt = new Date('2019-05-15T09:42:52Z');

module.exports = {
  upsertSlot: {
    given: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {},
        {
          id: '1'
        }
      ]
    },
    expected: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: 'new'
        },
        {
          id: '1'
        }
      ]
    }
  },
  upsertSlotError: {
    given: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          error: true
        },
        {
          id: '1'
        }
      ]
    },
    expected: {
      success: false,
      statusCode: 400
    }
  },
  deleteSlot: {
    given: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: '1'
        },
        {
          id: '0'
        }
      ]
    },
    expected: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: '1'
        }
      ]
    }
  },
  deleteSlotError: {
    given: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: '1'
        },
        {
          id: '0',
          error: true
        }
      ]
    },
    expected: {
      success: false,
      statusCode: 400
    }
  },
  deleteSlotOneInMany: {
    given: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: '1'
        },
        {
          id: '2'
        },
        {
          id: '3'
        },
        {
          id: '4'
        },
        {
          id: '5'
        },
        {
          id: '6'
        },
        {
          id: '7'
        },
        {
          id: '8'
        },
        {
          id: '9'
        },
        {
          id: '10'
        },
        {
          id: '0'
        }
      ]
    },
    expected: {
      id: '1',
      createdAt: mockCreatedAt,
      bookedSlots: [
        {
          id: '1'
        },
        {
          id: '2'
        },
        {
          id: '3'
        },
        {
          id: '4'
        },
        {
          id: '5'
        },
        {
          id: '6'
        },
        {
          id: '7'
        },
        {
          id: '8'
        },
        {
          id: '9'
        },
        {
          id: '10'
        }
      ]
    }
  }
};
