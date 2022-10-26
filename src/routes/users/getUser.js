const axios = require('axios')
const appRoot = require('app-root-path')
const config = require(`${appRoot}/config`)
const getUser = module.exports = {}

getUser.handleRequest = async (req, res, next, params) => {
  try {
    const cache = req.app.get('cache')
    const { id } = params

    if (!id) throw new Error('`id` is required to lookup a user')

    const cacheKey = `user:${id}`

    // Try to fetch from cache
    const cachedUser = cache.get(cacheKey)
    if (cachedUser) {
      return res.status(200).send({
        status: 'success',
        data: cachedUser
      })
    }

    // Get user from auth0
    const authResponse = await axios.post(config.auth.url.token, config.auth.params.user)
    const user = await axios.get(`${config.auth.url.base}/users/${id}`, {
      headers: { authorization: `Bearer ${authResponse.data.access_token}` }
    })
    if (!user.data) throw new Error(`Failed to find user: ${id}`)

    // Set in cache
    cache.set(cacheKey, user.data, process.env.CACHE_TTL)

    return res.status(200).send({
      status: 'success',
      data: user.data
    })
  } catch (error) {
    if (error.response && error.response.data) return next(error.response.data)
    return next({ status: 404, message: error })
  }
}

// Route definition
getUser.route = {
  handler: getUser.handleRequest,
  method: 'get',
  path: '/users/:id'
}
