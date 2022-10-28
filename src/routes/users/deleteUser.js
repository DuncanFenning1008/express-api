const axios = require('axios')
const appRoot = require('app-root-path')
const config = require(`${appRoot}/config`)
const deleteUser = module.exports = {}

deleteUser.handleRequest = async (req, res, next, params) => {
  try {
    const { id } = params
    if (!id) {
      return next({ statusCode: 400, message: 'Missing required param:id to delete user' })
    }

    // Delete in Auth0
    const authResponse = await axios.post(config.auth.url.token, config.auth.params.user)
    await axios.delete(`${config.auth.url.base}/users/${id}`, {
      headers: { authorization: `Bearer ${authResponse.data.access_token}` }
    })

    // Remove from cache
    const cache = req.app.get('cache')
    const cacheKey = `user:${id}`
    cache.take(cacheKey)

    return res.status(200).send({
      status: 'success',
      message: `User ${id} has been successfully deleted`
    })
  } catch (error) {
    return next({ statusCode: 500, message: 'Failed to delete user' })
  }
}

// Route definition
deleteUser.route = {
  handler: deleteUser.handleRequest,
  method: 'delete',
  path: '/users/:id'
}
