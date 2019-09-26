const data = require('./data')
const express = require('express')
const app = express()
const pug = require('pug')
const fs = require('fs')
const sql = require('mssql')
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/../'));
app.locals.pretty = true;

const makeAlgorithmList = data.makeAlgorithmList
const sqlConfig = data.sqlConfig
const readDB = data.readDB
const algorithm_list = data.algorithm_list
const recursiveMakeAlgorithmList = data.recursiveMakeAlgorithmList
const sqlQuery = data.sqlQuery

app.get('/', async function(req, res) {
  await readDB()
  const algorithmName = 'algorithms'
  const algorithmName_ko = '알고리즘'
  const algorithm_content = algorithm_list.content
  const algorithm_content_list = makeAlgorithmList(algorithm_list)
  res.render("main", {
    algorithmName: undefinedCheck(algorithmName),
    algorithmName_ko: undefinedCheck(algorithmName_ko),
    algorithm_list: undefinedCheck(algorithm_list),
    algorithm_content: undefinedCheck(algorithm_content),
    algorithm_content_list: undefinedCheck(algorithm_content_list)
  })
})

app.get('/ps', function(req, res) {
  res.render('ps')
})

// 리스트 생성
app.post('/algorithm/createList', async function(req, res) {
  const parent = req.body.parent
  const algorithmName_ko = req.body.algorithmName_ko
  const algorithm_list = req.body.algorithm_list
  const algorithm_content_list = req.body.algorithm_content_list
  let render = pug.renderFile('./views/algorithm/create/list.pug', {
    parent: parent,
    algorithmName_ko: algorithmName_ko,
    algorithm_content_list: algorithm_content_list,
    algorithm_list : algorithm_list
  })
  res.json(render)
})
// 리스트 DB 생성
app.post('/algorithm/createList/post', async function(req, res) {
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
app.post('/algorithm/createContent', async function(req, res) {
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
app.post('/algorithm/createContent/post', async function(req, res) {
  const content = req.body.txt
  const parent = req.body.parent
  const query = `INSERT INTO ${parent} VALUES('content', '', '', '${content}');`
  sqlQuery(query)
  res.redirect('/')
})
// 리스트 수정
app.post('/algorithm/modifyList', async function(req, res) {

})
app.post('/algorithm/deleteList', async function(req, res){
  const algorithmName_ko = req.body.algorithmName_ko
  const algorithm_list = req.body.algorithm_list
  const algorithm_content_list = req.body.algorithm_content_list
  const tableName = req.body.tableName

  console.log("hi", tableName)
})
app.post('/algorithm/delete/:form', async function(req, res) {
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
// 리스트
app.post('/algorithm/:algorithmName', async function(req, res) {
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


app.post('/form_receive', function(req, res) {
  var code = req.body.code;
  var source = code.split(/\r\n|\r\n/).join("\n");
  var file = 'test.c';

  fs.writeFile(file, source, 'utf8', function(error) {
    console.log('write end');
  });
  var compile = spawn('gcc', [file]);
  compile.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
  });
  compile.stderr.on('data', function(data) {
    console.log(String(data));
  });
  compile.on('close', function(data) {
    if (data == 0) {
      var run = spawn('./a.exe', []);
      run.stdout.on('data', function(output) {
        console.log('컴파일 완료');
        var responseData = {
          'result': 'ok',
          'output': output.toString('utf8')
        };
        res.json(responseData);
      });
      run.stderr.on('data', function(output) {
        console.log(String(output));
      });
      run.on('close', function(output) {
        console.log('stdout: ' + output);
      });
    }
  });
});

function undefinedCheck(o) {
  return o == undefined ? null : o
}

app.listen(3000, function(err) {
  console.log('Connected!!');
})
