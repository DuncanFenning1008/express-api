const appRoot = require('app-root-path')
const axios = require('axios')
const getUsers = require(`${appRoot}/src/routes/users/getUsers`)

// Helpers setup
const helpers = require(`${appRoot}/test/helpers`)
const { app, cache, mockReq, mockRes, match, expect } = helpers

describe('getUsers', () => {
  helpers.init()

  let req, res, next, params
  beforeEach(() => {
    req = mockReq({
      app
    })
    res = mockRes()
    next = helpers.sandbox.stub()
    params = {}
    helpers.sandbox.stub(axios, 'post').returns({ data: { access_token: 'token' } })
    helpers.sandbox.stub(axios, 'get').returns({ data: [{ id: '1234', name: 'Test' }] })
  })

  context('with a valid req', () => {
    context('with an invalid response', () => {
      context('with an axios error', () => {
        it('calls next with the error', async () => {
          axios.get.rejects({ response: { data: 'Error finding users' } })
          await getUsers.handleRequest(req, res, next, { email: 'test@test.co.uk' })
          expect(next).to.have.been.calledOnce
            .and.calledWithExactly('Error finding users')
        })
      })

      context('with an unexpected error', () => {
        it('calls next with the error', async () => {
          await getUsers.handleRequest(null, res, next, { id: '1234' })
          expect(next).to.have.been.calledOnce
            .and.calledWithExactly({ statusCode: 500, message: match.instanceOf(Error) })
        })
      })
    })

    context('with no users found', () => {
      it('calls next with an error', async () => {
        axios.get.returns({})
        await getUsers.handleRequest(req, res, next, { email: 'test@test.co.uk' })
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly(match.has('message', 'Failed to find users'))
      })
    })

    it('checks cached for users', async () => {
      await getUsers.handleRequest(req, res, next, params)
      expect(cache.get).to.have.been.calledOnce
        .and.calledWithExactly('users')
    })

    context('with cached users', () => {
      beforeEach(() => {
        cache.get.returns([{ email: 'test@test.com', cached: true }])
      })
      it('calls res.send with cached users', async () => {
        await getUsers.handleRequest(req, res, next, params)
        expect(res.send).to.have.been.calledOnce
          .and.calledWithExactly({ status: 'success', data: { total: 1, users: [{ email: 'test@test.com', cached: true }] } })
      })
    })
    context('with no cached users', () => {
      it('calls cache.set with the users', async () => {
        await getUsers.handleRequest(req, res, next, params)
        expect(cache.set).to.have.been.calledOnce
          .and.calledWithExactly('users', [{ id: '1234', name: 'Test' }], 0)
      })
      it('calls res.send with all users', async () => {
        await getUsers.handleRequest(req, res, next, params)
        expect(res.send).to.have.been.calledOnce
          .and.calledWithExactly({ status: 'success', data: { total: 1, users: [{ id: '1234', name: 'Test' }] } })
      })
    })
  })
})
