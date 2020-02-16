'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */

const Route = use('Route')

Route.get('/', () => {
  return '<h1>Bem-vindo a API da PagPrime.</h1>'
})

const authenticated = Route.group(() => {
  
  Route.get('/users','UserController.index');
  Route.post('/users','UserController.store');


}).prefix('api').middleware('auth')

const non_authenticated = Route.group(() => {
    
  //envia solicitaÃ§Ã£o para o e-mail
  Route.post('/users/resetpwd', 'UserController.ask_reset_pwd')
  Route.get('/reset-password/:id', 'UserController.reset_pwd_hash')
  Route.post('sessions/login', 'SessionController.create')

  
}).prefix('api')