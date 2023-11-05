import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.get('/', async () => {
    return { hello: 'world' }
  })
  Route.post('/login', 'AccountsController.login')
  Route.post('/register', 'AccountsController.register')
  Route.get('/users', 'AccountsController.showAll')
  Route.get('/users/:id', 'AccountsController.show').where('id', /^[0-9]+$/)
  Route.post('/users/:id', 'AccountsController.update').where('id', /^[0-9]+$/)
  Route.post('/admin/users/:id', 'AccountsController.updateAdmin').where('id', /^[0-9]+$/)
  Route.get('/isadmin', 'AccountsController.isAdmin')
  Route.get('/isValid', 'AccountsController.isValid')
  Route.get('/characters/:id', 'CharactersController.index').where('id', /^[0-9]+$/)
  Route.post('/characters/:id', 'CharactersController.update').where('id', /^[0-9]+$/)
  Route.post('/characters/:id/register', 'AplicacoesController.register').where('id', /^[0-9]+$/)
  Route.post('/characters/avaliacao/:id', 'AplicacoesController.update').where('id', /^[0-9]+$/)
  Route.get('/aplicacoes', 'AplicacoesController.showAll')
  Route.get('/aplicacoes/:id', 'AplicacoesController.show').where('id', /^[0-9]+$/)
  Route.get('/aplicacoes/user/:id', 'AplicacoesController.showUser').where('id', /^[0-9]+$/)
}).prefix('/api')
