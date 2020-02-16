'use strict'

class Validation {
    static async validate_pwd(pwd, pwd_c) {
        let obj = {};

        if (!pwd || !pwd_c) {
            obj.msg = "Pwd field's can not be null";
            return obj;
        }
        
        if (pwd != pwd_c) {
            obj.msg = "Pwd must be equals than pwd confirmation";
            return obj;
        }
        
        if (pwd.length < 6) {
            obj.msg = "Minimun 6 chars for a valid pwd";
            return obj;
        }
        
        obj.msg = "Ok";
        return obj;
    }

    static validate_card_fields(cards) {
        for (let index = 0; index < cards.length; index++) {
            if (
                !cards[index].name || 
                !cards[index].expiration_month ||
                !cards[index].expiration_year || 
                !cards[index].number || 
                !cards[index].cvc
            ) 
            { return false; }
        }
        return true;
    }
}

module.exports = Validation