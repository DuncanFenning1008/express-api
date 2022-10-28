const appRoot = require('app-root-path')
const axios = require('axios')
const createUser = require(`${appRoot}/src/routes/users/createUser`)

// Helpers setup
const helpers = require(`${appRoot}/test/helpers`)
const { app, mockReq, mockRes, match, expect } = helpers

describe('createUser', () => {
  helpers.init()

  let req, res, next, params
  beforeEach(() => {
    req = mockReq({
      app
    })
    res = mockRes()
    next = helpers.sandbox.stub()
    params = {
      email: 'newUser@test.com',
      name: 'New McTest',
      password: 'password'
    }
  })

  context('handleRequest', () => {
    beforeEach(() => {
      helpers.sandbox.stub(createUser, 'format').returns({ name: 'New McTest' })
      helpers.sandbox.stub(axios, 'post')
      axios.post.onCall(0).returns({ data: { access_token: 'token' } })
      axios.post.onCall(1).returns({ data: { message: 'User successfully created' } })
    })
    context('with an invalid req', () => {
      it('calls next with the error', async () => {
        await createUser.handleRequest(null, res, next, params)
        expect(next).to.have.been.calledOnce
          .and.calledWithExactly({ statusCode: 500, message: match.instanceOf(Error) })
      })
    })
    context('with a valid req', () => {
      it('calls axios.post to get an access_token', async () => {
        await createUser.handleRequest(req, res, next, params)
        expect(axios.post.firstCall).to.have
          .been.calledWithExactly(
            'https://saasio.eu.auth0.com/oauth/token', {
              audience: 'https://saasio.eu.auth0.com/api/v2/',
              client_id: '',
              client_secret: '',
              grant_type: 'client_credentials'
            })
      })
      context('if the user already exists', () => {
        it('calls next with an error', async () => {
          axios.post.onCall(1).rejects({ response: { data: { statusCode: 409, message: 'User already exists' } } })
          await createUser.handleRequest(req, res, next, params)
          expect(next).to.have.been.calledOnce
            .and.calledWithExactly({ statusCode: 409, message: 'User already exists' })
        })
      })
      context('if the user doesnt exist', () => {
        it('calls format with the new user params', async () => {
          await createUser.handleRequest(req, res, next, params)
          expect(createUser.format).to.have.been.calledOnce
            .and.calledWithExactly(params)
        })
        it('calls axios.post with the new user', async () => {
          await createUser.handleRequest(req, res, next, params)
          expect(axios.post.secondCall).to.have
            .been.calledWithExactly(
              'https://saasio.eu.auth0.com/api/v2/users', { name: 'New McTest' }, { headers: { authorization: 'Bearer token' } })
        })
        it('calls res.send with the success flag', async () => {
          await createUser.handleRequest(req, res, next, params)
          expect(res.send).to.have.been.calledOnce
            .and.calledWithExactly({ status: 'success', data: { message: 'User successfully created' } })
        })
      })
    })
  })

  context('format', () => {
    it('returns a formatted product', () => {
      const expected = {
        name: 'New McTest',
        nickname: 'New McTest',
        email: 'newUser@test.com',
        password: 'password',
        connection: 'Username-Password-Authentication',
        email_verified: true,
        user_metadata: {
          type: 'standard'
        }
      }
      expect(createUser.format(params)).to.deep.equal(expected)
    })
  })
})
