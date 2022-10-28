process.env.NODE_ENV = 'test'
const appRoot = require('app-root-path')

// App Mocks
const { mockReq, mockRes } = require('sinon-express-mock')
const app = require('express')()
const config = require(`${appRoot}/config`)
app.set('config', config)

// Stubs and assertions
const sinon = require('sinon')
const { match } = sinon

const chai = require('chai')
const { expect } = chai

chai.use(require('sinon-chai'))
chai.use(require('chai-as-promised'))
chai.config.includeStack = true

// Cache
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 1800 })

module.exports = {
  app,
  cache,
  chai,
  expect,
  match,
  mockReq,
  mockRes,
  sandbox: null,
  sinon,
  init () {
    before(async () => {
      app.set('cache', cache)
    })

    beforeEach(() => {
      this.sandbox = this.sinon.createSandbox()
      this.sandbox.stub(cache, 'get')
      this.sandbox.stub(cache, 'set')
    })

    afterEach(() => {
      this.sandbox.restore()
    })
  }
}
