'use strict'

const Cliente = use("App/Models/Cliente")

class ClienteController {

    async list ({request,response,params}){

        try {
        
            const {page, limit,all} = request.all();
            
            if(all){
                const clientes = await Cliente.query().where({excluido:false}).orderBy('razao_social').fetch();
                
                return clientes;
            }

            const clientes = await Cliente.query().where({excluido:false}).orderBy('razao_social').paginate(+page, +limit);

            return clientes;

        } catch (error) {
            return response.status(400).json({error:error});                
        }

    }


    async register ({request,response,params}) {

        try {
            let cliente = await request.all();

            cliente = await Cliente.create(cliente);

            return cliente;
        } catch (error) {
            
            return response.status(400).json({error:error});                
        }
    }


    async get ({request, response, params}) {

        try {
            
            const id = params.id;

            let cliente = await Cliente.findBy({_id:id});

            return cliente;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async update ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            
            let cliente  = await Cliente.query().where({_id:id}).update(dados);

            return cliente;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async delete ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            let cliente  = await Cliente.query().where({_id:id}).update({...dados,excluido:true});

            return cliente;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }

}

module.exports = ClienteController

