const chai = require('chai');
const expect = chai.expect;

const InMemoryCache = require('../');

describe('InMemoryCache', function () {
  let cache;

  beforeEach(() => {
    cache = InMemoryCache.create();
  });

  it('should allow getting cache entry after put', () => {
    const cacheKey = 'abc';
    cache.put(cacheKey, 123, {
      ttl: 10
    });

    let entry = cache.getEntry(cacheKey);

    expect(entry.ttl).to.equal(10);
    expect(entry.expiresTimestamp).to.be.above(Date.now());
    expect(cache.get(cacheKey)).to.equal(123);
  });

  it('should allow cache entry with no TTL', () => {
    const cache = InMemoryCache.create();
    const cacheKey = 'abc';

    cache.put(cacheKey, 123, {
      ttl: -1
    });

    let entry = cache.getEntry(cacheKey);
    expect(entry.ttl).to.equal(-1);
    expect(entry.expiresTimestamp).to.equal(undefined);

    expect(cache.get(cacheKey)).to.equal(123);

    // remove old entries
    cache.reap();

    expect(cache.get(cacheKey)).to.equal(123);
  });

  it('should remove expired entry using manual reaping', (done) => {
    const cache = InMemoryCache.create();
    const cacheKey = 'abc';

    cache.put(cacheKey, 123, {
      ttl: 10
    });

    // remove old entries
    setTimeout(() => {
      cache.reap();
      expect(cache.get(cacheKey)).to.equal(undefined);
      done();
    }, 20);
  });

  it('should remove expired entry using reaper', (done) => {
    const cache = InMemoryCache.create();
    const cacheKey = 'abc';

    cache.put(cacheKey, 123, {
      ttl: 100
    });

    cache.startReaper(200);

    setTimeout(() => {
      expect(cache.get(cacheKey)).to.equal(undefined);
      done();
    }, 400);
  });
});
