class CacheEntry {
  constructor (cache, data, options) {
    options = options || {};

    let ttl = options.ttl || cache._ttlDefault;

    this.data = data;
    this.ttl = ttl;
    this.expiresTimestamp = (ttl === -1) ? undefined : (Date.now() + ttl);
    this.keepAliveOnAccess = (options.keepAliveOnAccess !== false);
  }
}

module.exports = CacheEntry;
