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

const sqlQuery = data.sqlQuery

router.use(bodyParser.urlencoded({
  extended: false
}));
router.use(express.static('public'))
router.use(bodyParser.json());
router.use('/', express.static(__dirname + '/../'));

router.get('/path', async function(req, res) {
  let sessionURL = req.session.algorithm_url
  let path = sessionURL[req.session.url_index]
  let records = await sqlQuery(`SELECT * FROM ${path}`)
  records = records.recordset

  // console.log(url)
  // console.log('경로와 결과레코드', path, records)

  let sub = []
  let title = path
  let content = '내용이 없습니다'
  for (let i = 0; records && i < records.length; i++) {
    let type = records[i]._type
    if (type == 'sub') {
      sub.push(records[i])
    } else if (type == 'content') {
      content = records[i].content
    } else if (type == 'title') {
      title = records[i].content
    }
  }
  // console.log(req.session)
  let renderPug = pug.renderFile('./views/algorithm/main.pug', {
    id: req.session._id,
    sub: sub,
    title: title,
    content: content
  })
  // console.log("도착~")
  // console.log(renderPug)
  return res.json({
    render: renderPug
  })
})

// 패스
router.post('/path', async function(req, res) {
  // console.log('패스처리', req.session)
  let bodyPath = req.body.path
  let bodyPath_KO = req.body.path_KO
  let direction = req.body.direction
  let sessionURL = req.session.algorithm_url
  let sessionURL_KO = req.session.algorithm_url_KO
  if (direction) {
    if (direction == 'back_btn' && 0 < req.session.url_index) {
      req.session.url_index -= 1
    } else if (direction == 'front_btn' && req.session.url_index < sessionURL.length - 1) {
      req.session.url_index += 1
    }
  }
  let url
  if (bodyPath) {
    req.session.url_index += 1
    url = bodyPath
    sessionURL.splice(req.session.url_index, 0, url)
    sessionURL.splice(req.session.url_index + 1)
    sessionURL_KO.splice(req.session.url_index, 0, bodyPath_KO)
    sessionURL_KO.splice(req.session.url_index + 1)
  }
  url = sessionURL[req.session.url_index]
  let path = url.split('/')
  path = path[path.length - 1]
  let records = await sqlQuery(`SELECT * FROM ${path}`)
  records = records.recordset

  // console.log(url)
  // console.log('경로와 결과레코드', path, records)

  let sub = []
  let title = path
  let content = '내용이 없습니다'
  for (let i = 0; records && i < records.length; i++) {
    let type = records[i]._type
    if (type == 'sub') {
      sub.push(records[i])
    } else if (type == 'content') {
      content = records[i].content
    } else if (type == 'title') {
      title = records[i].content

    }
  }
  // console.log(req.session)
  // console.log(sub, title, content)
  let renderPug = pug.renderFile('./views/algorithm/main.pug', {
    id: req.session._id,
    sub: sub,
    title: title,
    content: content
  })
  // console.log("세션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡ", req.session)
  // console.log(renderPug)
  return res.json({
    render: renderPug
  })
})

// flag
router.post('/flag', async function(req, res) {
  // console.log('before 플래그',req.session)
  req.session.algorithm_flag = req.body.algorithm_flag
  // console.log('after 플래그',req.session)
  return res.json()
})

// 리스트 파일 렌더링
router.post('/createList', async function(req, res) {
  let currPath = req.session.algorithm_url[req.session.url_index]
  let algorithmName_ko = req.session.algorithm_url_KO[req.session.url_index]
  let render = pug.renderFile('./views/algorithm/create/list.pug', {
    algorithmName_ko: algorithmName_ko
  })
  return res.json({
    render: render
  })
})

// 리스트 생성
router.post('/createList/post', async function(req, res) {
  const parent = req.session.algorithm_url[req.session.url_index]
  const name = req.body.name
  const tableName = req.body.tableName
  const rowQuery = `
  IF NOT EXISTS(SELECT * FROM ${parent} WHERE name='${name}' AND tableName='${tableName}')
    BEGIN
      INSERT INTO ${parent} VALUES('sub', '${name}', '${tableName}', '');
    END`
  const tableQuery = `CREATE TABLE ${tableName}(
    	_type NVARCHAR(100) NOT NULL,
    	name NVARCHAR(100),
    	tableName NVARCHAR(100),
    	content NVARCHAR(MAX))`;
  await sqlQuery(rowQuery)
  await sqlQuery(tableQuery)
  return res.redirect('/algorithm/path')
})

// 내용 생성
router.post('/createContent', async function(req, res) {
  // console.log("세션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡ", req.session)
  let currPath = req.session.algorithm_url[req.session.url_index]
  let algorithmName_ko = req.session.algorithm_url_KO[req.session.url_index]

  let contentCheck = await sqlQuery(`SELECT * FROM ${currPath} WHERE _type='content'`)
  let content = ''
  if (contentCheck && contentCheck.recordset.length) {
    content = contentCheck.recordset[0].content
  }
  let render = pug.renderFile('./views/algorithm/create/content.pug', {
    algorithmName_ko: algorithmName_ko,
    content: content
  })
  // console.log(render)
  return res.json({
    render: render
  })
})
// 내용 DB 생성
router.post('/createContent/post', async function(req, res) {
  let title = req.body.title
  let content = req.body.content
  let currPath = req.session.algorithm_url[req.session.url_index]
  let algorithmName_ko = req.session.algorithm_url_KO[req.session.url_index]
  // 제목 갱신
  await (async function() {
    let query = `SELECT * FROM ${currPath} WHERE _type='title'`
    let records = await sqlQuery(query)
    if (records.recordset && records.recordset.length) {
      query = `UPDATE ${currPath} SET content='${title}' WHERE _type='title'`
      // console.log("UPDATE")
      // console.log(query)
      await sqlQuery(query)
      // console.log(req.session.url_index)
      if (req.session.url_index > 0) {
        let prevPath = req.session.algorithm_url[req.session.url_index - 1]
        query = `UPDATE ${prevPath} SET name='${title}' WHERE _type='sub' AND tableName='${currPath}'`
        // console.log(query)
        await sqlQuery(query)
      }
    } else {
      query = `INSERT INTO ${currPath} VALUES('title', '', '', '${title}')`
      // console.log("INSERT")
      // console.log(query)
      await sqlQuery(query)
      if (req.session.url_index > 0) {
        let prevPath = req.session.algorithm_url[req.session.url_index - 1]
        query = `UPDATE ${prevPath} SET name='${title}' WHERE _type='sub' AND tableName='${currPath}'`
        await sqlQuery(query)
      }
    }
  })()
  // 내용 갱신
  await (async function() {
    let query = `SELECT * FROM ${currPath} WHERE _type='content'`
    let records = await sqlQuery(query)
    content = content.replace(/'/gi, "''")
    if (records.recordset && records.recordset.length) {
      query = `UPDATE ${currPath} SET content='${content}' WHERE _type='content'`
      console.log("UPDATE")
      // console.log(query)
      let record = await sqlQuery(query)
      // console.log(record)
      // console.log(req.session.url_index)

    } else {
      query = `INSERT INTO ${currPath} VALUES('content', '', '', '${content}')`
      console.log("INSERT")
      console.log(query)
      await sqlQuery(query)
    }
  })()

  return res.redirect('/algorithm/path')
})


// 삭제
router.post('/deletePage', async function(req, res) {
  console.log("세션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡ", req.session)
  let currPath = req.session.algorithm_url[req.session.url_index]
  let algorithmName_ko = req.session.algorithm_url_KO[req.session.url_index]

  console.log(`DROP TABLE ${currPath}`)
  await sqlQuery(`DROP TABLE ${currPath}`)
  req.session.url_index -= 1
  req.session.algorithm_url.pop()
  req.session.algorithm_url_KO.pop()
  console.log("세션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡ", req.session)

  if (req.session.url_index >= 0) {
    let prevPath = req.session.algorithm_url[req.session.url_index]
    query = `DELETE FROM ${prevPath} WHERE tableName='${currPath}'`
    console.log(query)
    await sqlQuery(query)
  }
  return res.redirect('/algorithm/path')
})

module.exports = router
