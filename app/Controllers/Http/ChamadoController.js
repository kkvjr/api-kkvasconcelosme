'use strict'

const Chamado = use("App/Models/Chamado")
const Controle = use("App/Models/Controle")
const moment = use('moment')
class ChamadoController {

    async list ({request,response,params}){

        try {
        
            const {page, limit} = request.all();
            
            const chamados = await Chamado.query().orderBy('numero').paginate(+page, +limit);

            return chamados;

        } catch (error) {
            return response.status(400).json({error:error});                
        }

    }


    async register ({request,response,params}) {

        try {
            let chamado = await request.all();

            let controle = await Controle.findBy({key:'nro_chamado'})

            controle.value = +controle.value + 1;

            chamado.numero=controle.value;

            chamado.situacao='Em Aberto';

            chamado = await Chamado.create(chamado);

            await controle.save();

            return chamado;
        } catch (error) {
            
            return response.status(400).json({error:error});                
        }
    }


    async get ({request, response, params}) {

        try {
            
            const id = params.id;

            let chamado = await Chamado.findBy({_id:id});

            return chamado;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async update ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            
            let chamado  = await Chamado.query().where({_id:id}).update(dados);

            return chamado;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }


    async delete ({request, response, params}) {
        try {
            const id = params.id;

            const dados = request.all();

            let chamado  = await Chamado.query().where({_id:id}).delete();

            return chamado;

        } catch (error) {
            return response.status(400).json({error:error});                
        }
    }

    async previsao({request,response,params}){
        try {

            const {page,limit} = request.all();
             
            const data_atual = moment(new Date()).format('YYYY-MM-DD');

            let consulta  = Chamado.query().where({situacao:'Em Aberto'});
            
            consulta.where({atendimento:{'$eq':data_atual}})

            const chamados  = await consulta.orderBy('numero').paginate(+page || 1, +limit || 100);

            return response.status(200).json(chamados);

        } catch (error) {
            
            return response.status(400).json({error:error});                
        }


    }

}

module.exports = ChamadoController

