var test = require('tape')
var DeferredLevelDOWN = require('./')

test('deferred open gets correct options', function (t) {
  var OPTIONS = { foo: 'BAR' }
  var db = {
    open: function (options, callback) {
      t.same(options, OPTIONS, 'options passed on to open')
      process.nextTick(callback)
    }
  }

  var ld = new DeferredLevelDOWN(db)
  ld.open(OPTIONS, function (err) {
    t.error(err, 'no error')
    t.end()
  })
})

test('single operation', function (t) {
  var called = false
  var db = {
    put: function (key, value, options, callback) {
      t.equal(key, 'foo', 'correct key')
      t.equal(value, 'bar', 'correct value')
      t.deepEqual({}, options, 'empty options')
      callback(null, 'called')
    },
    open: function (options, callback) {
      process.nextTick(callback)
    }
  }

  var ld = new DeferredLevelDOWN(db)
  ld.put('foo', 'bar', function (err, v) {
    t.error(err, 'no error')
    called = v
  })

  t.ok(called === false, 'not called')

  ld.open(function (err) {
    t.error(err, 'no error')
    t.ok(called === 'called', 'function called')
    t.end()
  })
})

test('many operations', function (t) {
  var calls = []
  var db = {
    put: function (key, value, options, callback) {
      if (puts++ === 0) {
        t.equal(key, 'foo1', 'correct key')
        t.equal(value, 'bar1', 'correct value')
        t.deepEqual(options, {}, 'empty options')
      } else {
        t.equal(key, 'foo2', 'correct key')
        t.equal(value, 'bar2', 'correct value')
        t.deepEqual(options, {}, 'empty options')
      }
      callback(null, 'put' + puts)
    },
    get: function (key, options, callback) {
      if (gets++ === 0) {
        t.equal('woo1', key, 'correct key')
        t.deepEqual(options, { asBuffer: true }, 'empty options')
      } else {
        t.equal('woo2', key, 'correct key')
        t.deepEqual(options, { asBuffer: true }, 'empty options')
      }
      callback(null, 'gets' + gets)
    },
    del: function (key, options, callback) {
      t.equal('blergh', key, 'correct key')
      t.deepEqual(options, {}, 'empty options')
      callback(null, 'del')
    },
    batch: function (arr, options, callback) {
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
      callback()
    },
    open: function (options, callback) {
      process.nextTick(callback)
    }
  }

  var ld = new DeferredLevelDOWN(db)
  var puts = 0
  var gets = 0
  var batches = 0

  ld.put('foo1', 'bar1', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'put', key: 'foo1', v: v })
  })
  ld.get('woo1', function (err, v) {
    t.error(err, 'no error')
    calls.push({ type: 'get', key: 'woo1', v: v })
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

  t.ok(calls.length === 0, 'not called')

  ld.open(function (err) {
    t.error(err, 'no error')

    t.equal(calls.length, 7, 'all functions called')
    t.deepEqual(calls, [
      { type: 'put', key: 'foo1', v: 'put1' },
      { type: 'get', key: 'woo1', v: 'gets1' },
      { type: 'put', key: 'foo2', v: 'put2' },
      { type: 'get', key: 'woo2', v: 'gets2' },
      { type: 'del', key: 'blergh', v: 'del' },
      { type: 'batch', keys: 'k1,k2' },
      { type: 'batch', keys: 'k3,k4' }
    ], 'calls correctly behaved')

    t.end()
  })
})

test('iterators', function (t) {
  t.plan(8)

  var db = {
    iterator: function (options) {
      return {
        next: function (cb) {
          cb(null, 'key', 'value')
        },
        end: function (cb) {
          process.nextTick(cb)
        }
      }
    },
    open: function (options, callback) {
      process.nextTick(callback)
    }
  }
  var ld = new DeferredLevelDOWN(db)
  var it = ld.iterator()
  var nextFirst = false

  it.next(function (err, key, value) {
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
    var it2 = ld.iterator()
    it2.end(t.error.bind(t))
  })

  t.ok(require('./').DeferredIterator)
})
