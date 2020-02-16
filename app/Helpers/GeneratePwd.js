'use strict'

class GeneratePwd {
    static async random_pwd(){
        let pass = "";

        for (let i = 0; i < 10; i++) {
            pass += this.getRandomChar();
        }

        let pwd = { pwd: pass.toString() };

        return pwd;
    }

    static getRandomChar() {
        /*
        *    matriz contendo em cada linha indices (inicial e final) da tabela ASCII para retornar alguns caracteres.
        *    [48, 57] = numeros;
        *    [64, 90] = "@" mais letras maiusculas;
        *    [97, 122] = letras minusculas;
        */
        let ascii = [[48, 57],[64,90],[97,122]];
        let i = Math.floor(Math.random()*ascii.length);

        return String.fromCharCode(Math.floor(Math.random()*(ascii[i][1]-ascii[i][0]))+ascii[i][0]);
    }

    static random_pwd_numeric() {
        let pwd = ''
        for (let i = 0; i < 6; i++) {
            pwd += Math.floor(Math.random() * 10).toString()
        }
        return pwd
    }
}

module.exports = GeneratePwd;