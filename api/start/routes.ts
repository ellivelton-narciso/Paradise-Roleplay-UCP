import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.group(()=> {
    Route.post('/users/:id', 'AccountsController.updateAdmin').where('id', /^[0-9]+$/)
    Route.get('/characters/', 'CharactersController.showAll')
    Route.post('/characters/:id', 'CharactersController.updateAdmin').where('id', /^[0-9]+$/)
  }).prefix('/admin')

  Route.post('/register', 'AccountsController.register')
  Route.post('/login', 'AccountsController.login')

  Route.post('/recovery', 'AccountsController.recovery')
  Route.post('/recovery/code/:id', 'AccountsController.checkCode')
  Route.post('/recovery/:id', 'AccountsController.changePass')

  Route.get('/users', 'AccountsController.showAll')
  Route.get('/users/:id', 'AccountsController.show').where('id', /^[0-9]+$/)
  Route.post('/users/:id', 'AccountsController.update').where('id', /^[0-9]+$/)
  Route.get('/isadmin', 'AccountsController.isAdmin')
  Route.get('/isValid', 'AccountsController.isValid')
  Route.post('/compraFeita', 'AccountsController.compra')
  Route.post('/notific/:uuid', 'AccountsController.notific')
  Route.get('/notific/:uuid', 'AccountsController.notific')
  Route.get('/pagamento_seguro', 'AccountsController.pagamentoSeguro')
  Route.get('/characters/:id', 'CharactersController.index').where('id', /^[0-9]+$/)
  Route.post('/characters/:id', 'CharactersController.update').where('id', /^[0-9]+$/)
  Route.post('/characters/:id/register', 'AplicacoesController.register').where('id', /^[0-9]+$/)
  Route.post('/characters/avaliacao/:id', 'AplicacoesController.update').where('id', /^[0-9]+$/)
  Route.get('/aplicacoes', 'AplicacoesController.showAll')
  Route.get('/aplicacoes/:id', 'AplicacoesController.show').where('id', /^[0-9]+$/)
  Route.get('/aplicacoes/user/:id', 'AplicacoesController.showUser').where('id', /^[0-9]+$/)
  Route.get('/logs', 'LogsController.show')
  Route.post('/vehicle/:id', 'AplicacoesController.vehicle')

}).prefix('/api')
