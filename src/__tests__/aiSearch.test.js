// Simple test to verify Jest setup
describe('Jest Setup', () => {
  test('should run tests', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle basic calculations', () => {
    const precision = (3 / 5);
    expect(precision).toBe(0.6);
  });
});
