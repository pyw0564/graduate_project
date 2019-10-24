const config = require('./data')
const express = require('express')
const app = express()
const pug = require('pug')
const fs = require('fs')
const sql = require('mssql')
const path = require('path')
const mime = require('mime')
const spawn = require('child_process').spawn;
const bodyParser = require('body-parser');
/* 세션 */
const session = require('express-session')
const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
var redisStore = require('connect-redis')(session) // 레디스

/* config */
const makeAlgorithmList = config.makeAlgorithmList
const sqlConfig = config.sqlConfig
const readDB = config.readDB
const algorithm_list = config.algorithm_list
const recursiveMakeAlgorithmList = config.recursiveMakeAlgorithmList
const sqlQuery = config.sqlQuery

app.use(session({ // 세션 init
  secret: 'My!name@is#pyw',
  store: new redisStore({
    client: client
  }),
  resave: false,
  saveUninitialized: true
}))

app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'))
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/../'));
app.use('/', require('./register'))
app.use('/problem', require('./problem'))
app.use('/', require('./algorithm'))
app.locals.pretty = true;


app.get('/', async function(req, res) {
  console.log('세션유지 ->', req.session._id)
  let login_session = false
  let id = null
  if(req.session._id) {
    login_session = true
    id = req.session._id
  }
  await readDB()
  const algorithmName = 'algorithms'
  const algorithmName_ko = '알고리즘'
  const algorithm_content = algorithm_list.content
  const algorithm_content_list = makeAlgorithmList(algorithm_list)
  res.render("main", {
    login_session : login_session,
    id : id,
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


function undefinedCheck(o) {
  return o == undefined ? null : o
}

app.listen(3000, function(err) {
  console.log('Connected!!');
})
