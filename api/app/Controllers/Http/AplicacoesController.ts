// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from 'App/Models/Accounts'
import Character from 'App/Models/Character'
import ApiToken from 'App/Models/ApiToken'
import Aplicacoes from 'App/Models/Aplicacoe'
import Database from '@ioc:Adonis/Lucid/Database'
import EmailService from 'App/Service/EmailService'
import Log from 'App/Models/Log'

export default class AplicacoesController {
  public async register({ params, request, response }: HttpContextContract) {
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
    const body = request.body()
    const idEdita: number = body.idEdita
    const nome: string = body.nome
    const sobrenome: string = body.sobrenome
    const nascimento: string = body.nascimento
    const origem: string = body.origem
    const sexo: number = body.sexo
    const historia: string = body.historia
    const noCodeRegex = /^[^<>]+$/;
    // const {nome, sobrenome, nascimento, origem, sexo, historia} = request.only(['nome', 'sobrenome', 'nascimento', 'origem', 'sexo', 'historia'])
    const user: Accounts | null = await Accounts.findBy('id', params.id)
    if (!user) {
      return response.status(403).json({
        status: 403,
        msg: 'Usuário não encontrado',
      })
    }
    const aplicacoes = await Aplicacoes.query().where('user_id', user.id)
    const nomePersonagem: string | boolean = await Character.findBy('name', nome + `_` + sobrenome).then(res => {
      if (!res) {
        return nome + `_` + sobrenome
      } else {
        if (res.id === user.character0 || res.id === user.character1 || res.id === user.character2) {
          return nome + `_` + sobrenome
        }
        return false
      }
    })
    if (!noCodeRegex.test(historia) || !noCodeRegex.test(nome) || !noCodeRegex.test(sobrenome) || !noCodeRegex.test(nascimento) || !noCodeRegex.test(origem)) {
      return response.status(200).json({
        status: 406,
        msg: 'Sem tags nos inputs',
      })
    }

    if (historia.length > 3000) {
      return response.status(200).json({
        status: 403,
        msg: 'Conteúdo historia muito grande. (Limite 3000 caracteres.)',
      })
    }
    if (!nomePersonagem) {
      return response.status(200).json({
        status: 403,
        msg: 'Nome Personagem já existente.',
      })
    }
    if (aplicacoes.filter(filtro => filtro.status !== 0).length >= 3) {
      return response.status(200).json({
        status: 403,
        msg: 'Você já possui 3 aplicações de personagens, verifique se possui alguma aplicação que já foi aceita, negada ou que não foi visualizada.',
      })
    }

    try {
      const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
        if (data) {
          return data.token
        } else {
          return false
        }
      })
      const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false

      if (!validHeader || !tokenOK) {
        return response.status(200).json({
          status: 401,
          msg: 'Token Inválido',
        })
      }
      if (idEdita !== undefined) {
        const aplicacaoEdita: Aplicacoes | null = await Database.from('aplicacoes').where('id', idEdita).first()
        if (aplicacaoEdita !== null) {
          try {
            await Aplicacoes.updateOrCreate({
              'id': idEdita,
            }, {
              'status': -1,
              'nome': nome,
              'sobrenome': sobrenome,
              'nascimento': nascimento,
              'origem': origem,
              'sexo': sexo,
              'historia': historia,
            })
            return response.status(201).json({
              status: 201,
              msg: 'Aplicação enviada, aguarde aprovação, caso tenha cadastrado e-mail, será notificado por lá.',
            })
          } catch (error) {
            return response.status(200).json({
              status: 500,
              msg: 'Erro ao criar aplicação no banco de dados.',
              erro: error,
            })
          }
        }
      }

      const aplicacaoExistente: Aplicacoes | null = await Database.from('aplicacoes').where('nome', nome).where('sobrenome', sobrenome).first()
      if (!aplicacaoExistente) {
        try {
          await Aplicacoes.create({
            'user_id': user.id,
            'nome': nome,
            'sobrenome': sobrenome,
            'nascimento': nascimento,
            'origem': origem,
            'sexo': sexo,
            'historia': historia,
          })
          return response.status(201).json({
            status: 201,
            msg: 'Aplicação enviada, aguarde aprovação.',
          })
        } catch (error) {
          return response.status(200).json({
            status: 500,
            msg: 'Erro ao criar aplicação no banco de dados.',
            erro: error,
          })
        }
      }
      if (aplicacaoExistente.user_id == params.id) {
        await Aplicacoes.updateOrCreate({
          'id': aplicacaoExistente.id,
        }, {
          'nome': nome,
          'sobrenome': sobrenome,
          'nascimento': nascimento,
          'origem': origem,
          'sexo': sexo,
          'historia': historia,
          'status': -1, // -1 = Não visto, 0 = Negado, 1 = Aprovado
        })
        return response.status(201).json({
          status: 201,
          msg: 'Aplicação enviada, aguarde aprovação.',
        })
      }
      if (aplicacaoExistente.user_id != params.id) {
        return response.status(200).json({
          status: 403,
          msg: 'Já existe uma aplicação com o mesmo nome e sobrenome.',
        })
      }

    } catch (error) {
      return response.status(200).json({
        status: 500,
        msg: 'Erro ao criar aplicação no banco de dados.',
        erro: error,
      })
    }
  }

  public async showAll(response: HttpContextContract) {
    const authorization: string[] = response.response.header('Authorization', 'Bearer').request.rawHeaders
    const findAuthorization: number = authorization.indexOf('Authorization') + 1
    const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
    const tokenBody: string = authorization[findAuthorization].split(' ')[1]
    if (tokenBody == undefined) {
      return response.response.status(401).json({
        status: 401,
        msg: 'Sem permissão ou token está inválido.',
      })
    }
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
      return res.admin >= 1
    })

    if (validHeader && tokenOK) {
      const aplicacoes = await Database.from('aplicacoes')
      return response.response.status(200).json({
        status: 200,
        aplicacoes,
      })
    }
    return response.response.status(401).json({
      status: 401,
      msg: 'Sem permissão ou token está inválido.',
    })
  }

  public async showUser({ params, response }: HttpContextContract) {
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
    if (!user) {
      return response.status(404).json({
        status: 404,
        msg: 'Usuario inexistente.',
      })
    }
    const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
      if (data) {
        return data.token
      } else {
        return false
      }
    })
    const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false
    if (validHeader && tokenOK) {
      const aplicacao = await Aplicacoes.query().where('user_id', params.id)
      return response.status(200).json({
        status: 200,
        aplicacoes: aplicacao,
      })
    }
    return response.status(200).json({
      status: 404,
      msg: 'Token Inválido ou expirado.',
    })
  }

  public async show({ params, response }: HttpContextContract) {
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
    const aplicacao: Aplicacoes | null = await Aplicacoes.findBy('id', params.id)
    if (aplicacao !== null) {
      const user: Accounts | null = await Accounts.findBy('id', aplicacao.user_id)
      if (user !== null) {
        const tokenDB: string | boolean = await ApiToken.findBy('user_id', user.id).then(data => {
          if (data) {
            return data.token
          } else {
            return false
          }
        })
        const tokenOK: boolean = tokenDB ? tokenBody === tokenDB : false
        if (validHeader && tokenOK) {
          return response.status(200).json({
            status: 200,
            aplicacao,
          })
        } else {
          return response.status(200).json({
            status: 404,
            msg: 'Token inválido ou expirado.',
          })
        }

      } else {
        return response.status(404).json({
          status: 404,
          msg: 'Usuário não encontrado.',
        })
      }

    } else {
      return response.status(200).json({
        status: 400,
        msg: 'Não possui aplicações..',
      })
    }

  }

  public async update({ params, request, response }: HttpContextContract) {
    const { idAdm, status, resposta } = request.only(['idAdm', 'status', 'resposta'])
    const aplicacao: Aplicacoes | null = await Aplicacoes.findBy('id', params.id)
    const userAdm: Accounts | null = await Accounts.findBy('id', idAdm).then(res => {
      if (!res) {
        return null
      }
      if (res.admin < 1) {
        return null
      }
      return res
    })
    if (!aplicacao) {
      return response.status(200).json({
        status: 404,
        msg: 'Aplicacação não encontrada.',
      })
    }
    if (aplicacao.status === 1 || aplicacao.status === 0) {
      return response.status(200).json({
        status: 400,
        msg: 'Aplicação ja foi avaliada, atualize a página, caso persista esse erro contacte o desenvolvedor.',
      })
    }
    if (!userAdm) {
      return response.status(200).json({
        status: 403,
        msg: 'Usuário administrador não encontrado',
      })
    }
    try {
      const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
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
      const jaAprovado: Character | null = await Character.findBy('name', aplicacao.nome + `_` + aplicacao.sobrenome)
      const solicitante: Accounts | null = await Accounts.findBy('id', aplicacao.user_id)
      if (!solicitante) {
        return response.status(20).json({
          status: 404,
          msg: 'Dono da aplicação não encontrado no banco de dados, renicie a página ou contacte o desenvolvedor.',
        })
      }
      const userPersonagens = [solicitante.character0, solicitante.character1, solicitante.character2]

      // Valida se o Token do administrador é válido e se ele realmente é um administrador
      if (!validHeader || !tokenOK) {
        return response.status(200).json({
          status: 401,
          msg: 'Token Inválido',
        })
      }

      /*
        Válida se o personagem já existe na tabela characters, caso exista irá verificar primeiro se ele faz está vinculado a
        conta do usuário que o aplicou; Caso não encontre o usuário que em teoria aplicou irá retorna um erro, caso encontre o usuário
        que teoricamente aplicou, irá verificar qual slot o mesmo faz parte, se não fizer parte de nenhum slot, então o mesmo faz parte
        de outro slot.
      */
      if (jaAprovado !== null && aplicacao.status === 1) {
        if (userPersonagens.filter(filtro => filtro === jaAprovado.id).length > 0) {
          return response.status(200).json({
            status: 200,
            msg: 'Personagem já está cadastrado para este usuário',
          })
        } else {
          return response.status(200).json({
            status: 500,
            msg: 'Personagem já está cadastrado para outro usuário, contacte o desenvolvedor.',
          })
        }
      }
      const noCodeRegex = /^[^<>]+$/;
      if (!noCodeRegex.test(resposta)) {
        return response.status(200).json({
          status: 406,
          msg: 'Oi Palhaço'
        })
      }

      switch (status) {
        case 1:
          try {
            const rgRandom: string | null = await this.generatergcpf('rg')
            const cpfRandom: string | null = await this.generatergcpf('cpf')

            if (rgRandom === null || cpfRandom === null) {
              return response.status(200).json({
                status: 404,
                msg: 'Ocorreu um erro ao gerar RG/CPF. Caso o erro persista, contacte um desenvolvedor.',
              })
            }
            await Aplicacoes.updateOrCreate({
              'id': params.id,
            }, {
              'status': status,
              'mensagem': resposta,
            })
            await Log.create({
              idAdmin: idAdm,
              idUser: solicitante.id,
              section: 'Aplicação de personagem',
              alterado: JSON.stringify({
                message: resposta,
                aprovado: status === 1 ? 'Aprovado' : 'Reprovado',
              }),
            })
            if (jaAprovado) {
              // @ts-ignore
              if(solicitante.email !== '' || solicitante.email !== 'Undefined') {
                try {
                const html = `
                  <html lang='pt-BR'>
                  <head>
                    <title>Paradise Roleplay - Parabéns você foi aprovado</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                      }

                      .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
                      }

                      h1 {
                        color: #ff6600;
                      }

                      h3 {
                        color: #333;
                      }

                      p {
                        color: #333;
                        font-size: 16px;
                      }

                      .attention-banner {
                        background-color: #ffcc00; /* Cor de fundo mais suave */
                        color: #333; /* Cor do texto mais escura */
                        padding: 10px;
                        text-align: center;
                        font-weight: bold;
                        border-radius: 5px; /* Borda arredondada */
                      }

                      a {
                        color: #ff6600;
                        text-decoration: none;
                        font-weight: bold;
                      }
                    </style>
                  </head>
                  <body>
                    <div class='container'>
                      <h1>Parabéns você foi aprovado, ${solicitante.name}!</h1>
                      <h3>Agora você pode jogar no Paradise Roleplay com seu personagem ${jaAprovado.name}!</h3>
                      <p>Monte sua própria vida virtual no servidor, para entrar aqui está o endereço do nosso servidor para você colocar no seu launcher SAMP, <span>samp.paradiseroleplay.pt:7777</span></p>
                      <div class='attention-banner'>
                        <p>Atenção: Para entrar no servidor, utilize o mesmo nick que você usa para logar em nosso Painel de Controle (${solicitante.name}). Somente dentro do servidor você poderá escolher qual personagem usar, caso tenha mais de um.</p>
                      </div>
                      <p>Para se juntar à nossa comunidade no Discord, clique <a href='https://discord.gg/MymDXAdexs'>aqui</a>, será muito bem-vindo. Lá poderá interagir diretamente com outros jogadores e participar de eventos exclusivos.</p>
                      <p>Para criar seu personagem, por favor, preencha a aplicação de criação de personagens clicando <a href='https://ucp.paradiseroleplay.pt/personagem-criar.html'>aqui</a>.</p>
                      <p>Caso queira acessar nosso fórum, poderá clicar <a href='https://paradiseroleplay.forumeiros.com/'>aqui</a> mesmo.</p>
                    </div>
                  </body>
                  </html>
                  `;
                  await EmailService.sendMail(
                    solicitante.email,
                    'Paradise Roleplay - Parabéns você foi aprovado',
                    html,
                  )
                  } catch (e) {
                  return response.status(500).json({
                    status: 500,
                    msg: 'Erro ao enviar email',
                    erro: e,
                  })
                }
              }
              //Log
              return response.status(200).json({
                status: 201,
                msg: 'Personagem criado antes da UCP aprovado na whitelist.',
              })
            }
            try {
              await Character.create({
                name: aplicacao.nome + `_` + aplicacao.sobrenome,
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
                rg: rgRandom,
                cpf: cpfRandom,
                cnh: '',
                spawn: 0,
                noobchat: 1,
                sayanim: 1,
                fight: 4,
                faction: 0,
                office: 0,
                phone: -1,
                chip_1: 0,
                chip_2: 0,
                health: 100.0,
                armour: 0.0,
                life_state: 0,
              })
            } catch (e) {
              return response.status(200).json({
                status: 404,
                msg: 'Erro ao criar personagem.',
                erro: e,
              })
            }
            const novoPersonagem: Character | null = await Character.findBy('name', aplicacao.nome + `_` + aplicacao.sobrenome)
            if (!novoPersonagem) {
              return response.status(200).json({
                status: 404,
                msg: 'Novo Personagem não encontrado.',
              })
            }
            // @ts-ignore
            if (solicitante.email !== '' || solicitante.email !== 'Undefined') {
              try {
                const posC: number | string = userPersonagens.findIndex(find => find === -1)
                if (posC !== -1 && posC < 3) {
                  const dynamicKey = `character${posC}` as keyof typeof userPersonagens // Define a chave dinâmica
                  await Accounts.updateOrCreate({ 'id': solicitante.id }, { [dynamicKey]: novoPersonagem.id })
                  try {
                    const html = `
<html lang='pt-BR'>
<head>
  <title>Paradise Roleplay - Parabéns você foi aprovado</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2f2f2;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
    }

    h1 {
      color: #ff6600;
    }

    h3 {
      color: #333;
    }

    p {
      color: #333;
      font-size: 16px;
    }

    .attention-banner {
      background-color: #ffcc00; /* Cor de fundo mais suave */
      color: #333; /* Cor do texto mais escura */
      padding: 10px;
      text-align: center;
      font-weight: bold;
      border-radius: 5px; /* Borda arredondada */
    }

    a {
      color: #ff6600;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class='container'>
    <h1>Parabéns você foi aprovado, ${solicitante.name}!</h1>
    <h3>Agora você pode jogar no Paradise Roleplay com seu personagem ${novoPersonagem.name}!</h3>
    <p>Monte sua própria vida virtual no servidor, para entrar aqui está o endereço do nosso servidor para você colocar no seu launcher SAMP, <span>samp.paradiseroleplay.pt:7777</span></p>
    <div class='attention-banner'>
      <p>Atenção: Para entrar no servidor, utilize o mesmo nick que você usa para logar em nosso Painel de Controle (${solicitante.name}). Somente dentro do servidor você poderá escolher qual personagem usar, caso tenha mais de um.</p>
    </div>
    <p>Para se juntar à nossa comunidade no Discord, clique <a href='https://discord.gg/MymDXAdexs'>aqui</a>, será muito bem-vindo. Lá poderá interagir diretamente com outros jogadores e participar de eventos exclusivos.</p>
    <p>Para criar seu personagem, por favor, preencha a aplicação de criação de personagens clicando <a href='https://ucp.paradiseroleplay.pt/personagem-criar.html'>aqui</a>.</p>
    <p>Caso queira acessar nosso fórum, poderá clicar <a href='https://paradiseroleplay.forumeiros.com/'>aqui</a> mesmo.</p>
  </div>
</body>
</html>
`
                    await EmailService.sendMail(
                      solicitante.email,
                      'Paradise Roleplay - Parabéns você foi aprovado',
                      html,
                    )
                  } catch (e) {
                    return response.status(500).json({
                      status: 500,
                      msg: 'Erro ao enviar email',
                      erro: e,
                    })
                  }
                  return response.status(201).json({
                    status: 201,
                    msg: 'Personagem criado com sucesso.',
                  })
                }
                await novoPersonagem.delete()
                return response.status(200).json({
                  status: 403,
                  msg: 'Conta já tem 3 personagens.',
                })
              } catch (error) {
                await novoPersonagem.delete()
                return response.status(200).json({
                  status: 500,
                  msg: 'Erro Interno',
                  erro: error,
                })
              }
            }

          } catch (error) {
            return response.status(200).json({
              status: 500,
              msg: 'Erro interno ao criar personagem.',
              erro: error,
            })
          }
        case 0:
          try {
            await Aplicacoes.updateOrCreate({
              'id': params.id,
            }, {
              'status': status,
              'mensagem': resposta,
            })
            await Log.create({
              idAdmin: idAdm,
              idUser: solicitante.id,
              section: 'Aplicação de personagem',
              alterado: JSON.stringify({
                message: resposta,
                aprovado: status === 1 ? 'Sim' : 'Não'
              })
            })
            // @ts-ignore
            if(solicitante.email !== '' || solicitante.email !== 'Undefined') {
                try {
                const html = `
                  <html lang='pt-BR'>
                  <head>
                    <title>Paradise Roleplay - Recusado na UCP</title>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        margin: 0;
                        padding: 0;
                      }

                      .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
                      }

                      h1 {
                        color: #ff6600;
                      }

                      h3 {
                        color: #333;
                      }

                      p {
                        color: #333;
                        font-size: 16px;
                      }

                      .attention-banner {
                        background-color: #ffcc00; /* Cor de fundo mais suave */
                        color: #333; /* Cor do texto mais escura */
                        padding: 10px;
                        text-align: center;
                        font-weight: bold;
                        border-radius: 5px; /* Borda arredondada */
                      }

                      a {
                        color: #ff6600;
                        text-decoration: none;
                        font-weight: bold;
                      }
                    </style>
                  </head>
                  <body>
                    <div class='container'>
                      <h1>Oh não,</h1>
                      <h3>${solicitante.name} parece sua aplicação foi recusada por um de nossos administradores</h3>
                      <p>Sua aplicação foi recusada pelo seguinte motivo:</p>
                      <p>${aplicacao.mensagem}</p><br>
                      <p style='font-weight: bold'>Mas não desanime, você pode tentar mais uma vez, vá ao nosso <a href='https://ucp.paradiseroleplay.pt/'>painel</a> veja qual foi a mensagem que nosso administrador deixou a você e corrija o quanto antes.!</p>
                      <p>Para se juntar à nossa comunidade no Discord, clique <a href='https://discord.gg/MymDXAdexs'>aqui</a>, será muito bem-vindo. Lá poderá interagir diretamente com outros jogadores e participar de eventos exclusivos.</p>
                      <p>Para criar seu personagem, por favor, preencha a aplicação de criação de personagens clicando <a href='https://ucp.paradiseroleplay.pt/personagem-criar.html'>aqui</a>.</p>
                      <p>Caso queira acessar nosso fórum, poderá clicar <a href='https://paradiseroleplay.forumeiros.com/'>aqui</a> mesmo.</p>
                    </div>
                  </body>
                  </html>
                  `;
                  await EmailService.sendMail(
                    solicitante.email,
                    'Paradise Roleplay - Recusado na UCP',
                    html,
                  )
                  } catch (e) {
                  return response.status(500).json({
                    status: 500,
                    msg: 'Erro ao enviar email',
                    erro: e,
                  })
                }
              }
            return response.status(200).json({
              status: 201,
              msg: 'Aplicação negada, e a mensagem foi enviada ao usuário.',
            })
          } catch (error) {
            return response.status(200).json({
              status: 500,
              msg: 'Erro Interno.',
              erro: error,
            })
          }
        default:
          return response.status(200).json({
            status: 400,
            msg: 'status só pode ser 0 ou 1, sendo 0 = reprovado e 1 = aprovado.',
          })
      }
    } catch (error) {
      return response.status(200).json({
        status: 500,
        msg: 'Erro Interno.',
        erro: error,
      })
    }
  }

  private gerarNumerosAleatoriosString(max: number): string {
    try {
      let numerosAleatorios = ''
      for (let i = 0; i < max; i++) {
        const numeroInteiroAleatorio = Math.floor(Math.random() * 10)
        numerosAleatorios += numeroInteiroAleatorio.toString()
      }
      return numerosAleatorios
    } catch (error) {
      console.error('Ocorreu um erro ao gerar números aleatórios:', error)
      return ''
    }
  }

  private async generatergcpf(rgcpf: string): Promise<string | null> {
    try {
      switch (rgcpf) {
        case 'rg':
          let newRG: string = this.gerarNumerosAleatoriosString(9)
          let checkRG: Character | null = await Character.findBy('rg', newRG)
          while (checkRG !== null) {
            newRG = this.gerarNumerosAleatoriosString(9)
            checkRG = await Character.findBy('rg', newRG)
          }
          return newRG
        case 'cpf':
          let newCPF: string = this.gerarNumerosAleatoriosString(11)
          let checkCPF: Character | null = await Character.findBy('cpf', newCPF)
          while (checkCPF !== null) {
            newCPF = this.gerarNumerosAleatoriosString(11)
            checkCPF = await Character.findBy('cpf', newCPF)
          }
          return newCPF
        default:
          return null
      }
    } catch (error) {
      console.error('Ocorreu um erro ao gerar RG/CPF:', error)
      return null
    }
  }

}
