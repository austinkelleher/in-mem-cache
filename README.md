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
