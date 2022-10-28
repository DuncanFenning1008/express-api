const appRoot = require('app-root-path')
const axios = require('axios')
const updateUser = require(`${appRoot}/src/routes/users/updateUser`)

// Helpers setup
const helpers = require(`${appRoot}/test/helpers`)
const { app, mockReq, mockRes, expect } = helpers

describe('updateUser', () => {
  helpers.init()

  let req, res, next, params
  beforeEach(() => {
    req = mockReq({
      app
    })
    res = mockRes()
    next = helpers.sandbox.stub()
    params = {
      id: '5e6ff42951804e4d21821946',
      name: 'Updated user',
      email: 'updated.email@test.com'
    }
    helpers.sandbox.stub(axios, 'post').returns({ data: { access_token: 'token' } })
    helpers.sandbox.stub(axios, 'patch').returns({ data: [{ id: '1234', name: 'Updated user' }] })
  })

  context('with an invalid req', () => {
    it('calls next with the error', async () => {
      await updateUser.handleRequest(req, res, next, {})
      expect(next).to.have.been.calledOnce
        .and.calledWithExactly({ statusCode: 400, message: 'Missing required param:id to update user' })
    })
  })

  context('if the request errors', () => {
    context('with an axios error', () => {
      it('calls next with the error', async () => {
        axios.patch.rejects({ response: { data: { statusCode: 404, message: 'Error finding user' } } })
        await updateUser.handleRequest(req, res, next, params)
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly({ statusCode: 404, message: 'Error finding user' })
      })
    })
  })
  context('with a valid req', () => {
    it('calls axios.post to get an access_token', async () => {
      await updateUser.handleRequest(req, res, next, params)
      expect(axios.post).to.have.been.calledOnce
        .and.calledWithExactly(
          'https://saasio.eu.auth0.com/oauth/token', {
            audience: 'https://saasio.eu.auth0.com/api/v2/',
            client_id: '',
            client_secret: '',
            grant_type: 'client_credentials'
          })
    })
    it('calls axios.patch to update the user', async () => {
      await updateUser.handleRequest(req, res, next, params)
      expect(axios.patch).to.have.been.calledOnce
        .and.calledWithExactly(
          'https://saasio.eu.auth0.com/api/v2/users/5e6ff42951804e4d21821946', {
            connection: 'Username-Password-Authentication',
            name: 'Updated user',
            nickname: 'Updated user',
            email: 'updated.email@test.com',
            email_verified: true
          }, {
            headers: { authorization: 'Bearer token' }
          })
    })
    context('with a failed user update', () => {
      it('calls next with an error', async () => {
        axios.patch.rejects('Failed updating user')
        await updateUser.handleRequest(req, res, next, params)
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly({ statusCode: 500, message: 'Failed updating user' })
      })
    })
    context('with a successful user update', () => {
      it('calls res.send with the success flag', async () => {
        await updateUser.handleRequest(req, res, next, params)
        expect(res.send).to.have.been.calledOnce
          .and.calledWithExactly({
            status: 'success',
            message: 'User 5e6ff42951804e4d21821946 successfully updated',
            data: [{ id: '1234', name: 'Updated user' }]
          })
      })
    })
  })
})
