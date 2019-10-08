const data = require('./data')
const express = require('express')
const app = express()
const pug = require('pug')
const execSync = require('child_process').execSync;
const execFileSync = require('child_process').execFileSync;
const exec = require('child_process').exec;
const fs = require('fs')
const util = require('util')
const setTimeoutPromise = util.promisify(setTimeout);
const sql = require('mssql')
const path = require('path')
const mime = require('mime')
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'))
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
    algorithm_list: algorithm_list
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
app.post('/algorithm/deleteList', async function(req, res) {
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


app.post('/problem/score/:number', function(req, res) {
  var flag = {
    flag: true
  }
  var timeCheck = function(flag) {
    setTimeoutPromise(5000, flag).then((flag) => {
      if (flag.flag) {
        let responseData = {
          'result': '시간 초과',
          'output': 'TIME LIMIT EXCEED!!'
        };
        res.json(responseData)
        res.end()
      }
    });
  }
  //timeCheck(flag)
  let number = req.params.number
  var code = req.body.code
  var source = code.split(/\r\n|\r\n/).join("\n");
  var file = 'test.c';


  try {
    fs.writeFileSync(file, source, 'utf8')
    var compile = spawn('gcc', [file]);
    compile.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
    });
    compile.stderr.on('data', function(data) {
      console.log('컴파일 에러다!', String(data));
      var responseData = {
        'result': '컴파일 에러',
        'output': data.toString('utf8')
      };
      console.log("전송~")
      res.json(responseData);
    });

    compile.on('close', async function(data) {
      flag.flag = false
      if (data == 0) {
        let data_path = './../problem/' + number + '/data'
        let answer_path = './../problem/' + number + '/data'
        let datadir = fs.readdirSync(data_path)
        let answerdir = fs.readdirSync(answer_path)
        console.log(datadir, answerdir)

        // var cp = execFileSync('a.exe',['1 2'])
        // console.log(String(cp))


        // var cp = exec('a.exe', function(err, stdout, stderr) {
        //   process.stdout.write(stdout);
        //   process.stderr.write(stderr);
        // });
        // cp.stdin.write('1');
        // cp.stdin.write(' 2');
        // cp.stdin.end();
        //
        let count = 0
        let responseData = {
          'result': '성공',
          'output': ''
        };
        var complete = function() {
          setTimeoutPromise(2000).then(() => {
            console.log(count, datadir.length + 1)
            if (count == datadir.length + 1) {
              console.log(responseData)
              res.json(responseData)
              res.end()
            }
          });
        }
        complete()
        for (let i = -1; i < datadir.length; i++) {
          let run = spawn('./a.exe')
          run.stdin.end('1 2')
          run.stdout.on('data', function(output) {
            console.log('컴파일 완료', String(output));
            ++count
            responseData.output += output.toString('utf8')
          });
          run.stderr.on('data', function(output) {
            console.log('런타임 에러', String(output));
            var responseData = {
              'result': '런타임 에러',
              'output': output.toString('utf8')
            };
            res.json(responseData)
            res.end()
            return
          });
          run.on('close', function(output) {
            console.log('stdout: ' + output);
          });
        }

      }
    });
  } catch (e) {
    res.json(String(e))
  }
});

app.get('/problem', function(req, res) {
  let table = {}
  let path = './../problem'
  let problems = fs.readdirSync(path)
  for (let i = 0; i < problems.length; i++) {
    let number = problems[i]
    if (table[number] == undefined)
      table[number] = {}
    let pb = fs.readdirSync(path + '/' + number)
    for (let j = 0; j < pb.length; j++) {
      let dot = pb[j].lastIndexOf('.')
      if (dot == -1) continue
      let name = pb[j].substring(0, dot)
      let type = pb[j].substring(dot + 1)
      if (type == 'txt') {
        table[number].name = name
        table[number].download = './problem/' + number + '/' + pb[j]
      }
    }
  }
  console.log(table)
  res.render('./ps/problem/problem', {
    table: table
  })
})
app.get('/rank', function(req, res) {
  res.render('./ps/rank/rank')
})
app.get('/notice', function(req, res) {
  res.render('./ps/notice/notice')
})
app.get('/problem/download/:number', function(req, res) {
  let number = req.params.number
  let path = './../problem/' + number
  let pb = fs.readdirSync(path)
  for (let i = 0; i < pb.length; i++) {
    let dot = pb[i].lastIndexOf('.')
    if (dot == -1) continue
    let name = pb[i].substring(0, dot)
    let type = pb[i].substring(dot + 1)
    if (type == 'txt') {
      console.log(__dirname + '/../problem/' + number + '/' + pb[i])
      res.download(__dirname + '/../problem/' + number + '/' + pb[i])
    }
  }
})

app.get('/problem/submit/:number', function(req, res) {
  let number = req.params.number
  let path = './../problem/' + number
  let pb = fs.readdirSync(path)
  for (let i = 0; i < pb.length; i++) {
    let dot = pb[i].lastIndexOf('.')
    if (dot == -1) continue
    let name = pb[i].substring(0, dot)
    let type = pb[i].substring(dot + 1)
    if (type == 'txt') {
      res.render('./ps/problem/submit', {
        name: name,
        number: number
      })
      res.end()
    }
  }

})


function undefinedCheck(o) {
  return o == undefined ? null : o
}

app.listen(3000, function(err) {
  console.log('Connected!!');
})
