const functionUnderTest = require('./index').functionUnderTest;


describe('basic tests for functionUnderTest:', () => {

  it('it exists', () => {
    expect(functionUnderTest).not.toBeUndefined()
  })

  it('it returns expected value', () => {
    expect(functionUnderTest()).toBeUndefined()
  })

})
