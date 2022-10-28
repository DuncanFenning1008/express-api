const axios = require('axios')
const appRoot = require('app-root-path')
const config = require(`${appRoot}/config`)
const updateUser = module.exports = {}

updateUser.handleRequest = async (req, res, next, params) => {
  try {
    // Format params
    const user = updateUser.formatUser(params)

    const { id } = params
    if (!id) {
      return next({ statusCode: 400, message: 'Missing required param:id to update user' })
    }

    // Update in Auth0
    const authResponse = await axios.post(config.auth.url.token, config.auth.params.user)
    const updatedUser = await axios.patch(`${config.auth.url.base}/users/${id}`, user, {
      headers: { authorization: `Bearer ${authResponse.data.access_token}` }
    })

    // Update the cache
    const cache = req.app.get('cache')
    const cacheKey = `user:${id}`
    cache.set(cacheKey, user, config.cache.ttl)

    return res.status(200).send({
      status: 'success',
      message: `User ${id} successfully updated`,
      data: updatedUser.data
    })
  } catch (error) {
    // Handle auth0 error
    if (error.response && error.response.data) return next(error.response.data)
    return next({ statusCode: 500, message: 'Failed updating user' })
  }
}

updateUser.formatUser = (params) => {
  const { name, email } = params
  const updatedUser = { connection: 'Username-Password-Authentication' }

  // Update username
  if (name) {
    updatedUser.name = name
    updatedUser.nickname = name
  }

  // Update email
  if (email) {
    updatedUser.email = email
    updatedUser.email_verified = true
  }

  return updatedUser
}

// Route definition
updateUser.route = {
  handler: updateUser.handleRequest,
  method: 'patch',
  path: '/users/:id'
}
