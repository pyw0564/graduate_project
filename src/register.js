const config = require('./data')
const express = require('express')
const router = express.Router()
const sql = require('mssql')
const bodyParser = require('body-parser');
const sqlQuery = config.sqlQuery

router.use('/', express.static(__dirname + '/../'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));

// post 로그인
router.post('/login', async function(req, res) {
  // 세션 처리
  if (req.session._id) return res.send(redirect_main('이미 로그인 되어 있습니다'))
  // 로그인 처리
  let id = req.body.id
  let pw = req.body.pw
  if (id == '' || id == null || id == undefined)
    return res.send(redirect_main('아이디가 입력되지 않았습니다'))
  if (pw == '' || pw == null || pw == undefined)
    return res.send(redirect_main('패스워드가 입력되지 않았습니다'))
  let ret = await sqlQuery(`SELECT * FROM Users WHERE id='${id}' AND pw='${pw}'`)
  if (ret.recordset.length) {
    req.session._id = id
    return res.redirect('/')
  } else
    return res.send(redirect_main('아이디 혹은 비밀번호가 틀립니다'))
})

// 회원가입 화면
router.get('/register', async function(req, res) {
  // 세션 처리
  if (req.session._id) return res.send(redirect_main('이미 로그인 되어 있습니다'))
  return res.render('./register/main.pug')
})

// 회원가입 처리
router.post('/register', async function(req, res) {
  // 세션 처리
  if (req.session._id) return res.send(redirect_main('이미 로그인 되어 있습니다'))
  // 회원가입 처리
  let id = req.body.id
  let pw = req.body.pw
  let name = req.body.name
  let phone = req.body.phone
  if (id == '' || id == null || id == undefined)
    return res.send(redirect_url('아이디가 입력되지 않았습니다', '/register'))
  if (pw == '' || pw == null || pw == undefined)
    return res.send(redirect_url('패스워드가 입력되지 않았습니다', '/register'))
  if (name == '' || name == null || name == undefined)
    return res.send(redirect_url('이름이 입력되지 않았습니다', '/register'))
  if (phone == '' || phone == null || phone == undefined)
    return res.send(redirect_url('휴대폰이 입력되지 않았습니다', '/register'))

  let ret = await sqlQuery(`INSERT INTO Users VALUES('${id}', '${pw}', '${name}', '${phone}')`)
  if (ret.rowsAffected) {
    return res.send(redirect_main('회원가입 완료'))
  } else {
    return res.send(redirect_main('중복된 아이디가 존재합니다'))
  }
})

// 로그아웃 처리
router.post('/logout', async function(req, res) {
  req.session.destroy()
  return res.redirect('/')
})

// Alert와 메인으로 가는 함수
function redirect_main(message) {
  return `<script>
    alert('${message}')
    location.href='/'
  </script>`
}

function redirect_url(message, url) {
  return `<script>
    alert('${message}')
    location.href='${url}'
  </script>`
}
module.exports = router
