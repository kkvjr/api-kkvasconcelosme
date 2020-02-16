'use strict'


const ObjectHash = use('object-hash');
const moment = use('moment');
const validarCartao = use('tc-card-validator')

class Util {

    static get_date() {
        return `${moment().format(Date.UTC())}`;
    }

    static toDate(date) {
        return `${moment().format(date)}`;
    }

    static generate_sha1(obj) {
        return ObjectHash.sha1(obj);
    }

    static generate_md5(obj) {
        return ObjectHash.MD5(obj);
    }

    static toReal(num) {
        let numero = num.toFixed(2).split('.');
        numero[0] = numero[0].split(/(?=(?:...)*$)/).join('.');
        return numero.join(',');
      }

    static validar_cartao(cartao) {
        let card = cartao.replace(/[^0-9]/g,'');
        if (!validarCartao.cardValidator(+card)) return { status: 'Erro', msg: 'Número de cartão inválido.' }
        return { status: 'OK', cartao: card.toString() }
    }
}

module.exports = Util;