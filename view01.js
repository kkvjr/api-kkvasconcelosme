[
    {
      '$match': {
        'recorrente': {
          '$exists': false
        }, 
        'status': 'succeeded', 
        '$or': [
          {
            'payment_type': 'credit'
          }, {
            'payment_type': 'debit'
          }
        ]
      }
    }, {
      '$project': {
        '_id': '$_id', 
        'id': '$id', 
        'created_at': '$created_at', 
        'id_pos': '$point_of_sale.identification_number', 
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
        'fees': '$fees', 
        'history': '$history', 
        'data_formatada': {
          '$dateToString': {
            'date': {
              '$toDate': '$created_at'
            }, 
            'format': '%d/%m/%Y %H:%M:%S'
          }
        }, 
        'taxa_zoop': '$taxa_zoop', 
        'sales_receipt': '$sales_receipt'
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
        'id_pos': {
          '$ifNull': [
            '$id_pos', 'Unspecified'
          ]
        }, 
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
        'comprador': '$comprador', 
        'terminal_pos': '$terminal_pos', 
        'expiration': '$expiration', 
        'description': '$description', 
        'taxa_plano': '$taxa_plano', 
        'fees': '$fees', 
        'history': '$history', 
        'data_formatada': '$data_formatada', 
        'taxa_zoop': '$taxa_zoop', 
        'sales_receipt': '$sales_receipt'
      }
    }, {
      '$lookup': {
        'from': 'pos', 
        'localField': 'id_pos', 
        'foreignField': 'zoop_id', 
        'as': 'terminal_pos'
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
        'comprador': '$comprador', 
        'terminal_pos': '$terminal_pos', 
        'expiration': '$expiration', 
        'description': '$description', 
        'taxa_plano': '$taxa_plano', 
        'fees': '$fees', 
        'history': '$history', 
        'data_formatada': '$data_formatada', 
        'taxa_zoop': '$taxa_zoop', 
        'sales_receipt': '$sales_receipt'
      }
    }
  ]