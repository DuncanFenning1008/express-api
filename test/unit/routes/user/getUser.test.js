const appRoot = require('app-root-path')
const axios = require('axios')
const getUser = require(`${appRoot}/src/routes/users/getUser`)

// Helpers setup
const helpers = require(`${appRoot}/test/helpers`)
const { app, cache, mockReq, mockRes, match, expect } = helpers

describe('getUser', () => {
  helpers.init()

  let req, res, next, params
  beforeEach(() => {
    req = mockReq({
      app
    })
    res = mockRes()
    next = helpers.sandbox.stub()
    params = {
      id: '1234'
    }
    helpers.sandbox.stub(axios, 'post').returns({ data: { access_token: 'token' } })
    helpers.sandbox.stub(axios, 'get').returns({ data: { user_id: '1234', name: 'Test' } })
  })

  context('with an invalid req', () => {
    it('calls next with the error', async () => {
      await getUser.handleRequest(req, res, next, { })
      expect(next).to.have.been.calledOnce
        .and.calledWithExactly({ statusCode: 400, message: 'Missing required param:id to return user' })
    })
  })

  context('with a valid req', () => {
    context('if the request errors', () => {
      context('with an axios error', () => {
        it('calls next with the error', async () => {
          axios.get.rejects({ response: { data: { statusCode: 404, message: 'Error finding user' } } })
          await getUser.handleRequest(req, res, next, { id: '1234' })
          expect(next).to.have.been.calledOnce
            .and.calledWithExactly({ statusCode: 404, message: 'Error finding user' })
        })
      })

      context('with an unexpected error', () => {
        it('calls next with the error', async () => {
          await getUser.handleRequest(null, res, next, { id: '1234' })
          expect(next).to.have.been.calledOnce
            .and.calledWithExactly({ statusCode: 500, message: match.instanceOf(Error) })
        })
      })
    })

    context('with a non existing user', () => {
      it('calls next with an error', async () => {
        axios.get.returns({})
        await getUser.handleRequest(req, res, next, { id: '1234' })
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly(match.has('message', 'Failed to find user: 1234'))
      })
    })

    context('with an existing user', () => {
      it('calls cache.get to check for a cached user', async () => {
        await getUser.handleRequest(req, res, next, params)
        expect(cache.get).to.have.been.calledOnce
          .and.calledWithExactly('user:1234')
      })

      context('with a cached user', () => {
        beforeEach(() => {
          cache.get.returns({ id: '1234', cached: true })
        })
        it('calls res.send with the caches user', async () => {
          await getUser.handleRequest(req, res, next, params)
          expect(res.send).to.have.been.calledOnce
            .and.calledWithExactly({ status: 'success', data: { id: '1234', cached: true } })
        })
      })

      context('with no user in cache', () => {
        it('calls axios.post to get an access_token', async () => {
          await getUser.handleRequest(req, res, next, params)
          expect(axios.post).to.have.been.calledOnce
            .and.calledWithExactly(
              'https://saasio.eu.auth0.com/oauth/token', {
                audience: 'https://saasio.eu.auth0.com/api/v2/',
                client_id: '',
                client_secret: '',
                grant_type: 'client_credentials'
              })
        })

        it('calls axios.get to get the user', async () => {
          await getUser.handleRequest(req, res, next, params)
          expect(axios.get).to.have.been.calledOnce
            .and.calledWithExactly(
              'https://saasio.eu.auth0.com/api/v2/users/1234', {
                headers: { authorization: 'Bearer token' }
              })
        })

        it('sets the user in cache', async () => {
          await getUser.handleRequest(req, res, next, params)
          expect(cache.set).to.have.been.calledOnce
            .and.calledWithExactly('user:1234', { user_id: '1234', name: 'Test' }, 0)
        })

        it('calls res.send with the user', async () => {
          await getUser.handleRequest(req, res, next, params)
          expect(res.send).to.have.been.calledOnce
            .and.calledWithExactly({ status: 'success', data: { user_id: '1234', name: 'Test' } })
        })
      })
    })
  })
})
