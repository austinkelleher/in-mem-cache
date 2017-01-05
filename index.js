'use strict';

const CacheEntry = require('./CacheEntry');
const conflogger = require('conflogger');

class InMemoryCache {
  constructor (options) {
    options = options || {};

    this._logger = conflogger.configure(options.logger);
    this._ttlDefault = options.ttlDefault;
    this._entries = Object.create(null);
    this._reaperTimerId = null;
  }

  put (cacheKey, data, options) {
    let cacheEntry = new CacheEntry(this, data, options);

    if (this._logger.isDebugEnabled()) {
      this._logger.debug(`Cached entry ${cacheKey} with TTL ${cacheEntry.ttl}`);
    }

    this._entries[cacheKey] = cacheEntry;
  }

  delete (cacheKey) {
    delete this._entries[cacheKey];
  }

  getEntry (cacheKey) {
    return this._entries[cacheKey];
  }

  get (cacheKey) {
    let entries = this._entries;
    let entry = entries[cacheKey];
    let data;

    if (entry) {
      let now = Date.now();
      let ttl = entry.ttl;

      if (ttl === -1) {
        // This entry never expires
        // return the data associated with the entry
        data = entry.data;
      } else if (entry.keepAliveOnAccess) {
        entry.expiresTimestamp = now + ttl;
        // return the data associated with the entry
        data = entry.data;
      } else if (Date.now() <= entry.expiresTimestamp) {
        // return the data associated with the entry
        data = entry.data;
      } else {
        // entry has expired
        if (this._logger.isDebugEnabled()) {
          this._logger.debug(`Removing expired entry ${cacheKey}`);
        }
        delete entries[cacheKey];
        entry = null;
      }

      if (entry && this._logger.isDebugEnabled()) {
        this._logger.debug(`Found cache entry for ${cacheKey}`);
      }
    }

    return data;
  }

  isReaperActive () {
    return !!this._reaperTimerId;
  }

  reap () {
    let now = Date.now();

    let entries = this._entries;
    for (var cacheKey in entries) {
      let entry = entries[cacheKey];
      if ((entry.ttl !== -1) && (now > entry.expiresTimestamp)) {
        if (this._logger.isDebugEnabled()) {
          this._logger.debug(`Removing expired entry ${cacheKey}`);
        }
        delete entries[cacheKey];
      }
    }
  }

  startReaper (interval) {
    if (this._reaperTimerId) {
      clearInterval(this._reaperTimerId);
    }

    this._reaperTimerId = setInterval(() => {
      this.reap();
    }, interval || 10000);
  }

  stopReaper () {
    if (this._reaperTimerId) {
      clearInterval(this._reaperTimerId);
      this._reaperTimerId = null;
    }
  }
}

exports.create = (options) => {
  return new InMemoryCache(options);
};
