const sqlConfig = {
  user: process.env.DB_USER ? process.env.DB_USER : 'sa', // mssql username
  password: process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '1111', // mssql password
  server: process.env.DB_SERVER ? process.env.DB_SERVER : `pyw\\SQLEXPRESS`, // 서버 주소
  database: process.env.DB_DATABASE ? process.env.DB_DATABASE : 'GraduateProject', // 사용할 database 이름
  stream: 'true', // ???
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433, // 서버 port 설정
  autoSchemaSync: true, // ???
  option: {
    encrypt: 'false'
  }, // ???
  pool: {
    max: 100,
    min: 0,
    idleTimeoutMillis: 30000
  }
}
exports.sqlConfig = sqlConfig
