'use strict'

const User = use('App/Models/User');

class SessionController {
    async create ({ request, auth, response }) { 
        try {
            const { email, password } = request.only(['email', 'password']);
            
            let user = await User.findBy({
                email: email.toLowerCase(),
                ativo: true
            });

            if (!user) return response.status(401).json({error: 'Usuário inexistente ou desativado.'});
            
            
            if(user.tipo && user.tipo==='cliente') return response.status(401).json({error: 'Acesso negado por falta de privilégios.'});

            user.password = undefined;
            
            const token = await auth
            //.withRefreshToken() //does not work
            .attempt(email.toLowerCase(), password, {
                email: email.toLowerCase(),
                user
            }, {
                expiresIn: 86400,
                algorithm: 'HS256'
            });
        
            
            return token;
        } catch (error) {
            console.log(error)
            return response.status(400).json({error: error.message})
        }
    }

    async create_cliente_login ({ request, auth, response }) { 
        try {
            const { email, password } = request.only(['email', 'password']);
            
            let user = await User.findBy({
                email: email.toLowerCase(),
                ativo: true,
                tipo:'cliente'
            });

            if (!user) return response.status(401).json({error: 'Usuário inexistente ou desativado.'});
            
            user.password = undefined;
            
            console.log(password)
            const token = await auth
            //.withRefreshToken() //does not work
            .attempt(email.toLowerCase(), password, {
                email: email.toLowerCase(),
                user
            }, {
                expiresIn: 86400,
                algorithm: 'HS256'
            });
        
            
            return token;
        } catch (error) {
            console.log(error)
            return response.status(400).json({error: error.message})
        }
    }

    //not working
    async refresh_token({request, auth}) {
        try {
            //invalid ?
            const refresh_token = request.input('refresh_token');
            //const decrypted = Encryption.decrypt(refresh_token);

            const new_token = auth.newRefreshToken().generateForRefreshToken(refresh_token, true);

            return new_token;
        } catch (error) {
            return response.status(400).json(error)
        }
    }

    async teste ({request,response}){
        return 'Olá';
    }
}

module.exports = SessionController
