var util = require('util')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var DeferredIterator = require('./deferred-iterator')
var deferrables = 'put get del batch approximateSize'.split(' ')

function DeferredLevelDOWN (db) {
  AbstractLevelDOWN.call(this, '')
  this._db = db
  this._operations = []
  this._iterators = []
}

util.inherits(DeferredLevelDOWN, AbstractLevelDOWN)

DeferredLevelDOWN.prototype._open = function (options, callback) {
  var self = this

  this._db.open(options, function (err) {
    if (err) return callback(err)

    self._operations.forEach(function (op) {
      self._db[op.method].apply(self._db, op.args)
    })
    self._operations = []
    self._iterators.forEach(function (it) {
      it.setDb(self._db)
    })
    self._iterators = []
    open(self)
    callback()
  })
}

DeferredLevelDOWN.prototype._close = function (callback) {
  var self = this

  this._db.close(function (err) {
    if (err) return callback(err)
    closed(self)
    callback()
  })
}

function open (obj) {
  deferrables.concat('iterator').forEach(function (m) {
    obj['_' + m] = function () {
      return this._db[m].apply(this._db, arguments)
    }
  })
}

function closed (obj) {
  deferrables.forEach(function (m) {
    obj['_' + m] = function () {
      this._operations.push({ method: m, args: arguments })
    }
  })
  obj._iterator = function (options) {
    var it = new DeferredIterator(options)
    this._iterators.push(it)
    return it
  }
}

closed(DeferredLevelDOWN.prototype)

DeferredLevelDOWN.prototype._isBuffer = function (obj) {
  return Buffer.isBuffer(obj)
}

DeferredLevelDOWN.prototype._serializeKey = function (key) {
  return key
}

DeferredLevelDOWN.prototype._serializeValue = function (value) {
  return value
}

module.exports = DeferredLevelDOWN
module.exports.DeferredIterator = DeferredIterator
