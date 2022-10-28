const axios = require('axios')
const appRoot = require('app-root-path')
const config = require(`${appRoot}/config`)
const getUsers = module.exports = {}

getUsers.handleRequest = async (req, res, next) => {
  try {
    const cache = req.app.get('cache')
    const cacheKey = 'users'

    // Try to fetch from cache
    const cachedUsers = cache.get(cacheKey)
    if (cachedUsers) {
      return res.status(200).send({
        status: 'success',
        data: {
          total: cachedUsers.length,
          users: cachedUsers
        }
      })
    }

    // Get user from auth0
    const authResponse = await axios.post(config.auth.url.token, config.auth.params.user)
    const users = await axios.get(`${config.auth.url.base}/users`, {
      headers: {
        authorization: `Bearer ${authResponse.data.access_token}`
      }
    })
    if (!users?.data?.length) {
      return next({ statusCode: 404, message: 'Failed to find users' })
    }

    // Set in cache
    cache.set(cacheKey, users.data, config.cache.ttl)

    return res.status(200).send({
      status: 'success',
      data: {
        total: users.data.length,
        users: users.data
      }
    })
  } catch (error) {
    // Handle auth0 error
    if (error.response && error.response.data) return next(error.response.data)
    return next({ statusCode: 500, message: error })
  }
}

// Route definition
getUsers.route = {
  handler: getUsers.handleRequest,
  method: 'get',
  path: '/users'
}
