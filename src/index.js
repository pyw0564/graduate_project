require('dotenv').config({
  path: __dirname + '/../.env'
})
const config = require('./global')
const express = require('express')
const app = express()
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
app.use(express.static(__dirname + '/public'));

const sqlConfig = config.sqlConfig
async function readDB() {
  // SQL 접속
  console.log('SQL Connecting. . .')
  let pool = await sql.connect(sqlConfig)

  // ref 파일 생성
  var path = __dirname + '/../ref'
  await mkdir(path);

  // algorithms 파일 생성
  const path_algo = path + '/algorithms'
  await mkdir(path_algo);

  let result = await pool.request().query(`SELECT * FROM algorithms`)
  verification(path_algo, result.recordset, 'tableName');

  for (let i = 0; i < result.recordset.length; i++) {
    let record = result.recordset[i];
    await mkdir(path_algo + '/' + record.tableName)
    for (let j = 0; j < )
  }
}
async function recursiveMakeDir(path, dirName) {
  await mkdir(path)
  let pool = await sql.connect(sqlConfig)
  let result = await pool.request().query(`SELECT tableName FROM ${dirName}`)
  await sql.close()

  for (let i = 0; i < result.recordset.length; i++) {
    let record = result.recordset[i]
    if (record.tableName) {
      let nextPath = path + '/' + record.tableName
      recursiveMakeDir(nextPath, record.tableName)
    }
  }
}
readDB()
async function mkdir(path) {
  if (!fs.existsSync(path))
    fs.mkdirSync(path);
}
async function verification(path, recordset, key) {
  let dirs = fs.readdirSync(path)
  for (let i = 0; i < dirs.length; i++) {
    let dir = dirs[i]
    let flag = false
    for (let j = 0; j < recordset.length; j++) {
      let record = recordset[j][key]
      if (dir == record) flag = true
    }
    if (flag == false) {
      await deleteFolderRecursive(path + '/' + dir)
    }
  }
}
var deleteFolderRecursive = async function(path) {
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
};
app.get('/', async function(req, res) {
  res.render("main")
})
app.get('/algorithm', function(req, res) {
  res.render('main')
})
app.get('/ps', function(req, res) {
  res.render('main')
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

app.listen(3000, function(err) {
  console.log('Connected!!');
})
