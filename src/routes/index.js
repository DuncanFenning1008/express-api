const path = require('path')
const routes = module.exports = {}

const controllers = require('include-all')({
  dirname: path.join(__dirname, './'),
  filter: /^(?!index)(.+?)\.js$/,
  flatten: true
})

routes.initialise = (app) => {
  for (const routeName in controllers) {
    const { route } = controllers[routeName]
    app[route.method](route.path, async (req, res, next) => {
      const params = { ...req.params, ...req.body, ...req.query }
      await route.handler(req, res, next, params)
    })
  }
}
