const axios = require('axios')
const appRoot = require('app-root-path')
const config = require(`${appRoot}/config`)
const createUser = module.exports = {}

createUser.handleRequest = async (req, res, next, params) => {
  try {
    // Format params
    const formattedUser = createUser.format(params)

    // Create user in auth0
    const authResponse = await axios.post(config.auth.url.token, config.auth.params.user)
    const newUser = await axios.post(`${config.auth.url.base}/users`, formattedUser, {
      headers: { authorization: `Bearer ${authResponse.data.access_token}` }
    })

    // Add user to cache
    const cache = req.app.get('cache')
    const cacheKey = `user:${newUser.user_id}`
    cache.set(cacheKey, formattedUser, process.env.CACHE_TTL)

    return res.status(201).send({ status: 'success', data: newUser.data })
  } catch (error) {
    if (error.response && error.response.data) return next(error.response.data)
    return next(error)
  }
}

createUser.format = (user) => {
  const { name, email, password } = user
  return {
    name,
    email,
    password,
    nickname: name,
    connection: 'Username-Password-Authentication',
    email_verified: true,
    user_metadata: {
      type: 'standard'
    }
  }
}

// Route definition
createUser.route = {
  handler: createUser.handleRequest,
  method: 'post',
  path: '/users/create'
}
