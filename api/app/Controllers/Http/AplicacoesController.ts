// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {HttpContextContract} from "@ioc:Adonis/Core/HttpContext";
import Accounts from "App/Models/Accounts";
import Character from "App/Models/Character";
import ApiToken from "App/Models/ApiToken";
import Aplicacoes from "App/Models/Aplicacoe";
import Database from "@ioc:Adonis/Lucid/Database";

export default class AplicacoesController {
  public async register ({params, request, response}: HttpContextContract) {
    const body = request.body()
    const nome: string = body.nome
    const sobrenome: string = body.sobrenome
    const nascimento: string = body.nascimento
    const origem: string = body.origem
    const sexo: number = body.sexo
    const historia: string = body.historia
    // const {nome, sobrenome, nascimento, origem, sexo, historia} = request.only(['nome', 'sobrenome', 'nascimento', 'origem', 'sexo', 'historia'])
    const user : Accounts | null = await Accounts.findBy('id', params.id)
    const nomePersonagem: string | boolean = await Character.findBy('name', nome+`_`+sobrenome).then(res => {
      if(!res) {
        return nome+`_`+sobrenome
      } else {
        return false
      }
    })

    if(!user) {
      return response.status(403).json({
        status: 403,
        msg: 'Usuário não encontrado'
      })
    }
    if(historia.length > 3000) {
      return response.status(403).json({
        status: 403,
        msg: 'Conteúdo historia muito grande. (Limite 3000 caracteres.)'
      })
    }
    if(!nomePersonagem) {
      return response.status(403).json({
        status: 403,
        msg: 'Nome Personagem já existente.'
      })
    }

    try {
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

      if(!validHeader || !tokenOK) {
        return response.status(401).json({
          status: 401,
          msg: 'Token Inválido'
        })
      }

      const aplicacaoExistente: Aplicacoes | null = await Database.from('aplicacoes').where('nome', nome).where('sobrenome', sobrenome).first()
      if(!aplicacaoExistente) {
        try {
          await Aplicacoes.create({
            "user_id": user.id,
            "nome": nome,
            "sobrenome": sobrenome,
            "nascimento": nascimento,
            "origem": origem,
            "sexo": sexo,
            "historia": historia
          })
          return response.status(201).json({
            status: 201,
            msg: 'Aplicação enviada, aguarde aprovação.'
          })
        } catch (error) {
          return response.status(500).json({
            status: 500,
            msg: 'Erro ao criar aplicação no banco de dados.',
            erro: error
          })
        }
      }
      if(aplicacaoExistente.user_id == params.id) {
        await Aplicacoes.updateOrCreate({
          "id": aplicacaoExistente.id
        },{
          "nome": nome,
          "sobrenome": sobrenome,
          "nascimento": nascimento,
          "origem": origem,
          "sexo": sexo,
          "historia": historia,
          "status": -1, // -1 = Não visto, 0 = Negado, 1 = Aprovado
        })
        return response.status(201).json({
          status: 201,
          msg: 'Aplicação enviada, aguarde aprovação.'
        })
      }
      if(aplicacaoExistente.user_id != params.id) {
        return response.status(403).json({
          status: 403,
          msg: 'Já existe uma aplicação com o mesmo nome e sobrenome.'
        })
      }

    } catch (error) {
      return response.status(500).json({
        status: 500,
        msg: 'Erro Interno foi aqui.',
        erro: error
      })
    }
  }

  public async show(response: HttpContextContract) {
    const authorization: string[] = response.response.header("Authorization", 'Bearer').request.rawHeaders
    const findAuthorization: number = authorization.indexOf('Authorization') + 1
    const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
    const tokenBody: string = authorization[findAuthorization].split(' ')[1]
    const user: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
      if (data) {
        return data.userId
      } else {
        return false
      }
    })
    const tokenOK: boolean = await Accounts.findBy('id', user).then(res => {
      if (!res) {
        return false
      }
      return res.admin === 1;
    })

    if (validHeader && tokenOK) {
      const aplicacoes = await Database.from('aplicacoes').where('status', -1)
      return response.response.status(200).json({
        status: 200,
        aplicacoes
      })
    }
    return response.response.status(401).json({
      status: 401,
      msg: 'Sem permissão ou token está inválido.'
    })
  }

  public async update({params, request, response}: HttpContextContract) {
    const {idAdm, status, resposta} = request.only(['idAdm', 'status', 'resposta'])
    const aplicacao: Aplicacoes | null = await Aplicacoes.findBy('id', params.id)
    const userAdm: Accounts | null = await Accounts.findBy('id', idAdm).then(res => {
      if(!res) {
        return null
      }
      if (res.admin !== 1) {
        return null
      }
      return res
    })
    if(!aplicacao) {
      return response.status(404).json({
        status: 404,
        msg: 'Aplicacação não encontrada.'
      })
    }
    if (aplicacao.status === 1 || aplicacao.status === 0) {
      return response.status(400).json({
        status: 400,
        msg: 'Aplicação ja foi avaliada, atualize a página, caso persista esse erro contacte o desenvolvedor.'
      })
    }
    if (!userAdm) {
      return response.status(403).json({
        status: 403,
        msg: 'Usuário administrador não encontrado'
      })
    }
    try {
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      const tokenDB: string | boolean = await ApiToken.findBy('user_id', userAdm.id).then(data => {
        if (data) {
          return data.token
        } else {
          return false
        }
      })
      const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false
      const jaAprovado: Character | null = await Character.findBy('name', aplicacao.nome+`_`+aplicacao.sobrenome)
      const solicitante: Accounts | null = await Accounts.findBy('id', aplicacao.user_id)
      if (!solicitante) {
        return response.status(404).json({
          status: 404,
          msg: 'Dono da aplicação não encontrado no banco de dados, renicie a página ou contacte o desenvolvedor.'
        })
      }
      const userPersonagens = [solicitante.character0, solicitante.character1, solicitante.character2]

      // Valida se o Token do administrador é válido e se ele realmente é um administrador
      if(!validHeader || !tokenOK) {
        return response.status(401).json({
          status: 401,
          msg: 'Token Inválido'
        })
      }

       /*
         Válida se o personagem já existe na tabela characters, caso exista irá verificar primeiro se ele faz está vinculado a
         conta do usuário que o aplicou; Caso não encontre o usuário que em teoria aplicou irá retorna um erro, caso encontre o usuário
         que teoricamente aplicou, irá verificar qual slot o mesmo faz parte, se não fizer parte de nenhum slot, então o mesmo faz parte
         de outro slot.
       */
      if (jaAprovado !== null) {
        if (userPersonagens.filter(filtro => filtro === jaAprovado.id).length > 0) {
          await Aplicacoes.updateOrCreate({
            "id": params.id
          }, {
            "status": 1
          })
          return response.status(200).json({
            status: 200,
            msg: 'Personagem já está cadastrado para este usuário'
          })
        } else {
          await Aplicacoes.updateOrCreate({
            "id": params.id
          }, {
            "status": 1
          })
          return response.status(500).json({
            status: 500,
            msg: 'Personagem já está cadastrado para outro usuário, contacte o desenvolvedor.'
          })
        }
      }

      switch (status) {
        case 1:
          try {
            await Aplicacoes.updateOrCreate({
              "id": params.id
            }, {
              "status": status
            })
            await Character.create({
              name: aplicacao.nome+`_`+aplicacao.sobrenome,
              admin: 0,
              money: 750,
              skin: 67,
              payday: 3600,
              level: 1,
              xp: 0,
              job: 0,
              sex: aplicacao.sexo,
              birthday: aplicacao.nascimento,
              posx: 0,
              posy: 0,
              posz: 0,
              posa: 0,
              interior: 0,
              interiorvw: 0,
              house: -1,
              business: -1,
              entrance: -1,
              blocked: 0,
              hunger: 100,
              thirst: 100,
              rg: '',
              cpf: '',
              cnh: '',
              spawn: 0,
              noobchat: 1,
              fight: 4,
              faction: 0,
              office: 0,
              phone: -1,
              chip_1: 0,
              chip_2: 0,
              health: 100.0,
              armour: 0.0
            })
            const novoPersonagem: Character | null = await Character.findBy('name', aplicacao.nome+`_`+aplicacao.sobrenome)
            if (!novoPersonagem) {
              return response.status(404).json({
                status: 404,
                msg: 'Novo Personagem não encontrado.'
              })
            }
            try {
              const posC: number | string = userPersonagens.findIndex(find => find === -1)
              if (posC !== -1 && posC < 3) {
                const dynamicKey = `character${posC}` as keyof typeof userPersonagens; // Define a chave dinâmica
                await Accounts.updateOrCreate({'id': solicitante.id}, { [dynamicKey]: novoPersonagem.id })
                return response.status(201).json({
                  status: 201,
                  msg: 'Personagem criado com sucesso.'
                })
              }
              await novoPersonagem.delete()
              return response.status(403).json({
                status: 403,
                msg: 'Conta já tem 3 personagens.'
              })
            }
            catch (error) {
              await novoPersonagem.delete()
              return response.status(500).json({
                status: 500,
                msg: 'Erro Interno',
                erro: error
              })
            }
          } catch (error) {
            return response.status(500).json({
              status: 500,
              msg: 'Erro interno ao criar personagem.',
              erro: error
            })
          }
        case 0:
          try {
            await Aplicacoes.updateOrCreate({
              "id": params.id
            }, {
              "status": status
            })
            await Aplicacoes.updateOrCreate({
              "id": params.id
            }, {
              "mensagem": resposta
            })
            return response.status(201).json({
              status: 201,
              msg: 'Aplicação negada, e a mensagem foi enviada ao usuário.'
            })
          } catch (error) {
            return response.status(500).json({
              status: 500,
              msg: 'Erro Interno.',
              erro: error
            })
          }
        default:
          return response.status(400).json({
            status: 400,
            msg: 'status só pode ser 0 ou 1, sendo 0 = reprovado e 1 = aprovado.'
          })
      }
    } catch (error) {
      return response.status(500).json({
        status: 500,
        msg: 'Erro Interno.',
        erro: error
      })
    }

  }
}
