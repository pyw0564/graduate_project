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
  // SQL 접속
  console.log('SQL Connecting. . .')
  // ref 파일 생성
  var path = __dirname + '/../ref'
  await mkdir(path)
  await verification(path, [{
    tableName: 'algorithms'
  }]);
  await recursiveMakeDir(path + '/' + 'algorithms', 'algorithms', algorithm_list)
  console.log(algorithm_list)
}

async function recursiveMakeDir(path, dirName, object) {
  await mkdir(path)
  try {
    let result = await sqlQuery(`SELECT * FROM ${dirName}`)
    if (result.recordset.length == 0) {
      let dirs = fs.readdirSync(path)
      for (let i = 0; i < dirs.length; i++) {
        await deleteFolderRecursive(path + '/' + dirs[i])
      }
      return;
    }
    for (let i = 0; i < result.recordset.length; i++) {
      await verification(path, result.recordset);
      let record = result.recordset[i]
      if (record._type == 'sub') {
        let nextPath = path + '/' + record.tableName
        object[record.tableName] = {}
        object[record.tableName].ko = record.name
        await recursiveMakeDir(nextPath, record.tableName, object[record.tableName])
      } else {
        object.content = record.content
        // base case..
      }
    }
    return
  } catch (err) {
    // console.log('recursiveMakeDir 에러 ~', dirName)
    return
  }
}

async function mkdir(path) {
  if (!fs.existsSync(path)) {
    // await console.log('폴더 생성', path)
    await fs.mkdirSync(path)
  }
}

async function verification(path, recordset) {
  let dirs = fs.readdirSync(path)
  for (let i = 0; i < dirs.length; i++) {
    let dir = dirs[i]
    let flag = false
    for (let j = 0; j < recordset.length; j++) {
      let record = recordset[j].tableName
      if (dir == record) flag = true
    }
    if (flag == false) {
      console.log("파일 삭제", path + '/' + dir)
      await deleteFolderRecursive(path + '/' + dir)
    }
  }
}

async function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(async function(file) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        await deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

async function sqlQuery(query) {
  return await new sql.ConnectionPool(sqlConfig).connect().then(async pool => {
    return pool.request().query(query)
  }).then(async result => {
    await sql.close()
    return result
  }).catch(async err => {
    // console.log("쿼리에러~", query)
    await sql.close()
  })
}

function makeAlgorithmList(object) {
  let ret = '<ol>'
  for (let key in object) {
    if (object[key].ko) {
      ret += `<li><a href="" id=${key} class='algorithmMenu'>${object[key].ko}</a>` + '</li>'
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
