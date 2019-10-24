const data = require('./data')
const express = require('express')
const router = express()
const pug = require('pug')
const fs = require('fs')
const sql = require('mssql')
const path = require('path')
const mime = require('mime')
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
/* 세션 */
const session = require('express-session')
const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
var redisStore = require('connect-redis')(session) // 레디스

router.use(session({ // 세션 init
  secret: 'My!name@is#pyw',
  store: new redisStore({
    client: client
  }),
  resave: false,
  saveUninitialized: true
}))

router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(express.static('public'))
router.use(bodyParser.json());
router.use('/', express.static(__dirname + '/../'));

// 리스트 생성
router.post('/algorithm/createList', async function(req, res) {
  const parent = req.body.parent
  const algorithmName_ko = req.body.algorithmName_ko
  const algorithm_list = req.body.algorithm_list
  const algorithm_content_list = req.body.algorithm_content_list
  let render = pug.renderFile('./views/algorithm/create/list.pug', {
    parent: parent,
    algorithmName_ko: algorithmName_ko,
    algorithm_content_list: algorithm_content_list,
    algorithm_list: algorithm_list
  })
  res.json(render)
})
// 리스트 DB 생성
router.post('/algorithm/createList/post', async function(req, res) {
  const name = req.body.name
  const tableName = req.body.tableName
  const parent = req.body.parent
  const rowQuery = `
  IF NOT EXISTS(SELECT * FROM ${parent} WHERE name='${name}' AND tableName='${tableName}')
    BEGIN
      INSERT INTO ${parent} VALUES('sub', '${name}', '${tableName}', '');
    END`
  const tableQuery = `CREATE TABLE ${tableName}(
    	_type NVARCHAR(100) NOT NULL,
    	name NVARCHAR(100) NOT NULL,
    	tableName NVARCHAR(100) NOT NULL,
    	content NVARCHAR(MAX))`;
  await sqlQuery(rowQuery)
  await sqlQuery(tableQuery)
  res.redirect('/')
})

// 내용 생성
router.post('/algorithm/createContent', async function(req, res) {
  const parent = req.body.parent
  const algorithmName_ko = req.body.algorithmName_ko
  let contentCheck = await sqlQuery(`SELECT * FROM ${parent} WHERE _type='content'`)
  if (contentCheck.recordset.length) {
    res.json({
      result: 'NO',
      err: '이미 내용이 존재합니다'
    })
    return;
  }
  let render = pug.renderFile('./views/algorithm/create/content.pug', {
    parent: parent,
    algorithmName_ko: algorithmName_ko,
  })
  res.json(render)
})
// 내용 DB 생성
router.post('/algorithm/createContent/post', async function(req, res) {
  const content = req.body.txt
  const parent = req.body.parent
  const query = `INSERT INTO ${parent} VALUES('content', '', '', '${content}');`
  sqlQuery(query)
  res.redirect('/')
})
// 리스트 수정
router.post('/algorithm/modifyList', async function(req, res) {

})
router.post('/algorithm/deleteList', async function(req, res) {
  const algorithmName_ko = req.body.algorithmName_ko
  const algorithm_list = req.body.algorithm_list
  const algorithm_content_list = req.body.algorithm_content_list
  const tableName = req.body.tableName

  console.log("hi", tableName)
})
router.post('/algorithm/delete/:form', async function(req, res) {
  const parent = req.body.parent
  const algorithmName_ko = req.body.algorithmName_ko
  const algorithm_list = req.body.algorithm_list
  const algorithm_content_list = req.body.algorithm_content_list
  const form = req.params.form
  console.log('hi', form)
  if (form == 'list') {
    let render = pug.renderFile('./views/algorithm/delete/list.pug', {
      algorithmName_ko: undefinedCheck(algorithmName_ko),
      algorithm_list: undefinedCheck(algorithm_list),
      algorithm_content_list: undefinedCheck(algorithm_content_list)
    })
    res.json(render)
    return
  } else if (form == 'content') {
    let selectQuery = `SELECT * FROM ${parent} WHERE _type='content'`
    let ret = await sqlQuery(selectQuery)
    if (ret.recordset.length) {
      let deleteQuery = `DELETE FROM ${parent} WHERE _type='content'`
      await sqlQuery(deleteQuery)
      res.json({
        result: "YES",
      })
      return
    } else {
      res.json({
        result: "NO",
        err: "현재 내용이 존재하지 않습니다"
      })
    }
  } else if (form == 'table') {

  } else return
})

router.post('/algorithm/:algorithmName', async function(req, res) {
  var object = {
    algorithmName: undefinedCheck(req.body.algorithmName),
    algorithmName_ko: undefinedCheck(req.body.algorithmName_ko),
    algorithm_list: undefinedCheck(req.body.algorithm_list),
    algorithm_content: undefinedCheck(req.body.algorithm_list.content),
    algorithm_content_list: undefinedCheck(makeAlgorithmList(req.body.algorithm_list))
  }
  let render = pug.renderFile('./views/algorithm/main.pug', object)
  res.json(render)
})

module.exports = router
