/**
 * @fileoverview Light wrapper {@link ydn.db.Storage} using active transaction
 * instance given at constructor.
 *
 *
 */


goog.provide('ydn.db.tr.TxStorage');
goog.require('ydn.error.NotSupportedException');


/**
 * @implements {ydn.db.tr.Service}
 * @implements {ydn.db.tr.TxService}
 * @param {!ydn.db.tr.Storage} storage
 * @param {!ydn.db.tr.Mutex} mu_tx
 * @param {string} scope
 * @constructor
 */
ydn.db.tr.TxStorage = function(storage, mu_tx, scope) {
  /**
   * @final
   * @type {!ydn.db.tr.Storage}
   * @private
   */
  this.storage_ = storage;
  /**
   * @final
   * @type {SQLTransaction|IDBTransaction|Object}
   * @private
   */
  this.tx_ = mu_tx.getTx(); // tx in mu_tx is mutable

  this.itx_count_ = mu_tx.getTxCount();

  this.scope = scope;

  /**
   * @final
   * @type {!ydn.db.tr.Mutex}
   * @private
   */
  this.mu_tx_ = mu_tx;
};


/**
 *
 * @return {SQLTransaction|IDBTransaction|Object}
 */
ydn.db.tr.TxStorage.prototype.getTx = function() {
  return this.tx_;
};


/**
 *
 * @return {number}
 */
ydn.db.tr.TxStorage.prototype.getTxNo = function() {
  return this.itx_count_;
};


/**
 * Add a transaction complete (also error and abort) event. The listener will
 * be invoked after receiving one of these three events and before executing
 * next transaction. However, it is recommended that listener is not used
 * for transaction logistic tracking, which should, in fact, be tracked request
 * level. Use this listener to release resource for robustness. Any error on
 * the listener will be swallowed.
 * @final
 * @param {?function(string=, *=)} fn first argument is either 'complete',
 * 'error', or 'abort' and second argument is event.
 */
ydn.db.tr.TxStorage.prototype.setCompletedListener = function(fn) {
  this.mu_tx_.oncompleted = fn || null;
};


/**
 * Going out of scope
 */
ydn.db.tr.TxStorage.prototype.out = function() {
  this.mu_tx_.out();
};


/**
 *
 * @inheritDoc
 */
ydn.db.tr.TxStorage.prototype.type = function() {
  return this.storage_.type();
};


/**
 * @inheritDoc
 */
ydn.db.tr.TxStorage.prototype.close = function() {
  return this.storage_.close();
};


/**
 * @inheritDoc
 */
ydn.db.tr.TxStorage.prototype.transaction = function (trFn, store_names, mode, opt_args) {
  // this is nested transaction, and will start new wrap
 this.storage_.transaction(trFn, store_names, mode, opt_args);
};


/**
 * @inheritDoc
 */
ydn.db.tr.TxStorage.prototype.joinTransaction = function (trFn, store_names, opt_mode, opt_args) {
  var names = store_names;
  if (goog.isString(store_names)) {
    names = [store_names];
  } else if (!goog.isArray(store_names) ||
    (store_names.length > 0 && !goog.isString(store_names[0]))) {
    throw new ydn.error.ArgumentException("storeNames");
  }
  var mode = goog.isDef(opt_mode) ? opt_mode : ydn.db.TransactionMode.READ_ONLY;
  var outFn = trFn;
  if (arguments.length > 3) { // handle optional parameters
    // see how this works in goog.partial.
    var args = Array.prototype.slice.call(arguments, 3);
    outFn = function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      newArgs.unshift.apply(newArgs, args);
      return trFn.apply(this, newArgs);
    }
  }

  outFn(this);
};


