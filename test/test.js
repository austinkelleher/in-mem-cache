const chai = require('chai');
const expect = chai.expect;

const InMemoryCache = require('../');
const EMIT_ENTRY_CHANGES_ENABLED = { emitEntryChanges: true };
const EMIT_ENTRY_CHANGES_DISABLED = { emitEntryChanges: false };

function _putEntryEventTest (cache, entryOptions, expectedResult) {
  const cacheKey = 'abc';
  const entryData = 123;

  let putEventEmitted = false;

  cache.on(`put:${cacheKey}`, (data) => {
    if (entryData === data) {
      putEventEmitted = true;
    }
  });

  cache.put(cacheKey, entryData, entryOptions);
  expect(putEventEmitted).to.equal(expectedResult);
}

function _deleteEntryEventTest (cache, entryOptions, expectedResult, options) {
  const cacheKey = 'abc';
  const entryData = 123;

  let {put} = options || {};
  put = typeof put !== 'undefined' ? put : true;

  let deleteEventEmitted = false;

  if (put) {
    cache.put(cacheKey, entryData, entryOptions);
  }

  cache.on(`delete:${cacheKey}`, (data) => {
    if (entryData === data) {
      deleteEventEmitted = true;
    }
  });

  cache.delete(cacheKey);
  expect(cache.get(cacheKey)).to.equal(undefined);
  expect(deleteEventEmitted).to.equal(expectedResult);
}

function _reapEntryEventTest (cache, entryOptions, expectedResult, done) {
  const cacheKey = 'abc';
  const entryData = 123;

  let entryRemoved = false;

  let options = Object.assign(entryOptions || {}, { ttl: 100 });
  cache.put(cacheKey, entryData, options);

  cache.on(`delete:${cacheKey}`, (data) => {
    if (entryData === data) {
      entryRemoved = true;
    }
  });

  cache.startReaper(200);

  setTimeout(() => {
    expect(cache.get(cacheKey)).to.equal(undefined);
    expect(entryRemoved).to.equal(expectedResult);
    done();
  }, 400);
}

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

  context('"emitEntryChanges" cache option is not set (default), entry option is not set', () => {
    it('should NOT emit an event when an entry is added', () => {
      _putEntryEventTest(cache, undefined, false);
    });

    it('should NOT emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, undefined, false);
    });

    it('should not emit delete event if cache entry does not exist', () => {
      _deleteEntryEventTest(cache, undefined, false, {
        put: false
      });
    });

    it('should NOT emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, undefined, false, done);
    });
  });

  context('"emitEntryChanges" cache option is not set, entry option is set to "true"', () => {
    it('should emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true, done);
    });
  });

  context('"emitEntryChanges" cache option is not set, entry option is set to "false"', () => {
    it('should emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "true", entry option is not set', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_ENABLED);
    });

    it('should emit an event when an entry is added', () => {
      _putEntryEventTest(cache, undefined, true);
    });

    it('should emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, undefined, true);
    });

    it('should emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, undefined, true, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "true", entry option is set to "true"', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_ENABLED);
    });

    it('should emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "true", entry option is set to "false"', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_ENABLED);
    });

    it('should override cache option and NOT emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should override cache option and NOT emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should override cache option and NOT emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "false", entry option is not set', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_DISABLED);
    });

    it('should NOT emit an event when an entry is added', () => {
      _putEntryEventTest(cache, undefined, false);
    });

    it('should NOT emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, undefined, false);
    });

    it('should NOT emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, undefined, false, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "false", entry option is set to "true"', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_DISABLED);
    });

    it('should override cache option and emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should override cache option and emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true);
    });

    it('should override cache option and emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_ENABLED, true, done);
    });
  });

  context('"emitEntryChanges" cache option is set to "false", entry option is set to "false"', () => {
    beforeEach(() => {
      cache = InMemoryCache.create(EMIT_ENTRY_CHANGES_DISABLED);
    });

    it('should NOT emit an event when an entry is added', () => {
      _putEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should NOT emit an event when an entry is deleted', () => {
      _deleteEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false);
    });

    it('should NOT emit an event when an entry is reaped', (done) => {
      _reapEntryEventTest(cache, EMIT_ENTRY_CHANGES_DISABLED, false, done);
    });
  });
});
