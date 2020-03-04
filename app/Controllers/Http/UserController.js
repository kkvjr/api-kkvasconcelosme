'use strict'

const User = use("App/Models/User")
const Validation = use('App/Helpers/Validation');
const Hash=use('Hash')
const GeneratePwd = use('App/Helpers/GeneratePwd');
const Mail = use('Mail');
const Reset = use('App/Models/Reset')
const Env = use('Env')
const Util = use('App/Helpers/Util')
const { isArray } = require('util')

class UserController {
    async index ({request, auth, response}) {
        let {page, limit,cliente} = request.get();

        const users = await User.query().where({cliente:cliente}).orderBy('created_at', 'desc').paginate(+page || 1, +limit || 100);

        return response.status(200).json(users);
    }

    async store ({ request, response }) {
        try {
            
        
        const data = request.only(["nome","email",'cliente']);
        
        const usr = await User.findBy({email: data.email });

        if (usr) return response.status(400).json({ msg: 'Este e-mail já está registrado em outro usuário.' });

        const pwd = await GeneratePwd.random_pwd();

        const hashedPwd = await Hash.make(pwd.pwd);

        const user_object = {
            nome:data.nome,
            email: data.email.toLowerCase(),
            password: hashedPwd,
            ativo: true,
            ask_reset:true,
            tipo:'cliente',
            excluido:false,
            cliente:data.cliente
        }

        const user = await User.create(user_object);


        const vars = {
            to: data.email.toLowerCase(),
            from: 'suporte@kkvasconcelosme.com.br',
            subject: 'Bem vindo ao Dashboard da K. K. Vasconcelos M.E.'
        }

        const obj = {
            nome: user.nome,
            nova_senha: pwd.pwd,
            link:'https://sistemas.kkvasconcelosme.com.br/dashboard-cliente'
        }
    
        await Mail.send('emails.welcome', obj, (message) => {

        message
            .to(vars.to)
            .from(vars.from)
            .subject(vars.subject)
        })

    
        return user;
        } catch (error) {                
            console.log(error)
            return response.status(400).json({error:error});
        }
    }

    async changePassword({request,auth,response, params}){
        try {
                        
            const data=request.only(["oldpassword","password","confirmation"]);
            
            const uid=params.id;
            
            let user = await User.findBy('_id',uid);

            const hashedConfirmation=await Hash.make(data.confirmation);
            console.log(data.oldpassword);
            
            const verifyOldPassword = data.oldpassword? await Hash.verify(
                data.oldpassword,
                user.password
            ) : true;
        
            
            if (!verifyOldPassword) {
                return response.json({
                    status: 'error',
                    message: 'Não foi possível verificar a senha atual. Tente novamente.'
                });
            }      
            


            const verifyPassword = await Hash.verify(             
                data.password,
                hashedConfirmation
            );

                console.log('nova senha:',data.password)

                console.log(verifyPassword);

            if (!verifyPassword) {
                return response.json({
                    status: 'error',
                    message: "A nova senha e sua confirmação não combinam! Tente novamente."
                });
            }
            
            const hashedPwd = await Hash.make(data.password);

            user.password = hashedPwd;

            user.ask_reset = false;
            
            await user.save();

            return response.json({
                status: 'success',
                message: 'Senha atualizada!'
            });
            

        } catch (error) {
            console.log(error)       
        }

    }


    async delete({request,auth,response,params}) {
        try {
            const id= params.id

            const usuario = await User.findBy('_id',id);
            
            await usuario.delete();

        } catch (error) {
            console.log(error);
        }
        
    }

    async reset_pwd({ request, response, auth }) {
        try {
            const { email } = request.post();
            
            const pwd = await GeneratePwd.random_pwd();
            
            let user = await User.findBy({
                email: email
            });
            if (!user) return response.status(404).json({error: 'Users not found'});

            const hashedPwd = await Hash.make(pwd.pwd);

            user.password = hashedPwd;

            user.ask_reset = true;
            
            await user.save();

            const data = request.only(['email'])
            //const user = await User.create(data)
            user = await User.findBy('email',data.email);
            
            const vars = {
                to: email,
                from: 'suporte@kkvasconcelosme.com.br',
                subject: 'Recuperação de Senha'
            }

            const obj = {
                nome: user.nome,
                nova_senha: pwd.pwd,
                link:'https://sistemas.kkvasconcelosme.com.br/dashboard-cliente'
            }
        
            await Mail.send('emails.reset_pwd', obj, (message) => {
            message
                .to(vars.to)
                .from(vars.from)
                .subject(vars.subject)
            })
                     
            return response.status(200).json({
                msg: 'Senha alterada!', 
                email: email
            });
        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: error.message });
        }
    }

    async reset_pwd_hash ({ request, response, params, view }) {
        try {
          const { id } = params
          const reset = await Reset.findBy({ hash: id, status: true })
          if (!reset) {
            return view.render('emails.reset_pwd_failed')
          }
    
          let user = await User.findBy({
            email: reset.email
          })
          if (!user) return response.status(404).json({ error: 'Users not found' })
    
          const pwd = GeneratePwd.random_pwd_numeric()
          const hashedPwd = await Hash.make(pwd.pwd);

          user.password = hashedPwd;

          user.ask_reset = true
          await user.save()
    
          user = await User.findBy('email', reset.email)
    
          const vars = {
            to: reset.email,
            from:'suporte@kkvasconcelosme.com.br',
            subject: 'Nova Senha'
          }
    
          const obj = {
            nome: user.first_name,
            nova_senha: pwd,
            link: 'https://sistemas.kkvasconcelosme.com.br/dashboard-cliente'
          }
    
          const em = await Mail.send('emails.reset_pwd', obj, message => {
            message
              .to(vars.to)
              .from(vars.from)
              .subject(vars.subject)
          })
    
          reset.status = false
    
          await reset.save()
    
          return view.render('emails.reset_pwd_success', {nome: user.first_name})

        } catch (error) {
          return response.status(500).json({error: error.message})
        }
      }
    
    async ask_reset_pwd ({ request, response }) {
        try {
            const { email } = request.post()
            const timestamp = new Date().getTime()

            const user = await User.findBy('email', email)
            if (!user) return response.status(400).json({error: 'User not found'})

            const hash = Util.generate_sha1({email, timestamp})
            const reset = await Reset.create({ email, timestamp, hash, status: true })

            const vars = {
                to: email,
                from: 'suporte@kkvasconcelosme.com.br',
                subject: 'Solicitação de Recuperação de Senha'
            }

            const obj = {
                nome: user.first_name,
                link: 'http://localhost:8098/reset-password/'+hash
            }

            const em = await Mail.send('emails.ask_reset_pwd', obj, message => {
            message
                .to(vars.to)
                .from(vars.from)
                .subject(vars.subject)
            })

            // SendEmail.logEmailSend(em, 'RESET DE SENHA')
            return response.status(200).json({
                msg: 'Solicitação enviada!',
                email
            })
        } catch (error) {
            return response.status(400).json({error: error.message})
        }
    }

    async update_permissions({params,request,response}){
        try {
            const body = request.all();

            let user = await User.findBy('_id',body.id);

            user.permissoes = body.permissoes;

            await user.save();

        } catch (error) {
            console.log(error);
            return response.status(500).json({ error: error.message });
        }
    }


    async add_new_permission({params,request,response}){
        try {

            const permission = params.id;

            const usuarios = await User.query().fetch();

            for (let usuario of usuarios.rows) {
                if (isArray(usuario.permissoes)){
                    usuario.permissoes.push(permission);
                }
                await usuario.save()
            }
            
            return usuarios

        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    }



    async update ({request,response,params}){
        try {
            const id = params.id;

            const usuario = request.all();

            await User.query().where({_id:id}).update(usuario);

            return response.status(200).json({data:usuario});
        } catch (error) {
            return response.status(500).json({error:error.message})
        }
    }

}

module.exports = UserController

