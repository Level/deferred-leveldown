'use strict'

const test = require('tape')
const reachdown = require('reachdown')
const memdown = require('memdown')
const suite = require('abstract-leveldown/test')
const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const AbstractIterator = require('abstract-leveldown').AbstractIterator
const DeferredLevelDOWN = require('.')
const noop = function () {}

const testCommon = suite.common({
  test: test,
  factory: function () {
    return new DeferredLevelDOWN(memdown())
  },

  // Unsupported features
  createIfMissing: false,
  errorIfExists: false,

  // Opt-in to new tests
  clear: true,
  getMany: true
})

// Hack: disable failing tests. These fail on serialize tests
require('abstract-leveldown/test/put-test').args = noop
require('abstract-leveldown/test/get-test').args = noop
require('abstract-leveldown/test/get-many-test').args = noop
require('abstract-leveldown/test/del-test').args = noop

// This fails on "iterator has db reference" test, as expected because
// the return value of db.iterator() depends on whether the db is open.
require('abstract-leveldown/test/iterator-test').args = noop

// Test abstract-leveldown compliance
suite(testCommon)

// Custom tests
test('deferred open gets correct options', function (t) {
  const OPTIONS = { foo: 'BAR' }
  const db = mockDown({
    _open: function (options, callback) {
      t.same(options, OPTIONS, 'options passed on to open')
      this._nextTick(callback)
    }
  })

  const ld = new DeferredLevelDOWN(db)
  ld.open(OPTIONS, function (err) {
    t.error(err, 'no error')
    t.end()
  })
})

test('single operation', function (t) {
  t.plan(7)

  let called = false

  const db = mockDown({
    _put: function (key, value, options, callback) {
      called = true

      t.equal(key, 'foo', 'correct key')
      t.equal(value, 'bar', 'correct value')
      t.deepEqual({}, options, 'empty options')

      this._nextTick(callback)
    },
    _open: function (options, callback) {
      t.is(called, false, 'not yet called')
      this._nextTick(callback)
    }
  })

  const ld = new DeferredLevelDOWN(db)

  ld.put('foo', 'bar', function (err) {
    t.error(err, 'no error')
  })

  ld.open(function (err) {
    t.is(called, true, 'called')
    t.error(err, 'no error')
  })
})

test('many operations', function (t) {
  const calls = []
  const db = mockDown({
    _put: function (key, value, options, callback) {
      if (puts++ === 0) {
        t.equal(key, 'foo1', 'correct key')
        t.equal(value, 'bar1', 'correct value')
        t.deepEqual(options, {}, 'empty options')
      } else {
        t.equal(key, 'foo2', 'correct key')
        t.equal(value, 'bar2', 'correct value')
        t.deepEqual(options, {}, 'empty options')
      }
      this._nextTick(callback, null, 'put' + puts)
    },
    _get: function (key, options, callback) {
      if (gets++ === 0) {
        t.equal('woo1', key, 'correct key')
        t.deepEqual(options, { asBuffer: true }, 'empty options')
      } else {
        t.equal('woo2', key, 'correct key')
        t.deepEqual(options, { asBuffer: true }, 'empty options')
      }
      this._nextTick(callback, null, 'gets' + gets)
    },
    _del: function (key, options, callback) {
      t.equal('blergh', key, 'correct key')
      t.deepEqual(options, {}, 'empty options')
      this._nextTick(callback, null, 'del')
    },
    _batch: function (arr, options, callback) {
      if (batches++ === 0) {
        t.deepEqual(arr, [
          { type: 'put', key: 'k1', value: 'v1' },
          { type: 'put', key: 'k2', value: 'v2' }
        ], 'correct batch')
      } else {
        t.deepEqual(arr, [
          { type: 'put', key: 'k3', value: 'v3' },
          { type: 'put', key: 'k4', value: 'v4' }
        ], 'correct batch')
      }
      this._nextTick(callback)
    },
    _clear: function (options, callback) {
      if (clears++ === 0) {
        t.deepEqual(options, { reverse: false, limit: -1 }, 'default options')
      } else {
        t.deepEqual(options, { gt: 'k5', reverse: false, limit: -1 }, 'range option')
      }

      this._nextTick(callback)
    },
    _open: function (options, callback) {
      this._nextTick(callback)
    }
  })

  const ld = new DeferredLevelDOWN(db)

  let puts = 0
  let gets = 0
  let batches = 0
  let clears = 0

  ld.put('foo1', 'bar1', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'put', key: 'foo1', v: v })
  })
  ld.get('woo1', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'get', key: 'woo1', v: v })
  })
  ld.clear(function () {
    calls.push({ type: 'clear' })
  })
  ld.put('foo2', 'bar2', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'put', key: 'foo2', v: v })
  })
  ld.get('woo2', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'get', key: 'woo2', v: v })
  })
  ld.del('blergh', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'del', key: 'blergh', v: v })
  })
  ld.batch([
    { type: 'put', key: 'k1', value: 'v1' },
    { type: 'put', key: 'k2', value: 'v2' }
  ], function () {
    calls.push({ type: 'batch', keys: 'k1,k2' })
  })
  ld
    .batch()
    .put('k3', 'v3')
    .put('k4', 'v4')
    .write(function () {
      calls.push({ type: 'batch', keys: 'k3,k4' })
    })
  ld.clear({ gt: 'k5' }, function () {
    calls.push({ type: 'clear', gt: 'k5' })
  })

  t.ok(calls.length === 0, 'not called')

  ld.open(function (err) {
    t.error(err, 'no error')
    t.ok(calls.length === 0, 'not called')

    // Wait a tick to account for async callbacks
    // TODO: instead change the order of when we push into `calls`
    ld._nextTick(function () {
      t.equal(calls.length, 9, 'all functions called')
      t.deepEqual(calls, [
        { type: 'put', key: 'foo1', v: 'put1' },
        { type: 'get', key: 'woo1', v: 'gets1' },
        { type: 'clear' },
        { type: 'put', key: 'foo2', v: 'put2' },
        { type: 'get', key: 'woo2', v: 'gets2' },
        { type: 'del', key: 'blergh', v: 'del' },
        { type: 'batch', keys: 'k1,k2' },
        { type: 'batch', keys: 'k3,k4' },
        { type: 'clear', gt: 'k5' }
      ], 'calls correctly behaved')

      t.end()
    })
  })
})

test('keys and values should not be serialized', function (t) {
  const DATA = []
  const ITEMS = [
    123,
    'a string',
    Buffer.from('w00t'),
    { an: 'object' }
  ]
  ITEMS.forEach(function (k) {
    ITEMS.forEach(function (v) {
      DATA.push({ key: k, value: v })
    })
  })

  function noop () {}
  function Db (methods) { return new DeferredLevelDOWN(mockDown(methods)) }

  t.plan(9)

  t.test('put', function (t) {
    const calls = []
    const ld = Db({
      _put: function (key, value) {
        calls.push({ key: key, value: value })
      }
    })
    DATA.forEach(function (d) { ld.put(d.key, d.value, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, DATA, 'value ok')
      t.end()
    })
  })

  t.test('get', function (t) {
    const calls = []
    const ld = Db({ _get: function (key) { calls.push(key) } })
    ITEMS.forEach(function (key) { ld.get(key, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS, 'value ok')
      t.end()
    })
  })

  t.test('getMany', function (t) {
    const calls = []
    const ld = Db({ _getMany: function (keys) { calls.push(keys[0]) } })
    ITEMS.forEach(function (key) { ld.getMany([key], noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS, 'value ok')
      t.end()
    })
  })

  t.test('del', function (t) {
    const calls = []
    const ld = Db({ _del: function (key, cb) { calls.push(key) } })
    ITEMS.forEach(function (key) { ld.del(key, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS, 'value ok')
      t.end()
    })
  })

  t.test('clear', function (t) {
    const calls = []
    const ld = Db({ _clear: function (opts, cb) { calls.push(opts) } })
    ITEMS.forEach(function (key) { ld.clear({ gt: key }, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS.map(function (key) {
        return { gt: key, reverse: false, limit: -1 }
      }), 'value ok')
      t.end()
    })
  })

  t.test('approximateSize', function (t) {
    const calls = []
    const ld = Db({
      approximateSize: function (start, end, cb) {
        calls.push({ start: start, end: end })
      }
    })
    ITEMS.forEach(function (key) { ld.approximateSize(key, key, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS.map(function (i) {
        return { start: i, end: i }
      }), 'value ok')
      t.end()
    })
  })

  t.test('store not supporting approximateSize', function (t) {
    const ld = Db({})
    t.throws(function () {
      ld.approximateSize('key', 'key', noop)
    }, /approximateSize is not a function/)
    t.end()
  })

  t.test('compactRange', function (t) {
    const calls = []
    const ld = Db({
      compactRange: function (start, end, cb) {
        calls.push({ start: start, end: end })
      }
    })
    ITEMS.forEach(function (key) { ld.compactRange(key, key, noop) })
    ld.open(function (err) {
      t.error(err, 'no error')
      t.same(calls, ITEMS.map(function (i) {
        return { start: i, end: i }
      }), 'value ok')
      t.end()
    })
  })

  t.test('store not supporting compactRange', function (t) {
    const ld = Db({})
    t.throws(function () {
      ld.compactRange('key', 'key', noop)
    }, /compactRange is not a function/)
    t.end()
  })
})

test('_close calls close for underlying store', function (t) {
  t.plan(2)

  const db = mockDown({
    _close: function (callback) {
      t.pass('close for underlying store is called')
      this._nextTick(callback)
    }
  })
  const ld = new DeferredLevelDOWN(db)

  ld.close(function (err) {
    t.error(err, 'no error')
  })
})

test('open error on underlying store calls back with error', function (t) {
  t.plan(2)

  const db = mockDown({
    _open: function (options, callback) {
      t.pass('db.open called')
      this._nextTick(callback, new Error('foo'))
    }
  })
  const ld = new DeferredLevelDOWN(db)

  ld.open(function (err) {
    t.is(err.message, 'foo')
  })
})

test('close error on underlying store calls back with error', function (t) {
  t.plan(2)

  const db = mockDown({
    _close: function (callback) {
      t.pass('db.close called')
      this._nextTick(callback, new Error('foo'))
    }
  })
  const ld = new DeferredLevelDOWN(db)

  ld.close(function (err) {
    t.is(err.message, 'foo')
  })
})

test('clear() can schedule other operations itself', function (t) {
  t.plan(3)

  // The default implementation of _clear() uses iterators and calls the
  // private _del() method. Test that those don't go through deferred-leveldown
  // while its state is still 'opening' and is emptying its queue.
  const db = mockDown({
    _iterator (options) {
      return mockIterator(this, {
        _next (callback) {
          callback(null, keys.shift())
        }
      })
    },
    _del (key, options, callback) {
      t.is(key, 'foo')
      this._nextTick(callback)
    }
  })

  const keys = ['foo']
  const ld = new DeferredLevelDOWN(db)

  ld.clear((err) => { t.error(err, 'no error') })
  ld.open((err) => { t.error(err, 'no error') })
})

test('non-deferred approximateSize', function (t) {
  t.plan(4)

  const db = mockDown({
    _open: function (options, cb) {
      this._nextTick(cb)
    },
    approximateSize: function (start, end, callback) {
      t.is(start, 'bar')
      t.is(end, 'foo')
      this._nextTick(callback)
    }
  })
  const ld = new DeferredLevelDOWN(db)

  ld.open(function (err) {
    t.error(err)
    ld.approximateSize('bar', 'foo', function (err) {
      t.error(err)
    })
  })
})

test('non-deferred compactRange', function (t) {
  t.plan(4)

  const db = mockDown({
    _open: function (options, cb) {
      this._nextTick(cb)
    },
    compactRange: function (start, end, callback) {
      t.is(start, 'bar')
      t.is(end, 'foo')
      this._nextTick(callback)
    }
  })
  const ld = new DeferredLevelDOWN(db)

  ld.open(function (err) {
    t.error(err)
    ld.compactRange('bar', 'foo', function (err) {
      t.error(err)
    })
  })
})

test('iterator - deferred operations', function (t) {
  t.plan(9)

  let seekTarget = false

  const db = mockDown({
    _iterator: function (options) {
      return mockIterator(this, {
        _seek: function (target) {
          seekTarget = target
        },
        _next: function (cb) {
          this._nextTick(cb, null, 'key', 'value')
        },
        _end: function (cb) {
          this._nextTick(cb)
        }
      })
    },
    _open: function (options, callback) {
      this._nextTick(callback)
    }
  })
  const ld = new DeferredLevelDOWN(db)
  const it = ld.iterator()
  let nextFirst = false

  it.seek('foo')

  it.next(function (err, key, value) {
    t.is(seekTarget, 'foo', 'seek was called with correct target')
    nextFirst = true
    t.error(err, 'no error')
    t.equal(key, 'key')
    t.equal(value, 'value')
  })

  it.end(function (err) {
    t.error(err, 'no error')
    t.ok(nextFirst)
  })

  ld.open(function (err) {
    t.error(err, 'no error')
    const it2 = ld.iterator()
    it2.end(t.error.bind(t))
  })

  t.ok(require('./').DeferredIterator)
})

test('iterator - non deferred operation', function (t) {
  t.plan(5)
  let seekTarget = false

  const db = mockDown({
    _iterator: function (options) {
      return mockIterator(this, {
        _next: function (cb) {
          this._nextTick(cb, null, 'key', 'value')
        },
        _seek: function (target) {
          seekTarget = target
        },
        _end: function (cb) {
          this._nextTick(cb)
        }
      })
    },
    _open: function (options, callback) {
      this._nextTick(callback)
    }
  })
  const ld = new DeferredLevelDOWN(db)
  const it = ld.iterator()

  ld.open(function (err) {
    t.error(err, 'no error')

    it.seek('foo')

    t.is(seekTarget, 'foo', 'seek was called with correct target')

    it.next(function (err, key, value) {
      t.error(err, 'no error')
      t.equal(key, 'key')
      t.equal(value, 'value')
    })
  })
})

test('iterator - is created in order', function (t) {
  t.plan(4)

  function db () {
    return mockDown({
      order: [],
      _iterator: function (options) {
        this.order.push('iterator created')
        return mockIterator(this, {})
      },
      _put: function (key, value, options, callback) {
        this.order.push('put')
      },
      _open: function (options, callback) {
        this._nextTick(callback)
      }
    })
  }

  const ld1 = new DeferredLevelDOWN(db())
  const ld2 = new DeferredLevelDOWN(db())

  ld1.iterator()
  ld1.put('key', 'value', noop)

  ld2.put('key', 'value', noop)
  ld2.iterator()

  ld1.open(function (err) {
    t.error(err, 'no error')
    t.same(ld1._db.order, ['iterator created', 'put'])
  })

  ld2.open(function (err) {
    t.error(err, 'no error')
    t.same(ld2._db.order, ['put', 'iterator created'])
  })
})

test('reachdown supports deferred-leveldown', function (t) {
  // Define just enough methods for reachdown to see this as a real db
  const db = { open: noop, _batch: noop, _iterator: noop }
  const ld = new DeferredLevelDOWN(db)

  t.is(ld.type, 'deferred-leveldown')
  t.is(reachdown(ld, 'deferred-leveldown'), ld)
  t.is(reachdown(ld), db)

  t.end()
})

function mockDown (methods) {
  function Mock () { AbstractLevelDOWN.call(this) }
  Object.setPrototypeOf(Mock.prototype, AbstractLevelDOWN.prototype)
  for (const m in methods) Mock.prototype[m] = methods[m]
  return new Mock()
}

function mockIterator (db, methods) {
  function Mock () { AbstractIterator.call(this, db) }
  Object.setPrototypeOf(Mock.prototype, AbstractIterator.prototype)
  for (const m in methods) Mock.prototype[m] = methods[m]
  return new Mock()
}
