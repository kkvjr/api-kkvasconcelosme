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
        let {page, limit} = request.get();

        const users = await User.query().orderBy('created_at', 'desc').paginate(+page || 1, +limit || 100);

        return response.status(200).json(users);
    }

    async store ({ request, response }) {
        
        const data = request.only(["nome","email", "password", "password_confirm"]);
        
        const usr = await User.findBy({email: data.email });

        if (usr) return response.status(400).json({ msg: 'Este e-mail já está registrado em outro usuário.' });

        const val = await Validation.validate_pwd(data.password, data.password_confirm);
        //not ok
        if (val.msg != "Ok") return response.status(401).json(val);

        const user_object = {
            nome:data.nome,
            email: data.email.toLowerCase(),
            password: data.password,
            ativo: true
        }

        const user = await User.create(user_object);
    
        return user;
    }




    async changePassword({request,auth,response, params}){
        


        const data=request.only(["oldpassword","password","confirmation"]);
        
        const uid=params.id;
        
        let user = await User.findBy('_id',uid);

        const hashedConfirmation=await Hash.make(data.confirmation);
        
        
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

        if (!verifyPassword) {
            return response.json({
                status: 'error',
                message: "A nova senha e sua confirmação não combinam! Tente novamente."
            });
        }
        
        user.password = data.password;
        user.ask_reset = false;

        await user.save();

        return response.json({
            status: 'success',
            message: 'Senha atualizada!'
        });

    }

    async changeUser({}) {
        
    }


    async deleteUser({request,auth,response,params}) {
        try {
            const id= params.id;

            console.log(id);

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

            user.password = pwd.pwd
            user.ask_reset = true;
            await user.save();

            const data = request.only(['email'])
            //const user = await User.create(data)
            user = await User.findBy('email',data.email);
            
            const vars = {
                to: email,
                from: 'financeiro@monedd.com',
                subject: 'Recuperação de Senha'
            }

            const obj = {
                nome: user.nome,
                nova_senha: pwd.pwd
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
    
          user.password = pwd
          user.ask_reset = true
          await user.save()
    
          user = await User.findBy('email', reset.email)
    
          const vars = {
            to: reset.email,
            from: `${Env.get('EMAIL_CONTATO_SMTP')}`,
            subject: 'Nova Senha'
          }
    
          const obj = {
            nome: user.first_name,
            nova_senha: pwd,
            link: `${Env.get('FIVEPAY_URL')}`
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
                from: 'financeiro@monedd.com',
                subject: 'Solicitação de Recuperação de Senha'
            }

            const obj = {
                nome: user.first_name,
                link: `${Env.get('FIVEPAY_RESETPWD_URL')}/${hash}`
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

}

module.exports = UserController

