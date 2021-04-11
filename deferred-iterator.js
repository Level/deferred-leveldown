'use strict'

const AbstractIterator = require('abstract-leveldown').AbstractIterator
const inherits = require('inherits')

function DeferredIterator (db, options) {
  AbstractIterator.call(this, db)

  this._options = options
  this._iterator = null
  this._operations = []
}

inherits(DeferredIterator, AbstractIterator)

DeferredIterator.prototype.setDb = function (db) {
  const it = this._iterator = db.iterator(this._options)

  for (const op of this._operations) {
    it[op.method](...op.args)
  }
}

DeferredIterator.prototype._operation = function (method, args) {
  if (this._iterator) return this._iterator[method](...args)
  this._operations.push({ method, args })
}

for (const m of ['next', 'end']) {
  DeferredIterator.prototype['_' + m] = function (...args) {
    this._operation(m, args)
  }
}

// Must defer seek() rather than _seek() because it requires db._serializeKey to be available
DeferredIterator.prototype.seek = function (...args) {
  this._operation('seek', args)
}

module.exports = DeferredIterator
