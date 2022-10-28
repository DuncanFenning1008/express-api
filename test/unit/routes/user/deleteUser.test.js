const appRoot = require('app-root-path')
const axios = require('axios')
const deleteUser = require(`${appRoot}/src/routes/users/deleteUser`)

// Helpers setup
const helpers = require(`${appRoot}/test/helpers`)
const { app, mockReq, mockRes, expect } = helpers

describe('deleteUser', () => {
  helpers.init()

  let req, res, next, params
  beforeEach(() => {
    req = mockReq({
      app
    })
    res = mockRes()
    next = helpers.sandbox.stub()
    params = {
      id: '5e601d71f26a124a46263d33'
    }
    helpers.sandbox.stub(axios, 'post').returns({ data: { access_token: 'token' } })
    helpers.sandbox.stub(axios, 'delete')
  })

  context('with an invalid req', () => {
    it('calls next with the error', async () => {
      await deleteUser.handleRequest(req, res, next, {})
      expect(next).to.have.been.calledOnce
        .and.calledWithExactly({ statusCode: 400, message: 'Missing required param:id to delete user' })
    })
  })

  context('with a valid req', () => {
    it('calls axios.post to get an access_token', async () => {
      await deleteUser.handleRequest(req, res, next, params)
      expect(axios.post).to.have.been.calledOnce
        .and.calledWithExactly(
          'https://saasio.eu.auth0.com/oauth/token', {
            audience: 'https://saasio.eu.auth0.com/api/v2/',
            client_id: '',
            client_secret: '',
            grant_type: 'client_credentials'
          })
    })
    it('calls axios.delete to delete the user', async () => {
      await deleteUser.handleRequest(req, res, next, params)
      expect(axios.delete).to.have.been.calledOnce
        .and.calledWithExactly(
          'https://saasio.eu.auth0.com/api/v2/users/5e601d71f26a124a46263d33', {
            headers: { authorization: 'Bearer token' }
          })
    })
    context('with a failed delete user', () => {
      it('calls next with an error', async () => {
        axios.delete.rejects('Error')
        await deleteUser.handleRequest(req, res, next, params)
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly({ statusCode: 500, message: 'Failed to delete user' })
      })
    })
    context('with a successful delete user', () => {
      it('calls res.send with the success flag', async () => {
        await deleteUser.handleRequest(req, res, next, params)
        expect(res.send).to.have.been.calledOnce
          .and.calledWithExactly({ status: 'success', message: 'User 5e601d71f26a124a46263d33 has been successfully deleted' })
      })
    })
  })
})
