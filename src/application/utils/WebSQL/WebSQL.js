/**
 * @class WebSQL
 *
 * # Promise-based API for browser WebSQL
 *
 * ## Usage
 *
 * ### Option 1. Creating an instance
 * const myDB = new WebSQL({name, description, estimatedSize})
 * myDB.query('SELECT...')
 *
 * ### Option 2. Using the class static methods
 * const myDB = WebSQL.open({name, description, estimatedSize})
 * WebSQL.query(myDB, 'SELECT...')
 */
export default class WebSQL {
  /**
   * Open a webSql db with passed params.
   *
   * @example
   * const myDB = WebSQL.open({
   *   name: 'myDB',
   *   description: 'Storage for my app',
   *   estimatedSize: 10 * 1024 * 1024
   * })
   *
   * @param  {String} options.name          DB name
   * @param  {String} options.description   DB description
   * @param  {Number} options.estimatedSize DB size
   * @return {Object} DB handler reference
   */
  static open ({name, description, estimatedSize}) {
    return openDatabase(name, '2.0', description, estimatedSize)
  }

  /**
   * Execute a sql query, the results will be the raw results object of WebSQL
   *
   * @example
   * WebSQL.query(myDB, 'INSERT INTO peopleTable (name) VALUES (?)', ['John Doe'])
   *   .then((results) => ...)
   *
   * @param  {Object} db     DB handler reference from window.openDatabase
   * @param  {String} sql    SQL query to execute
   * @param  {Array}  params Params passed to the query
   * @return {Promise} resolve with sql results, reject with sql error
   */
  static query (db, sql, params = []) {
    return new Promise(function (resolve, reject) {
      db.transaction(function tr (tx) {
        tx.executeSql(sql, params,
          function (transaction, results) {
            resolve(results)
          },
          function (transaction, error) {
            error.sql = sql
            reject(error)
          }
        )
      })
    })
  }

  /**
   * Execute a sql statement on a db and returns the results as an array
   *
   * @example
   * WebSQL.queryArray(myDB, 'SELECT ...')
   *   .then((items) => items.map(...))
   *
   * @param  {Object} db     DB handler reference from window.openDatabase
   * @param  {String} sql    SQL query to execute
   * @param  {Array} params  Params passed to the query
   * @return {Promise}
   */
  static queryArray (db, sql, params) {
    return WebSQL.query(db, sql, params)
      .then((results) => {
        const items = []
        for (var i = 0, l = results.rows.length; i < l; i++) {
          items.push(results.rows.item(i))
        }
        return items
      })
  }

  /**
   * Execute a sql statement on a db and returns the first item of the result
   * @return {Promise}
   */
  static queryOne (db, sql, params) {
    return WebSQL.query(db, sql, params)
      .then((results) => {
        return results.rows.item(0)
      })
  }

  /**
   * Remove a table from a db
   * @param  {Object} db     DB handler reference from window.openDatabase
   * @param  {String} tableName table that should be dropped.
   * @return {Promise}
   */
  static dropTable (db, tableName) {
    return WebSQL.query(db, `DROP TABLE IF EXISTS ${tableName}`)
  }

  /**
   * Opens a db with passed params when an instance is created.
   *
   * @example
   * const myDb = new WebSQL({
   *   name: 'myDB',
   *   description: 'Storage for my app',
   *   estimatedSize: 10 * 1024 * 1024
   * })
   * @param {Object} options
   * @see WebSQL.open
   */
  constructor (options) {
    this.db = WebSQL.open(options)
  }

  /**
   * Execute a sql query, the results will be the raw results object of WebSQL
   * @see WebSQL.query
   *
   * @example
   * myDB.query('INSERT INTO peopleTable (name) VALUES (?)', ['John Doe'])
   *   .then((results) => ...)
   *
   * @param  {String} sql    SQL query to execute
   * @param  {Array}  params Params passed to the query
   * @return {Promise} resolve with sql results, reject with sql error
   */
  query (sql, params) {
    return WebSQL.query(this.db, sql, params)
  }

  /**
   * Execute a sql statement on a db and returns the results as an array
   * @see WebSQL.queryArray
   *
   * @example
   * myDB.queryArray('SELECT ...')
   *   .then((items) => items.map(...))
   *
   * @param  {String} sql    SQL query to execute
   * @param  {Array} params  Params passed to the query
   * @return {Promise}
   */
  queryArray (sql, params) {
    return WebSQL.queryArray(this.db, sql, params)
  }

  /**
   * Execute a sql statement on a db and returns the first item of the result
   * @see WebSQL.queryOne
   *
   * @example
   * myDB.queryOne('SELECT ...')
   *   .then((item) => ...)
   *
   * @param  {String} sql    SQL query to execute
   * @param  {Array} params  Params passed to the query
   * @return {Promise}
   */
  queryOne (sql, params) {
    return WebSQL.queryOne(this.db, sql, params)
  }

  /**
   * Remove a table from a db
   * @see WebSQL.dropTable
   *
   * @example
   * myDB.dropTable('name')
   *   .then(...)
   *
   * @param  {String} tableName table that should be dropped.
   * @return {Promise}
   */
  dropTable (tableName) {
    return WebSQL.dropTable(this.db, tableName)
  }
}
