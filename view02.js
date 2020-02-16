[
    {
      '$match': {
        'recorrente': {
          '$exists': false
        }, 
        'digitada': {
          '$exists': false
        }
      }
    }, {
      '$project': {
        '_id': '$_id', 
        'id': '$id', 
        'created_at': '$created_at', 
        'updated_at': '$updated_at', 
        'status': '$status', 
        'codigo': '$transaction_number', 
        'tipo': '$payment_type', 
        'entry_mode': '$point_of_sale.entry_mode', 
        'customer': '$customer', 
        'bandeira': '$payment_method.card_brand', 
        'cartao': {
          '$concat': [
            '$payment_method.first4_digits', ' **** **** ', '$payment_method.last4_digits'
          ]
        }, 
        'parcelas': '$installment_plan.number_installments', 
        'amount': '$amount', 
        'taxas': '$client_fee', 
        'liquido': '$liquido', 
        'on_behalf_of': '$on_behalf_of', 
        'expiration': '$payment_method.expiration_date', 
        'description': '$payment_method.description', 
        'taxa_plano': '$taxa_plano', 
        'history': '$history', 
        'url': '$payment_method.url', 
        'taxa_zoop': '$taxa_zoop'
      }
    }, {
      '$lookup': {
        'from': 'accounts', 
        'localField': 'on_behalf_of', 
        'foreignField': 'structure', 
        'as': 'account'
      }
    }, {
      '$unwind': {
        'path': '$account'
      }
    }, {
      '$project': {
        '_id': '$_id', 
        'id': '$id', 
        'created_at': '$created_at', 
        'updated_at': '$updated_at', 
        'id_pos': '$id_pos', 
        'status': '$status', 
        'codigo': '$codigo', 
        'tipo': '$tipo', 
        'entry_mode': '$entry_mode', 
        'customer': '$customer', 
        'bandeira': '$bandeira', 
        'cartao': '$cartao', 
        'parcelas': '$parcelas', 
        'amount': '$amount', 
        'taxas': '$taxas', 
        'liquido': '$liquido', 
        'on_behalf_of': '$on_behalf_of', 
        'id_cliente': '$account.cliente', 
        'account.cliente': {
          '$convert': {
            'input': '$account.cliente', 
            'to': 'objectId'
          }
        }, 
        'cliente': '$cliente', 
        'comprador': '$comprador', 
        'terminal_pos': '$terminal_pos', 
        'expiration': '$expiration', 
        'description': '$description', 
        'taxa_plano': '$taxa_plano', 
        'history': '$history', 
        'url': '$url', 
        'taxa_zoop': '$taxa_zoop'
      }
    }, {
      '$lookup': {
        'from': 'clients', 
        'localField': 'account.cliente', 
        'foreignField': '_id', 
        'as': 'cliente'
      }
    }, {
      '$lookup': {
        'from': 'buyers', 
        'localField': 'customer', 
        'foreignField': 'id', 
        'as': 'comprador'
      }
    }, {
      '$unwind': {
        'path': '$cliente'
      }
    }, {
      '$unwind': {
        'path': '$terminal_pos', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$unwind': {
        'path': '$comprador', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$project': {
        '_id': '$_id', 
        'id': '$id', 
        'created_at': '$created_at', 
        'updated_at': '$updated_at', 
        'id_pos': '$id_pos', 
        'status': '$status', 
        'codigo': '$codigo', 
        'tipo': '$tipo', 
        'entry_mode': '$entry_mode', 
        'customer': '$customer', 
        'bandeira': '$bandeira', 
        'cartao': '$cartao', 
        'parcelas': '$parcelas', 
        'amount': '$amount', 
        'taxas': '$taxas', 
        'liquido': '$liquido', 
        'on_behalf_of': '$on_behalf_of', 
        'id_cliente': '$id_cliente', 
        'account.cliente': {
          '$convert': {
            'input': '$account.cliente', 
            'to': 'objectId'
          }
        }, 
        'cliente': '$cliente', 
        'comprador': '$comprador', 
        'terminal_pos': '$terminal_pos', 
        'expiration': '$expiration', 
        'description': '$description', 
        'taxa_plano': '$taxa_plano', 
        'history': '$history', 
        'url': '$url', 
        'taxa_zoop': '$taxa_zoop'
      }
    }, {
      '$match': {
        'tipo': 'boleto', 
        'status': 'succeeded'
      }
    }
  ]