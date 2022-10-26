const winston = require('winston')
const expressWinston = require('express-winston')

module.exports = expressWinston.errorLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.align(),
    winston.format.printf(log => {
      const { timestamp, level, meta } = log
      const { url, method, body } = meta.req
      const formattedError = { url, method, body, error: meta.error.message }
      return `[${level}: ${timestamp}]: API Error ${Object.keys(formattedError).length ? JSON.stringify(formattedError, null, 2) : ''}`
    })
  )
})
