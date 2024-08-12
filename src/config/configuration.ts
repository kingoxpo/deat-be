export default () => ({
  database: {
    ecf: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PW,
      database: 'ecf',
      charset: 'utf8mb4_0900_ai_ci',
      timezone: 'local',
      connectTimeout: 10000,
      insecureAuth: false,
      dateStrings: true,
      decimalNumbers: true,
      debug: false,
      trace: false,
      multipleStatements: true,
      waitForConnections: true,
      enableKeepAlive: false,
      connectionLimit: 30,
      queueLimit: 1000,
    },
  },
});
