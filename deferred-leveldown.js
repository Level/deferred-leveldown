'use strict'

const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
const inherits = require('inherits')
const DeferredIterator = require('./deferred-iterator')
const deferrables = 'put get del batch clear'.split(' ')
const optionalDeferrables = 'approximateSize compactRange'.split(' ')

function DeferredLevelDOWN (db) {
  AbstractLevelDOWN.call(this, db.supports || {})

  // TODO (future major): remove this fallback; db must have manifest that
  // declares approximateSize and compactRange in additionalMethods.
  for (const m of optionalDeferrables) {
    if (typeof db[m] === 'function' && !this.supports.additionalMethods[m]) {
      this.supports.additionalMethods[m] = true
    }
  }

  this._db = db
  this._operations = []

  closed(this)
}

inherits(DeferredLevelDOWN, AbstractLevelDOWN)

DeferredLevelDOWN.prototype.type = 'deferred-leveldown'

DeferredLevelDOWN.prototype._open = function (options, callback) {
  this._db.open(options, (err) => {
    if (err) return callback(err)

    for (const op of this._operations) {
      if (op.iterator) {
        op.iterator.setDb(this._db)
      } else {
        this._db[op.method](...op.args)
      }
    }

    this._operations = []

    open(this)
    callback()
  })
}

DeferredLevelDOWN.prototype._close = function (callback) {
  this._db.close((err) => {
    if (err) return callback(err)
    closed(this)
    callback()
  })
}

function open (self) {
  for (const m of deferrables.concat('iterator')) {
    self['_' + m] = function (...args) {
      return this._db[m](...args)
    }
  }

  for (const m of Object.keys(self.supports.additionalMethods)) {
    self[m] = function (...args) {
      return this._db[m](...args)
    }
  }
}

function closed (self) {
  for (const m of deferrables) {
    self['_' + m] = function (...args) {
      this._operations.push({ method: m, args })
    }
  }

  for (const m of Object.keys(self.supports.additionalMethods)) {
    self[m] = function (...args) {
      this._operations.push({ method: m, args })
    }
  }

  self._iterator = function (options) {
    const it = new DeferredIterator(self, options)
    this._operations.push({ iterator: it })
    return it
  }
}

DeferredLevelDOWN.prototype._serializeKey = function (key) {
  return key
}

DeferredLevelDOWN.prototype._serializeValue = function (value) {
  return value
}

module.exports = DeferredLevelDOWN
module.exports.DeferredIterator = DeferredIterator
