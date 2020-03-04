'use strict'

const Parceiro = use("App/Models/Parceiro")

class ParceiroController {

    async list ({request,response,params}){

        try {
        
            const {page, limit,all} = request.all();

            if(all){
                const parceiros = await Parceiro.query().where({excluido:false}).orderBy('razao_social').fetch();

                return parceiros;

            }
            const parceiros = await Parceiro.query().where({excluido:false}).orderBy('razao_social').paginate(+page, +limit);

            return parceiros;

        } catch (error) {
            return response.status(400).json({error:error});                
        }

    }


    async register ({request,response,params}) {

        try {
            let parceiro = await request.all();

            parceiro = await Parceiro.create(parceiro);

            return parceiro;
        } catch (error) {
            console.log(error)
            return response.status(400).json({error:error});                
        }
    }


    async get ({request, response, params}) {

        try {
            
            const id = params.id;

            let parceiro = await Parceiro.findBy({_id:id});

            return parceiro;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async update ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            
            let parceiro  = await Parceiro.query().where({_id:id}).update(dados);

            return parceiro;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async delete ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            let parceiro  = await Parceiro.query().where({_id:id}).update({...dados,excluido:true});

            return parceiro;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }

}

module.exports = ParceiroController

