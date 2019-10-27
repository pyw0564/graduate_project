const express = require('express')
const router = express.Router()
const spawn = require('child_process').spawn
const spawnSync = require('child_process').spawnSync
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
        mode: 'submit'
      })
    }
  }
})

// 채점
router.post('/score/:number', async function(req, res) {
  let id = req.session._id
  let number = req.params.number
  let code = req.body.code
  console.log('코드왔어', req.body.code)
  let source = code.split(/\r|\n/g).join("\n");
  let file = `./../programs/${id}_${number}.c`

  await sqlQuery(`IF NOT EXISTS(SELECT * FROM Score WHERE id='${id}' AND problem=${number})
                  BEGIN
                    INSERT INTO Score(id,problem,code,judge)
                    VALUES('${id}',${number},'${code}',null)
                  END
                  ELSE
                  BEGIN
                    UPDATE Score SET code='${code}' WHERE id='${id}' AND problem=${number}
                  END`)
  // 플래그
  let flag = {
    TLE: true,
    WA: false,
    CE: false,
    RE: false,
  }
  let count = 0
  let responseData = {
    result: '맞았습니다!!',
    output: ''
  };

  let data_path = './../problem/' + number + '/data'
  let answer_path = './../problem/' + number + '/answer'
  let datadir = fs.readdirSync(data_path)
  let answerdir = fs.readdirSync(answer_path)

  let AC_function = setTimeout(async function() {
    console.log('결과/정보', count, datadir.length)
    if (flag.CE) {
      clearTimeout(TLE_function)
      return res.json(responseData)
    }
    if (flag.RE) {
      clearTimeout(TLE_function)
      responseData.result = '런타임 에러'
      responseData.output = ''
      return res.json(responseData)
    }
    if (count == datadir.length) {
      clearTimeout(TLE_function)
      console.log(responseData)
      await sqlQuery(`UPDATE Score SET judge='맞았습니다!' WHERE id='${id}' AND problem=${number}`)
      return res.json(responseData)
    } else if (flag.WA) {
      clearTimeout(TLE_function)
      responseData.result = '틀렸습니다'
      await sqlQuery(`UPDATE Score SET judge='틀렸습니다' WHERE id='${id}' AND problem=${number}`)
      return res.json(responseData)
    }
  }, 3000);

  // TLE 함수
  var TLE_function = setTimeout(async function() {
    if (flag.TLE) {
      responseData.result = '시간 초과'
      responseData.output = 'TIME LIMIT EXCEED!!'
      await sqlQuery(`UPDATE Score SET judge='시간 초과' WHERE id='${id}' AND problem=${number}`)
      console.log(responseData)
      await clearTimeout(AC_function)
      return res.json(responseData)
    }
    clearTimeout(TLE_function)
  }, 5000);

  // file 작성
  fs.writeFileSync(file, source, 'utf8')
  let compile = spawn('g++', ['-o', `${id}_${number}.exe`, file], {
    cwd: './../programs'
  });

  // open
  compile.stdout.on('data', function(data) {
    // console.log('stdout: ' + data);
  });

  // error
  compile.stderr.on('data', async function(data) {
    responseData.result = '컴파일 에러'
    responseData.output += data.toString('utf8')
    flag.CE = true
    await sqlQuery(`UPDATE Score SET judge='컴파일 에러' WHERE id='${id}' AND problem=${number}`)
  });

  // close
  compile.on('close', async function(data) {
    if (data == 0) { // return 0
      datadir.forEach(function(element, i) {
        const subtask = spawn(`./../programs/${id}_${number}.exe`)
        let data_content = String(fs.readFileSync(data_path + '/' + datadir[i]))
        let answer_content = String(fs.readFileSync(answer_path + '/' + answerdir[i]))
        subtask.stdin.end(data_content)
        subtask.stdout.on('data', async function(output) {
          if (flag.RE || flag.CE) return
          output = String(output).replace(/\n|\r/g, '')
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
        subtask.stderr.on('data', function(output) {
          flag.RE = true
          responseData.output = output.toString('utf8')
        })
      })
    }
  })
})

// 랭크 창
router.get('/score', async function(req, res) {
  if (!req.session._id) return res.send(redirect_main('로그인이 되어 있지 않습니다'))
  let recordset = await sqlQuery(`SELECT * FROM Score WHERE id='${req.session._id}'`)
  recordset = recordset.recordset
  if (!recordset.length) recordset = {}
  else {
    for (let i in recordset) {
      delete recordset[i].id
      for (let index in recordset[i]) {}
    }
  }
  return res.render('./ps/score/score', {
    id: req.session._id,
    table: recordset
  })
})

// 코드 불러오기(AJAX)
router.post('/load/:number', async function(req, res) {
  console.log("AJAX 도착, 코드 불러오는 중")
  let number = req.params.number
  let ret = await sqlQuery(`SELECT * FROM Score WHERE id='${req.session._id}' AND problem=${number}`)
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

// 코드 불러오기
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
        mode: 'view'
      })
    }
  }
})

// 랭크 페이지
router.get('/rank', async function(req, res) {
  if (!req.session._id) return res.send(redirect_main('로그인이 되어 있지 않습니다'))
  let ret = await sqlQuery(`
    SELECT id AS 'id', COUNT(judge) AS 'count'
    FROM Score WHERE judge='맞았습니다!'
    GROUP BY id ORDER BY 'count' DESC`)
  if (!ret.recordset) ret.recordset = []
  res.render('./ps/rank/rank', {
    id: req.session._id,
    table: ret.recordset
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
