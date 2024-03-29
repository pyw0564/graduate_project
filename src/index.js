const config = require('./data')
const express = require('express')
const app = express()
const pug = require('pug')
const fs = require('fs')
const sql = require('mssql')
const path = require('path')
const mime = require('mime')
const spawn = require('child_process').spawn;
var cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
/* 세션 */
const session = require('express-session')
const Redis = require('redis') // 레디스
const client = Redis.createClient() // 레디스
var redisStore = require('connect-redis')(session) // 레디스

/* config */
const sqlConfig = config.sqlConfig
const readDB = config.readDB
const sqlQuery = config.sqlQuery

app.use(session({ // 세션 init
  resave: false,
  saveUninitialized: true,
  secret: 'My!name@is#pyw',
  store: new redisStore({
    client: client
  })
}))
app.use(cookieParser())

app.set('view engine', 'pug');
app.set('views', './views');
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'))
app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/../'));
app.use('/problem', require('./problem'))
app.use('/algorithm', require('./algorithm'))
app.use('/', require('./register'))
app.locals.pretty = true;


app.get('/', async function(req, res) {
  req.session.algorithm_url = null
  console.log('세션 내용', req.session)
  if (!req.session.algorithm_url) {
    console.log('메인에서 초기화되었음')
    req.session.algorithm_url = ['algorithms']
    req.session.algorithm_url_KO = ['알고리즘 레퍼런스']
    req.session.url_index = 0
    req.session.algorithm_flag = false
  }
  res.render("main", {
    algorithm_flag: req.session.algorithm_flag,
    id: req.session._id
  })
})

app.listen(3000, function(err) {
  console.log('Connected!!');
})
