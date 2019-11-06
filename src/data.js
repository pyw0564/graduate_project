require('dotenv').config({
  path: __dirname + '/../.env'
})
const sql = require('mssql')
const fs = require('fs')
const sqlConfig = {
  user: process.env.DB_USER ? process.env.DB_USER : 'sa', // mssql username
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '1111', // mssql password
  server: process.env.DB_SERVER ? process.env.DB_SERVER : `pyw\\SQLEXPRESS`, // 서버 주소
  database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'GraduateProject', // 사용할 database 이름
  stream: 'true', // ???
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433, // 서버 port 설정
  autoSchemaSync: true, // ???
  option: {
    encrypt: 'false'
  }, // ???
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 30000
  }
}
var algorithm_list = {}

async function readDB() {
  for(let item in algorithm_list) delete algorithm_list[item]
  // SQL 접속
  console.log('SQL Connecting. . .')
  // ref 파일 생성
  var path = __dirname + '/../ref'
  await mkdir(path)
  await verification(path, [{
    tableName: 'algorithms'
  }]);
  //console.log(algorithm_list)
}

async function sqlQuery(query) {
  return await new sql.ConnectionPool(sqlConfig).connect().then(async pool => {
    return pool.request().query(query)
  }).then(async result => {
    await sql.close()
    return result
  }).catch(async err => {
    await sql.close()
    return err
  })
}

function makeAlgorithmList(object) {
  let ret = '<ol>'
  for (let key in object) {
    if (object[key].ko) {
      ret += `
      <li class='algorithmMenu_li'>
        <a href="" id=${key} class='algorithmMenu'>${object[key].ko}</a>
      </li>`
    }
  }
  ret += '</ol>'
  return ret;
}

function recursiveMakeAlgorithmList(object) {
  let ret = '<ol>'
  for (let key in object) {
    if (object[key].ko) {
      ret += `<li><a href="" id=${key} class='algorithmMenu'>${object[key].ko}</a>`
      ret += recursiveMakeAlgorithmList(object[key])
      ret += '</li>'
    }
  }
  ret += '</ol>'
  return ret;
}

exports.sqlQuery = sqlQuery
exports.sqlConfig = sqlConfig
exports.readDB = readDB
exports.algorithm_list = algorithm_list
exports.recursiveMakeAlgorithmList = recursiveMakeAlgorithmList
exports.makeAlgorithmList = makeAlgorithmList
