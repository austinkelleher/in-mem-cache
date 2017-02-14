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
    if (options.emitEntryChanges === undefined || options.emitEntryChanges === null) {
      this.emitEntryChanges = cache._emitEntryChanges;
    } else {
      this.emitEntryChanges = !!options.emitEntryChanges;
    }
  }
}

module.exports = CacheEntry;
