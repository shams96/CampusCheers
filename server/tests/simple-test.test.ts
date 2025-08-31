// Simple test to verify our setup is working
describe('Basic Setup Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify mock setup works', () => {
    const testObject = { prop: 'value' };
    expect(testObject.prop).toBe('value');
  });
});