# deferred-leveldown

**Superseded by [`abstract-level`](https://github.com/Level/abstract-level). Please see [Frequently Asked Questions](https://github.com/Level/community#faq).**

## Usage

_If you are upgrading: please see [UPGRADING.md](UPGRADING.md)._

`deferred-leveldown` implements the [`abstract-leveldown`](https://github.com/Level/abstract-leveldown) API so it can be used as a drop-in replacement where `leveldown` is needed.

`put()`, `get()`, `getMany()`, `del()`, `batch()` and `clear()` operations are all queued and kept in memory until the `abstract-leveldown`-compatible object has been opened through `deferred-leveldown`'s `open()` method.

`batch()` operations will all be replayed as the array form. Chained-batch operations are converted before being stored.

```js
const deferred  = require('deferred-leveldown')
const leveldown = require('leveldown')

const db = deferred(leveldown('location'))

// Must always call open() first
db.open(function (err) {
  // ...
})

// But can operate before open() has finished
db.put('foo', 'bar', function (err) {
  // ...
})
```

## Contributing

[`Level/deferred-leveldown`](https://github.com/Level/deferred-leveldown) is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [Contribution Guide](https://github.com/Level/community/blob/master/CONTRIBUTING.md) for more details.

## Donate

Support us with a monthly donation on [Open Collective](https://opencollective.com/level) and help us continue our work.

## License

[MIT](LICENSE)

[level-badge]: https://leveljs.org/img/badge.svg
