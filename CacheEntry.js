class CacheEntry {
  constructor (cache, data, options) {
    options = options || {};

    let ttl = options.ttl || cache._ttlDefault;

    this.data = data;
    this.ttl = ttl;
    this.expiresTimestamp = (ttl === -1) ? undefined : (Date.now() + ttl);
    this.keepAliveOnAccess = (options.keepAliveOnAccess !== false);

    // apply cache options value as default if entry option is
    // null or undefined
    if (options.emitKeyChanges === undefined || options.emitKeyChanges === null) {
      this.emitKeyChanges = cache._emitKeyChanges;
    } else {
      this.emitKeyChanges = !!options.emitKeyChanges;
    }
  }
}

module.exports = CacheEntry;
