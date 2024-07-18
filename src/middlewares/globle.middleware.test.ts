import { GlobleMiddleware } from './globle.middleware'; // Adjust the import path as necessary

describe('GlobleMiddleware', () => {
  describe('genrateId', () => {
    it('should generate an ID of default length 12', () => {
      const id = GlobleMiddleware.genrateId();
      expect(id).toHaveLength(12);
    });

    it('should generate an ID of specified length', () => {
      const length = 8;
      const id = GlobleMiddleware.genrateId(length);
      expect(id).toHaveLength(length);
    });

    it('should only contain alphanumeric characters', () => {
      const id = GlobleMiddleware.genrateId(12);
      const regex = /^[A-Za-z0-9]+$/;
      expect(regex.test(id)).toBe(true);
    });

    it('should generate unique IDs on consecutive calls', () => {
      const id1 = GlobleMiddleware.genrateId();
      const id2 = GlobleMiddleware.genrateId();
      expect(id1).not.toBe(id2);
    });

    it('should handle zero length input', () => {
      const id = GlobleMiddleware.genrateId(0);
      expect(id).toHaveLength(0);
    });
  });
});
