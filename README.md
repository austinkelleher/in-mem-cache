in-mem-cache
===========
JavaScript in memory cache that supports reaping

## Installation

```bash
npm install in-mem-cache --save
```

## Usage

```js
const InMemoryCache = require('in-mem-cache');

const cache = InMemoryCache.create();
const myKey = 'hello';

cache.put(myKey, 'world');
let value = cache.get(myKey); // 'world'
```

The cache will emit an event when cache entries are put and deleted if
the `emitEntryChanges` option is set;

```js
const cache = InMemoryCache.create({ emitEntryChanges: true });

cache.on(`put:${myKey}`, (data) => {
  // data === the entryData that was initially inserted
});

cache.on(`delete:${myKey}`, (data) => {
  // data === the entryData that was initially inserted
});

cache.put(myKey, myData); // triggers the put listener
cache.delete(myKey); // triggers the delete listener
```

Alternatively, the option can also be set as an option when values are being set.

```js
const cache = InMemoryCache.create();

cache.on(`put:${myKey}`, (data) => {
  // data === the entryData that was initially inserted
});

cache.on(`delete:${myKey}`, (data) => {
  // data === the entryData that was initially inserted
});

cache.put(myKey, myData, { emitEntryChanges: true }); // triggers the put listener
cache.delete(myKey); // triggers the delete listener
```

Note: Setting the option on the entry will override the default cache option. This allows for
finer control over what entries the cache will (or will not) emit events for.
