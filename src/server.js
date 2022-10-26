require('dotenv').config()
const [express, bodyParser, cors, logger, appRoot, NodeCache] = [
  require('express'),
  require('body-parser'),
  require('cors'),
  require('morgan'),
  require('app-root-path'),
  require('node-cache')
]
const app = express()
const routes = require('./routes')

// Set cache
app.set('cache', new NodeCache({ stdTTL: 1800 }))

// Set CORS
app.use(cors())

// Show basic request info locally
if (process.env.NODE_ENV === 'development') app.use(logger('dev'))

// Set JSON bodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Create routes
routes.initialise(app)

// Log errors to console locally
if (process.env.NODE_ENV === 'development') app.use(require(`${appRoot}/src/middleware/errorLogger`))

// Handle Invalid Route
app.use('*', (req, res) => res.status(404).send({
  status: 'error',
  message: 'This is not the route you are looking for'
}))

// Error Handling
app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  const error = err.message || 'Internal Server Error'

  // Set the error status and message
  return res.status(status).send({
    status: 'error',
    message: error
  })
})

// Start API
app.listen(process.env.PORT, () => console.log(`API listening on port ${process.env.PORT}`))
