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

const sqlConfig = data.sqlConfig
const readDB = data.readDB
const algorithm_list = data.algorithm_list
const recursiveMakeAlgorithmList = data.recursiveMakeAlgorithmList
app.get('/', async function(req, res) {
  res.render("main", {
    type: 'main',
  })
})
app.get('/algorithm', async function(req, res) {
  console.log(algorithm_list)
  await readDB()
  res.render('algorithm_page', {
    algorithmName : 'algorithms',
    type: 'main',
    algorithm_list: recursiveMakeAlgorithmList(algorithm_list)
  })
})
app.get('/ps', function(req, res) {
  res.render('ps')
})
app.get('/algorithm/create', function(req, res){
  const hidden = req.query.parent
  res.render('algorithm_create', {
    tableName : hidden
  })
})
app.post('/algorithm/create', async function(req, res){
  const name = req.body.name
  const tableName = req.body.tableName
  console.log(name, tableName)
  const query = `INSERT INTO algorithms VALUES('${name}','${tableName}')`
  await (async => {
    return new sql.ConnectionPool(sqlConfig).connect().then(pool => {
      return pool.request().query(query)
      }).then(async result =>{
        sql.close()
        console.log("table 생성 완료!")
      }).catch(err => {
        console.log(err)
        sql.close()
      })
  })()
  res.redirect('/algorithm')
})
app.post('/algorithm/:algorithmName', function(req, res) {
  let algorithmName = req.params.algorithmName
  let render = pug.renderFile('views/' + algorithmName + '.pug')
  res.render('algorithm_page', {
    algorithmName : algorithmName,
    html : render
  })
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
