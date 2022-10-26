const auth = {
  url: {
    base: 'https://saasio.eu.auth0.com/api/v2',
    token: 'https://saasio.eu.auth0.com/oauth/token'
  },
  params: {
    user: {
      client_id: process.env.AUTH_USER_ID,
      client_secret: process.env.AUTH_USER_SECRET,
      audience: 'https://saasio.eu.auth0.com/api/v2/',
      grant_type: 'client_credentials'
    }
  }
}

module.exports = {
  auth
}
