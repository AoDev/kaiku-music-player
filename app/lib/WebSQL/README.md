# websql-promise
Promise-based API for WebSQL.

The goal is to have a promise-based interface with the browser WebSQL database.  
Especially for data storage in [Electron](http://electron.atom.io/) applications.

## Usage

`import WebSQL from '...`

```
const myDB = new WebSQL({
  name: 'myDB',
  description: 'Storage for my app',
  estimatedSize: 10 * 1024 * 1024
})

myDB.query('SELECT ...')
```

## API

## Methods

<dl>
<dt><a href="#query">query(sql, params)</a> ⇒ <code>Promise</code></dt>
<dd><p>Execute a sql query, the results will be the raw results object of WebSQL</p>
</dd>
<dt><a href="#queryArray">queryArray(sql, params)</a> ⇒ <code>Promise</code></dt>
<dd><p>Execute a sql statement on a db and returns the results as an array</p>
</dd>
<dt><a href="#queryOne">queryOne(sql, params)</a> ⇒ <code>Promise</code></dt>
<dd><p>Execute a sql statement on a db and returns the first item of the result</p>
</dd>
<dt><a href="#dropTable">dropTable(tableName)</a> ⇒ <code>Promise</code></dt>
<dd><p>Remove a table from a db</p>
</dd>
</dl>

<a name="query"></a>

## query(sql, params) ⇒ <code>Promise</code>
Execute a sql query, the results will be the raw results object of WebSQL

**Returns**: <code>Promise</code> - resolve with sql results, reject with sql error  
**See**: WebSQL.query  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | SQL query to execute |
| params | <code>Array</code> | Params passed to the query |

**Example**  
```js
myDB.query('INSERT INTO peopleTable (name) VALUES (?)', ['John Doe'])
  .then((results) => ...)
```
<a name="queryArray"></a>

## queryArray(sql, params) ⇒ <code>Promise</code>
Execute a sql statement on a db and returns the results as an array

**See**: WebSQL.queryArray  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | SQL query to execute |
| params | <code>Array</code> | Params passed to the query |

**Example**  
```js
myDB.queryArray('SELECT ...')
  .then((items) => items.map(...))
```
<a name="queryOne"></a>

## queryOne(sql, params) ⇒ <code>Promise</code>
Execute a sql statement on a db and returns the first item of the result

**See**: WebSQL.queryOne  

| Param | Type | Description |
| --- | --- | --- |
| sql | <code>String</code> | SQL query to execute |
| params | <code>Array</code> | Params passed to the query |

**Example**  
```js
myDB.queryOne('SELECT ...')
  .then((item) => ...)
```
<a name="dropTable"></a>

## dropTable(tableName) ⇒ <code>Promise</code>
Remove a table from a db

**See**: WebSQL.dropTable  

| Param | Type | Description |
| --- | --- | --- |
| tableName | <code>String</code> | table that should be dropped. |

**Example**  
```js
myDB.dropTable('name')
  .then(...)
``` 

## Usage Alternative

All the methods are available as static class functions.

Instead of creating an instance, you can call the static functions where the first argument would be your db reference.

### WebSQL.open() ⇒ <code>Object</code>
**Returns**: <code>Object</code> - DB handler reference  

```js
const myDB = WebSQL.open({
  name: 'myDB',
  description: 'Storage for my app',
  estimatedSize: 10 * 1024 * 1024
})

WebSQL.query(myDB, 'INSERT ...', [params]).then()
WebSQL.queryArray(myDB, 'SELECT ...').then()
WebSQL.queryOne(myDB, 'SELECT ...').then()
WebSQL.dropTable(myDB, 'myTable').then()

```
