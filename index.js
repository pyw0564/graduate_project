const express = require('express');
const app = express();
const fs = require('fs');
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
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

app.listen(3000, "0.0.0.0")
