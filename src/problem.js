const express = require('express')
const router = express.Router()
const spawn = require('child_process').spawn;
const fs = require('fs')
const bodyParser = require('body-parser');
const fileReg = new RegExp(/txt|hwp|pdf/, 'g')
const config = require('./data.js')
const sqlQuery = config.sqlQuery

// 메인
router.get('/', function(req, res) {
  if (!req.session._id) return res.send(redirect_main('로그인이 되어 있지 않습니다'))
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
    id: req.session._id,
    table: table
  })
})

// 문제 다운로드
router.get('/download/:number', function(req, res) {
  if (!req.session._id) return res.send(redirect_main('로그인이 되어 있지 않습니다'))
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
        id: req.session._id,
        name: name,
        number: number,
        mode : 'submit'
      })
    }
  }
})

// 채점
router.post('/score/:number', async function(req, res) {
  let id = req.session._id
  let number = req.params.number
  let code = req.body.code
  console.log('코드', req.body.code, number)
  let source = code.split(/\r|\n/g).join("\n");
  let file = 'test.c'

  await sqlQuery(`IF NOT EXISTS(SELECT * FROM Rank WHERE id='${id}' AND problem=${number})
                  BEGIN
                    INSERT INTO Rank(id,problem,code,judge)
                    VALUES('${id}',${number},'${code}',null)
                  END
                  ELSE
                  BEGIN
                    UPDATE Rank SET code='${code}' WHERE id='${id}' AND problem=${number}
                  END`)
  // 플래그
  let flag = {
    TLE: true,
    WA: false
  }
  // TLE 함수
  var TLE_function = setTimeout(async function() {
    if (flag.TLE) {
      let responseData = {
        'result': '시간 초과',
        'output': 'TIME LIMIT EXCEED!!'
      };
      await sqlQuery(`UPDATE Rank SET judge='시간 초과' WHERE id='${id}' AND problem=${number}`)
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
  compile.stderr.on('data', async function(data) {
    let responseData = {
      'result': '컴파일 에러',
      'output': data.toString('utf8')
    };
    await sqlQuery(`UPDATE Rank SET judge='컴파일 에러' WHERE id='${id}' AND problem=${number}`)
    await clearTimeout(TLE_function)
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

      var AC_function = setTimeout(async function() {
        console.log(count, datadir.length)
        if (count == datadir.length) {
          console.log(responseData)
          await sqlQuery(`UPDATE Rank SET judge='맞았습니다!' WHERE id='${id}' AND problem=${number}`)
          clearTimeout(TLE_function)
          return res.json(responseData)
        } else if (flag.WA) {
          responseData.result = '틀렸습니다'
          await sqlQuery(`UPDATE Rank SET judge='틀렸습니다' WHERE id='${id}' AND problem=${number}`)
          clearTimeout(TLE_function)
          return res.json(responseData)
        }
      }, 3000);

      for (let i = 0; i < datadir.length; i++) {
        let run = spawn('./a.exe')
        let data_content = String(fs.readFileSync(data_path + '/' + datadir[i]))
        let answer_content = String(fs.readFileSync(answer_path + '/' + answerdir[i]))

        run.stdin.end(String(data_content))
        run.stdout.on('data', async function(output) {
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

router.post('/load/:number', async function(req, res) {
  console.log("도착")
  let number = req.params.number
  let ret = await sqlQuery(`SELECT * FROM Rank WHERE id='${req.session._id}' AND problem=${number}`)
  console.log(ret.recordset)
  if (ret.recordset.length) {
    return res.json({
      message: '성공',
      code: ret.recordset[0].code
    })
  } else {
    return res.json({
      message: '실패',
      code: null
    })
  }
})

// 랭크 창
router.get('/rank', async function(req, res) {
  if (!req.session._id) return res.send(redirect_main('로그인이 되어 있지 않습니다'))
  let recordset = await sqlQuery(`SELECT * FROM Rank WHERE id='${req.session._id}'`)
  recordset = recordset.recordset
  console.log(recordset)
  if (!recordset.length) recordset = {}
  else {
    for (let i in recordset) {
      delete recordset[i].id
      for (let index in recordset[i]) {}
    }
  }
  console.log(recordset)
  res.render('./ps/rank/rank', {
    id: req.session._id,
    table: recordset
  })
})

router.get('/mycode/:number', async function(req, res) {
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
        id: req.session._id,
        name: name,
        number: number,
        mode : 'view'
      })
    }
  }
})

// 공지 창
router.get('/notice', function(req, res) {
  res.render('./ps/notice/notice', {
    id: req.session._id,
  })
})

// Alert와 메인으로 가는 함수
function redirect_main(message) {
  return `<script>
    alert('${message}')
    location.href='/'
  </script>`
}

module.exports = router
