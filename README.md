# deferred-leveldown

> A mock `abstract-leveldown` implementation that queues operations while a real `abstract-leveldown` instance is being opened.

[![level badge][level-badge]](https://github.com/level/awesome)
[![npm](https://img.shields.io/npm/v/deferred-leveldown.svg)](https://www.npmjs.com/package/deferred-leveldown)
![Node version](https://img.shields.io/node/v/deferred-leveldown.svg)
[![Build Status](https://travis-ci.org/Level/deferred-leveldown.svg?branch=master)](https://travis-ci.org/Level/deferred-leveldown)
[![david](https://img.shields.io/david/level/deferred-leveldown.svg)](https://david-dm.org/level/deferred-leveldown)
[![Coverage Status](https://coveralls.io/repos/github/Level/deferred-leveldown/badge.svg)](https://coveralls.io/github/Level/deferred-leveldown)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/dm/deferred-leveldown.svg)](https://www.npmjs.com/package/deferred-leveldown)

`deferred-leveldown` implements the basic [abstract-leveldown](https://github.com/Level/abstract-leveldown) API so it can be used as a drop-in replacement where `leveldown` is needed.

`put()`, `get()`, `del()` and `batch()` operations are all queued and kept in memory until the `abstract-leveldown`-compatible object has been opened through `deferred-leveldown`'s `open()` method.

`batch()` operations will all be replayed as the array form. Chained-batch operations are converted before being stored.

```js
const deferred  = require('deferred-leveldown')
const leveldown = require('leveldown')

const db = deferred(leveldown('location'))

db.put('foo', 'bar', function (err) {

})

db.open(function (err) {
  // ...
})
```

**If you are upgrading:** please see [UPGRADING.md](UPGRADING.md).

## Contributing

`deferred-leveldown` is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/Level/community/blob/master/CONTRIBUTING.md) file for more details.

## License

Copyright (c) 2013-present `deferred-leveldown` contributors (listed above).

`deferred-leveldown` is licensed under the MIT license. All rights not explicitly granted in the MIT license are reserved. See the included [LICENSE.md](LICENSE.md) file for more details.

[level-badge]: http://leveldb.org/img/badge.svg
