import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Character from 'App/Models/Character'
import Accounts from 'App/Models/Accounts'
import ApiToken from 'App/Models/ApiToken'
import Aplicacoes from 'App/Models/Aplicacoe'
import BankAccounts from 'App/Models/BankAccount'
import Log from 'App/Models/Log'

export default class CharactersController {
    public async index({ params, response }: HttpContextContract) {
        const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
        const findAuthorization: number = authorization.indexOf('Authorization') + 1
        const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
        const tokenBody: string = authorization[findAuthorization].split(' ')[1]
        if (tokenBody == undefined) {
            return response.status(401).json({
                status: 401,
                msg: 'Sem permissão ou token está inválido.',
            })
        }
        const user: Accounts | null = await Accounts.findBy('id', params.id)
        if (user) {
            const aplicacoes = await Aplicacoes.query().where('user_id', params.id)
            const charactersConnect = await Character.findMany([user.character0, user.character1, user.character2])
            const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
              return data ? data.token : false
            })
            const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false

            if (validHeader && tokenOK) {
                return response.status(200).json({
                    'status': 200,
                    'personagensLista': [user.character0, user.character1, user.character2],
                    'personagens': charactersConnect,
                    'aplicacoes': aplicacoes.length,
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
                    msg: 'Não autorizado, token invalido ou expirado.',
                })
            }
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        const body = request.body()
        const noCodeRegex = /^[^<>]+$/;

        if (!noCodeRegex.test(body.skin)) {
          return response.status(200).json({
            status: 401,
            msg: 'Oi Palhaço'
          })
        }

        const personagem: Character | null = await Character.findBy('id', params.id)
        if (personagem) {
            const user: Accounts | null = await Accounts.findBy('id', body.id)
            if (user) {
                const characterCorreto = (): boolean => {
                  return user ? [user.character0, user.character1, user.character2].filter(f => f == params.id).length > 0 : false
                }

                if (characterCorreto()) {
                    const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
                    const findAuthorization: number = authorization.indexOf('Authorization') + 1
                    const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
                    const tokenBody: string = authorization[findAuthorization].split(' ')[1]
                    const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
                      return data ? data.token : false
                    })
                    const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false

                    if (validHeader && tokenOK) {
                        if (body.skin !== personagem.skin)
                            await Character.updateOrCreate({
                                'id': params.id,
                            }, {
                                'skin': body.skin,
                            })
                        return response.status(201).json({
                            status: 201,
                            msg: 'Skin alterada com sucesso.',
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
                            msg: 'Não autorizado, token invalido ou expirado.',
                        })
                    }
                } else {
                    return response.status(401).json({
                        status: 401,
                        msg: 'Personagem não pertence ao Usuário.',
                    })
                }
            } else {
                return response.status(401).json({
                    status: 401,
                    msg: 'ID da conta inválido.',
                })
            }
        } else {
            return response.status(401).json({
                status: 401,
                msg: 'ID Inválido.',
            })
        }
    }

    public async showAll({response} : HttpContextContract) {
      const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      if (tokenBody == undefined) {
        return response.status(401).json({
          status: 401,
          msg: 'Sem permissão ou token está inválido.'
        })
      }
      const userID: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
          return data ? data.userId : false
      })

      const tokenOK: boolean = await Accounts.findBy('id', userID).then(res => {
        return !res ? false : res.admin > 1
      })
      if (validHeader && tokenOK) {
        const personagens: Character[] = await Character.all()
        const bankAccount: BankAccounts[] = await BankAccounts.all()
        return response.status(200).json({
          status: 200,
          personagens,
          bankAccount
        })
      }
      return response.status(401).json({
          status: 401,
          msg: 'Sem permissão ou token está inválido.',
      })
    }

    public async updateAdmin({params, request, response}: HttpContextContract){
      const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      if (tokenBody == undefined) {
        return response.status(401).json({
          status: 401,
          msg: 'Sem permissão ou token está inválido.'
        })
      }
      const userID: number | null = await ApiToken.findBy('token', tokenBody).then(data => {
          return data ? data.userId : null
      })
      if (!userID) {
        return response.status(401).json({
          status: 401,
          msg: 'Usuário admin não encontrado'
        })
      }

      const tokenOK: boolean = await Accounts.findBy('id', userID).then(res => {
        return !res ? false : res.admin > 1
      })
      if (validHeader && tokenOK) {
        const user: Character | null = await Character.findBy('id', params.id);
        if (!user) {
          return response.status(404).json({
            status: 404,
            msg: 'ID inexistente'
          })
        }
        const conta = await Accounts.all()
        const idConta = conta.filter(filtro => filtro.character0 === user.id || filtro.character1 === user.id || filtro.character2 === user.id)[0].id
        const bankAccount = await BankAccounts.findBy('owner', user.name)

        const userName: string = user.name
        const userNascimento: string = user.birthday
        const userGenero: number = user.sex

        const body = request.body()
        const bodyName = body.name
        const bodyNascimento = body.nascimento
        const bodyGenero = body.genero
        const bodyLevel = body.level
        const bodyMoney = body.money
        const bodyBankAccount = body.bankAccount

        try {
          await Character.updateOrCreate({
            'id': params.id
          }, {
            name: userName === bodyName ? userName : bodyName.split('_').length === 2 ? bodyName : userName,
            birthday: userNascimento === bodyNascimento ? userNascimento : bodyNascimento.split('/').length === 3 ? bodyNascimento : userNascimento,
            sex: userGenero === bodyGenero ? userGenero : bodyGenero == 1 || bodyGenero == 2 ? bodyGenero : userGenero,
            level: bodyLevel,
            money: bodyMoney,
          })
          await Log.create({
            idAdmin: userID,
            idUser: idConta,
            section: 'Atualizar personagem',
            alterado: JSON.stringify({
              "antigo": {
                name: user.name,
                birthday: user.birthday,
                sex: user.sex,
                level: user.level,
                money: user.money,
                bankAccount: bankAccount && bodyBankAccount ? bankAccount.balance : 'Sem conta no banco'
              },
              "novo": {
                name: userName === bodyName ? userName : bodyName.split('_').length === 2 ? bodyName : userName,
                birthday: userNascimento === bodyNascimento ? userNascimento : bodyNascimento.split('/').length === 3 ? bodyNascimento : userNascimento,
                sex: userGenero === bodyGenero ? userGenero : bodyGenero == 1 || bodyGenero == 2 ? bodyGenero : userGenero,
                level: bodyLevel,
                money: bodyMoney,
                bankAccount: bankAccount && bodyBankAccount ? bodyBankAccount : 'Sem conta no banco'
              }
            })
          })

          if(bankAccount !== null && bodyBankAccount !== null) {
            try {
              await BankAccounts.updateOrCreate({
                'owner': user.name
              }, {
                owner: bodyName,
                balance: bodyBankAccount
              })
            } catch (e) {
              response.status(502).json({
                status: 502,
                msg: 'Erro ao atualizar conta Bancária',
                erro: e
              })
            }
          }
          response.status(200).json({
            status: 200,
            msg: 'Atualizado com sucesso.'
          })
        } catch (e) {
            response.status(502).json({
              status: 502,
              msg: 'Erro ao atualizar Personagem',
              erro: e
            })
        }
      }
    }
}
