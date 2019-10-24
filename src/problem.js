const express = require('express')
const router = express.Router()
const spawn = require('child_process').spawn;
const fs = require('fs')
const bodyParser = require('body-parser');
const fileReg = new RegExp(/txt|hwp|pdf/,'g')

// 메인
router.get('/', function(req, res) {
  let table = {}
  let path = './../problem'
  let problems = fs.readdirSync(path)
  for (let i = 0; i < problems.length; i++) {
    let number = problems[i]
    if (table[number] == undefined) table[number] = {}
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
  res.render('./ps/problem/problem', {
    table: table
  })
})

// 문제 다운로드
router.get('/download/:number', function(req, res) {
  let number = req.params.number
  let path = './../problem/' + number
  let file = fs.readdirSync(path)
  for (let i = 0; i < file.length; i++) {
    let dot = file[i].lastIndexOf('.')
    if (dot == -1) continue
    let name = file[i].substring(0, dot)
    let type = file[i].substring(dot + 1)
    if (type.match(fileReg)) {
      return res.download(__dirname + '/../problem/' + number + '/' + file[i])
    }
  }
})

// 제출
router.get('/submit/:number', function(req, res) {
  let number = req.params.number
  let path = './../problem/' + number
  let pb = fs.readdirSync(path)
  for (let i = 0; i < pb.length; i++) {
    let dot = pb[i].lastIndexOf('.')
    if (dot == -1) continue
    let name = pb[i].substring(0, dot)
    let type = pb[i].substring(dot + 1)
    if (type == 'txt') {
      return res.render('./ps/problem/submit', {
        name: name,
        number: number
      })
    }
  }
})

// 채점
router.post('/score/:number', function(req, res) {
  let number = req.params.number
  let code = req.body.code
  console.log('코드', req.body.code, number)
  let source = code.split(/\r|\n/g).join("\n");
  let file = 'test.c';

  // 플래그
  let flag = {
    TLE: true,
    WA: false
  }
  // TLE 함수
  var TLE_function = setTimeout(function() {
    if (flag.TLE) {
      let responseData = {
        'result': '시간 초과',
        'output': 'TIME LIMIT EXCEED!!'
      };
      console.log(responseData)
      return res.json(responseData)
    }
    clearTimeout(TLE_function)
  }, 5000);

  // file 작성
  fs.writeFileSync(file, source, 'utf8')
  let compile = spawn('gcc', [file]);
  // open
  compile.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
  });
  // error
  compile.stderr.on('data', function(data) {
    let responseData = {
      'result': '컴파일 에러',
      'output': data.toString('utf8')
    };
    console.log(responseData)
    return res.json(responseData)
  });
  // close
  compile.on('close', async function(data) {
    let count = 0
    let responseData = {
      'result': '맞았습니다!!',
      'output': ''
    }
    if (data == 0) {
      let data_path = './../problem/' + number + '/data'
      let answer_path = './../problem/' + number + '/answer'
      let datadir = fs.readdirSync(data_path)
      let answerdir = fs.readdirSync(answer_path)
      console.log(datadir, answerdir)

      var AC_function = setTimeout(function() {
        console.log(count, datadir.length)
        if (count == datadir.length) {
          console.log(responseData)
          clearTimeout(TLE_function)
          return res.json(responseData)
        } else if (flag.WA) {
          responseData.result = '틀렸습니다'
          console.log(responseData)
          clearTimeout(TLE_function)
          return res.json(responseData)
        }
      }, 3000);

      for (let i = 0; i < datadir.length; i++) {
        let run = spawn('./a.exe')
        let data_content = String(fs.readFileSync(data_path + '/' + datadir[i]))
        let answer_content = String(fs.readFileSync(answer_path + '/' + answerdir[i]))

        run.stdin.end(String(data_content))
        run.stdout.on('data', function(output) {
          flag.TLE = false
          output = String(output)
          output = output.replace(/\n|\r/g, '')
          answer_content = answer_content.replace(/\n|\r/g, '')
          data_content = data_content.replace(/\n|\r/g, '')

          if (output == answer_content) {
            ++count
            responseData.output += 'Case#' + (i + 1) + " 맞았습니다!!\n"
          } else {
            flag.WA = true
            responseData.output += 'Case#' + (i + 1) + " 틀렸습니다\n"
          }
        })
        run.stderr.on('data', function(output) {
          console.log('런타임 에러', String(output))
          var responseData = {
            'result': '런타임 에러',
            'output': output.toString('utf8')
          }
          console.log(responseData)
          return res.json(responseData)
        })
        run.on('close', function(output) {
          console.log('stdout: ' + output);
        })
      }
    }
  })
})

// 랭크 창
router.get('/rank', function(req, res) {
  res.render('./ps/rank/rank')
})

// 공지 창
router.get('/notice', function(req, res) {
  res.render('./ps/notice/notice')
})


module.exports = router
