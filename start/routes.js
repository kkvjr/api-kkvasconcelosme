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
  Route.put('/users/pwd/:id', 'UserController.changePassword')
  Route.put('/users/:id','UserController.update');
  Route.delete('/users/delete/:id','UserController.delete');

  Route.get('/clientes','ClienteController.list');
  Route.post('/clientes','ClienteController.register');
  Route.get('/clientes/:id','ClienteController.get');
  Route.put('/clientes/:id','ClienteController.update');
  Route.delete('/clientes/:id','ClienteController.delete');


  Route.get('/parceiros','ParceiroController.list');
  Route.post('/parceiros','ParceiroController.register');
  Route.get('/parceiros/:id','ParceiroController.get');
  Route.put('/parceiros/:id','ParceiroController.update');
  Route.delete('/parceiros/:id','ParceiroController.delete');

  Route.get('/chamados','ChamadoController.list');
  Route.post('/chamados','ChamadoController.register');
  Route.get('/chamados/:id','ChamadoController.get');
  Route.put('/chamados/:id','ChamadoController.update');
  Route.delete('/chamados/:id','ChamadoController.delete');
  Route.get('/previsao/chamados','ChamadoController.previsao');


}).prefix('api').middleware('auth')

const non_authenticated = Route.group(() => {
    
  //envia solicitaÃ§Ã£o para o e-mail
  Route.post('/users/resetpwd', 'UserController.ask_reset_pwd')
  Route.get('/reset-password/:id', 'UserController.reset_pwd_hash')
  Route.post('sessions/login', 'SessionController.create')
  Route.post('sessions/clientes/login', 'SessionController.create_cliente_login')

  Route.get('/teste','SessionController.teste');
  
}).prefix('api')