import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Character from "App/Models/Character";
import Accounts from "App/Models/Accounts";
import ApiToken from "App/Models/ApiToken";
import Aplicacoes from "App/Models/Aplicacoe";

export default class CharactersController {
  public async index({params, response}: HttpContextContract) {
    const user: Accounts | null = await Accounts.findBy('id', params.id)
    if(user) {
      const charactersConnect = await Character.findMany([user.character0, user.character1, user.character2])
      const aplicacoes = await Aplicacoes.query().where('user_id', params.id)
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
        if (data) {
          return data.token
        } else {
          return false
        }
      })
      const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false

      if(validHeader && tokenOK) {

        return response.status(200).json({
          "status": 200,
          "personagens": charactersConnect,
          "aplicacoes": aplicacoes.length
        })
      } else {
        //LEMBRAR: Deletar o Token ao errar
        /*await Accounts.updateOrCreate({
          "id": validAccount.id,
        }, {
          "tokentmp": ''
        })*/

        return response.status(200).json({
          status: 401,
          msg: 'Não autorizado, token invalido ou expirado.'
        })
      }
    } else {
      return response.status(200).json({
        status: 401,
        msg: 'ID inválido.'
      })
    }
  }

  public async update ({params, request, response}: HttpContextContract) {
    const body = request.body()
    const personagem : Character | null = await Character.findBy('id', params.id)
    if(personagem) {
      const user : Accounts | null = await Accounts.findBy('id', body.id)
      if(user) {
        function characterCorreto (): boolean {
          if (user) {
            return [user.character0, user.character1, user.character2].filter(f => f == params.id).length > 0;
          }
          return false
        }
        if(characterCorreto()) {
          const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
          const findAuthorization: number = authorization.indexOf('Authorization') + 1
          const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
          const tokenBody: string = authorization[findAuthorization].split(' ')[1]
          const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
            if (data) {
              return data.token
            } else {
              return false
            }
          })
          const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false

          if(validHeader && tokenOK) {
            if(body.skin !== personagem.skin)
              await Character.updateOrCreate({
                "id": params.id
              }, {
                "skin": body.skin
              })
            return response.status(201).json({
              status: 201,
              msg: "Skin alterada com sucesso."
            })
          } else {
            //LEMBRAR: Deletar o Token caso inválido.
            /*await Accounts.updateOrCreate({
              "id": user.id,
            }, {
              "tokentmp": ''
            })*/
            return response.status(401).json({
              status: 401,
              msg: 'Não autorizado, token invalido ou expirado.'
            })
          }
        } else {
          return response.status(401).json({
            status: 401,
            msg: 'Personagem não pertence ao Usuário.'
          })
        }
      } else {
        return response.status(401).json({
          status: 401,
          msg: 'ID da conta inválido.'
        })
      }
    } else {
      return response.status(401).json({
        status: 401,
        msg: 'ID Inválido.'
      })
    }
  }
}
