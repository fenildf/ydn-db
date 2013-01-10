// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Provide iteration query.
 *
 * @author kyawtun@yathit.com (Kyaw Tun)
 */

goog.provide('ydn.db.sql.Storage');
goog.require('ydn.db.sql.TxQueue');
goog.require('ydn.db.index.Storage');


/**
 * Construct storage providing atomic CRUD database operations on implemented
 * storage mechanisms.
 *
 * This class do not execute database operation, but create a non-overlapping
 * transaction queue on ydn.db.core.TxQueue and all operations are
 * passed to it.
 *
 *
 * @param {string=} opt_dbname database name.
 * @param {(!ydn.db.schema.Database|!DatabaseSchema)=} opt_schema database
 * schema
 * or its configuration in JSON format. If not provided, default empty schema
 * is used.
 * @param {!StorageOptions=} opt_options options.
 * @extends {ydn.db.index.Storage}
 * @implements {ydn.db.sql.IStorage}
 * @constructor
 */
ydn.db.sql.Storage = function(opt_dbname, opt_schema, opt_options) {

  goog.base(this, opt_dbname, opt_schema, opt_options);

};
goog.inherits(ydn.db.sql.Storage, ydn.db.index.Storage);




/**
 * @override
 */
ydn.db.sql.Storage.prototype.newTxQueue = function(scope_name) {
  return new ydn.db.sql.TxQueue(this, this.ptx_no++, scope_name,
    this.schema);
};

/**
 * @param {string} sql SQL statement.
 * @param {!Array=} params SQL parameters.
 * @return {!goog.async.Deferred} return result as list.
 */
ydn.db.sql.Storage.prototype.executeSql = function (sql, params) {
  return this.default_tx_queue_.executeSql(sql, params);
};

//
///**
// * Explain query plan.
// * @param {!ydn.db.Iterator} q
// * @return {Object} plan in JSON
// */
//ydn.db.sql.Storage.prototype.explain = function(q) {
//  return this.default_tx_queue_.explain(q);
//};

