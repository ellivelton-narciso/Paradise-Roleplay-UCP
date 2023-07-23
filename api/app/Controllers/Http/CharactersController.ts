import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Character from "App/Models/Character";
import Accounts from "App/Models/Accounts";

export default class CharactersController {
  public async index({request, response}: HttpContextContract) {
    const body = request.body()
    const validAccount: Accounts | null = await Accounts.findBy('id', body.id)
    if(validAccount) {
      const charactersConnect = await Character.findMany([body.character0, body.character1, body.character2])
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const token: string = authorization[findAuthorization].split(' ')[1]
      const tokenOK: boolean = validAccount.tokentmp === token

      if(validHeader && tokenOK) {

        return response.status(200).json({
          "status": 200,
          "personagens": charactersConnect
        })
      } else {
        await Accounts.updateOrCreate({
          "id": validAccount.id,
        }, {
          "tokentmp": ''
        })

        return response.status(401).json({
          status: 401,
          msg: 'Não autorizado, token invalido ou expirado.'
        })
      }
    } else {
      return response.status(401).json({
        status: 401,
        msg: 'ID inválido.'
      })
    }
  }

  public async update ({params, request, response}: HttpContextContract) {
    const body = request.body()
    const validCharacter : Character | null = await Character.findBy('id', params.id)
    if(validCharacter) {
      const validAccount : Accounts | null = await Accounts.findBy('id', body.id)
      if(validAccount) {
        function characterCorreto (): boolean {
          if (validAccount) {
            if (validAccount.character0 === params.id) {
              return true
            }
            else {
              if (validAccount.character1 === params.id) {
                return true
              }
              else {
                return validAccount.character2 === params.id;
              }
            }
          } else {
            return false
          }

        }
        if(characterCorreto()) {
          const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
          const findAuthorization: number = authorization.indexOf('Authorization') + 1
          const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
          const token: string = authorization[findAuthorization].split(' ')[1]
          const tokenOK: boolean = validAccount.tokentmp === token

          if(validHeader && tokenOK) {
            if(body.skin !== validCharacter.skin)
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
            await Accounts.updateOrCreate({
              "id": validAccount.id,
            }, {
              "tokentmp": ''
            })
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
