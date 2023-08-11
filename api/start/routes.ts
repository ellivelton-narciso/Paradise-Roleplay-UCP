/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.group(()=>{
  Route.get('/', async () => {
    return { hello: 'world' }
  })
  Route.post('/login', 'AccountsController.login')
  Route.post('/register', 'AccountsController.register')
  Route.get('/users', 'AccountsController.showAll')
  Route.get('/users/:id', 'AccountsController.show')
  Route.post('/users/:id', 'AccountsController.update')
  Route.get('/isadmin', 'AccountsController.isAdmin')
  Route.get('/isValid', 'AccountsController.isValid')
  Route.get('/characters/:id', 'CharactersController.index')
  Route.post('/characters/:id', 'CharactersController.update')
  Route.post('/characters/:id/register', 'AplicacoesController.register')
  Route.get('/characters/avaliacao', 'AplicacoesController.show')
  Route.post('/characters/avaliacao/:id', 'AplicacoesController.update')
  Route.get('/aplicacoes', 'AplicacoesController.showAll')
  Route.get('/aplicacoes/:id', 'AplicacoesController.show')
  Route.get('/aplicacoes/user/:id', 'AplicacoesController.showUser')
  // Route.resource('/login', 'AccountsController.store').apiOnly()
}).prefix('/api')
