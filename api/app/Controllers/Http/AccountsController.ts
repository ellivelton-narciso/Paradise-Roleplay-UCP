import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from 'App/Models/Accounts'
import ApiToken from 'App/Models/ApiToken'
import Env from '@ioc:Adonis/Core/Env'
import ms from 'ms'
import { DateTime } from 'luxon'
import EmailService from 'App/Service/EmailService'
import Log from 'App/Models/Log'
import Recovery from 'App/Models/Recovery'
import fetch from "node-fetch";
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { v4 } from 'uuid'
import Compra from 'App/Models/Compra'
import * as console from 'console'
import Serverdata from 'App/Models/Serverdata'
import { isNumber } from '@poppinss/utils/build/src/Helpers/types'
/*import { promisify } from 'util';
import { exec } from 'child_process';*/


export default class AccountsController {
    public async login({ request, auth, response }: HttpContextContract) {
        const { name, password } = request.only(['name', 'password'])
        const ipv4 = request.ip()

        /*const executeCommand = promisify(exec);
        const retirarBL: string = `iptables -D INPUT -s ${ipv4} -j DROP`*/

    try {
      const user = await Accounts.findBy('name', name)

      if (!user) {
        return response.status(401).json({
          status: 401,
          msg: 'Usuário não encontrado.',
        })
      }

      // const qtdPersonagens = [user.character0, user.character1, user.character2].filter(k => k !== -1).length

      if (user.password !== password) {
        return response.status(401).json({
          status: 401,
          msg: 'Senha incorreta.',
        })
      }
      const tempoDefaultExpire = ms('3h')
      const existToken = await ApiToken.findBy('user_id', user.id)

            try {
              await Accounts.updateOrCreate({id: user.id}, {ip: ipv4})
            }
            catch (error) {
        console.log(error)
              return response.status(500).json({
                status: 500,
                msg: 'Erro interno.',
                erro: error.message,
              })
            }
            if (existToken) {
                const isExpired = this.isTokenExpired(existToken.expiresAt)
                if (isExpired) {
                    try {
                        await ApiToken.query().where('token', existToken.token).delete()
                        // Autenticação manual do usuário
                        await auth.login(user, { expiresIn: tempoDefaultExpire })

                        // Obtém o token gerado após a autenticação
                        const token = auth.use('api').token!

                      /*if (qtdPersonagens > 0) {
                        for (let errIP = false; !errIP;) {
                          try {
                            await executeCommand(retirarBL);
                          } catch (error) {
                            console.error(`Erro ao executar o comando: ${error.message}`);
                            errIP = true;
                          }
                        }
                      }*/

                        return response.status(200).json({
                          'status': 200,
                          'user': {
                              'userId': token.userId,
                              'name': user.name,
                              'admin': user.admin,
                              'character': [user.character0, user.character1, user.character2],
                              'tokenHash': token.tokenHash,
                              'expiresAt': token.expiresAt,
                          },
                        })
                    } catch (e) {
                        return response.status(500).json({
                            status: 500,
                            msg: 'Erro interno, contacte um administrador. Codigo: 1001',
                        })
                    }
                }
                /*if (qtdPersonagens > 0) {
                  for (let errIP = false; !errIP;) {
                    try {
                      await executeCommand(retirarBL);
                    } catch (error) {
                      console.error(`Erro ao executar o comando: ${error.message}`);
                      errIP = true;
                    }
                  }
                }*/
                return response.status(200).json({
                    'status': 200,
                    'user': {
                        'userId': existToken.userId,
                        'name': user.name,
                        'admin': user.admin,
                        'character': [user.character0, user.character1, user.character2],
                        'tokenHash': existToken.token,
                        'expiresAt': existToken.expiresAt,
                    },
                })
            }

            // Autenticação manual do usuário
            await auth.login(user, { expiresIn: tempoDefaultExpire })

            // Obtém o token gerado após a autenticação
            const token = auth.use('api').token!

            /*if (qtdPersonagens > 0) {
              for (let errIP = false; !errIP;) {
                try {
                  await executeCommand(retirarBL);
                } catch (error) {
                  console.error(`Erro ao executar o comando: ${error.message}`);
                  errIP = true;
                }
              }
            }*/

            return response.status(200).json({
                'status': 200,
                'user': {
                    'userId': token.userId,
                    'name': user.name,
                    'admin': user.admin,
                    'character': [user.character0, user.character1, user.character2],
                    'tokenHash': token.tokenHash,
                    'expiresAt': token.expiresAt,
                },
            })
        } catch (error) {
            return response.status(500).json({
                status: 500,
                msg: 'Erro interno.',
                erro: error.message,
            })
        }
    }

    public async register({ request, response }: HttpContextContract) {
        const regex = /^[A-Za-z_][A-Za-z0-9._]*$/
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]+$/g;
        // const noCodeRegex = /^[^<>]+$/;

        const body = request.body()
        const name: string = body.name
        const password: string = body.password
        const email: string = body.email ? body.email : ''
        const ip: string = body.ip ? body.ip : ''
        if (!regex.test(name)) {
            return response.status(403).json({
                status: 403,
                msg: 'Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.).',
            })
        }

        if(!emailRegex.test(body.email) && body.email !== '') {
            return response.status(200).json({
                status: 403,
                msg: 'Formato de e-mail inválido.',
            })
        }
        const accountExist = await Accounts.query().whereRaw('LOWER("name") = ?', [name.toLowerCase()]).first();
        const emailExist: Accounts | null = await Accounts.findBy('email', email)

        if (!name || !password) {
            return response.status(400).json({
                status: 400,
                msg: 'Um ou mais campos está incompleto!',
            })

        }
        if (accountExist || emailExist && email !== '') {

            return response.status(403).json({
                status: 403,
                msg: 'Este usuário ou email já está cadastrado.',
            })
        } else {

            await Accounts.create({
                'name': name,
                'password': password,
                'email': email,
                'ip': ip,
                'character0': -1,
                'character1': -1,
                'character2': -1,
                'vip': 0,
                'viptime': 0,
                'saldo': 0,
            })
            if (email !== '') {
                try {
                    const html = `
                  <html lang='pt-BR'>
                  <head>
                    <title>Paradise Roleplay - Bem-vindo</title>
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

                      p {
                        color: #333;
                        font-size: 16px;
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
                      <h1>Obrigado por se registrar, ${name}!</h1>
                      <h3>Seja bem-vindo ao Paradise Roleplay!</h3>
                      <p>Para se juntar à nossa comunidade no Discord, clique <a href='https://discord.gg/MymDXAdexs'>aqui</a>, será muito bem vindo. Lá poderá interagir diretamente com outros jogadores e participar de eventos exclusivos.</p>
                      <p>Para criar seu personagem, por favor, preencha a aplicação de criação de personagens clicando <a href='https://ucp.paradiseroleplay.pt/personagem-criar.html'>aqui</a>.</p>
                      <p>Caso queira acessar nosso fórum, poderá clicar <a href='https://paradiseroleplay.forumeiros.com/'>aqui</a> mesmo</p>
                    </div>
                  </body>
                  </html>
                `
          await EmailService.sendMail(
            email,
            'Bem-vindo ao Nosso Site',
            html,
          )
        } catch (e) {
          return response.status(201).json({
            status: 201,
            msg: 'Conta criado, porém aconteceu um erro ao enviar email.',
            erro: e,
          })
        }
      }


      return response.status(201).json({
        status: 201,
        msg: 'Conta criada com sucesso.',
      })
    }
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
    const user: Accounts | null = await Accounts.findBy('id', params.id)
    if (!user) {
      return response.status(404).json({
        status: 404,
        msg: 'ID nao encontrado.',
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

      return response.status(200).json({
        'status': 200,
        'name': user.name,
        'email': user.email,
        'ip': user.ip,
        'vip': user.vip,
        'viptime': user.viptime,
      })
    } else {
      // LEMBRAR: expirar token ao errar a senha.
      /*await ApiToken.updateOrCreate({
        "userId": user.id,
      }, {
        "expiresAt": DateTime.fromFormat("2020-07-24 04:18:01","string")
      })*/
      return response.status(200).json({
        status: 401,
        msg: 'Não autorizado, token invalido ou expirado.',
      })
    }
  }

    public async showAll({response}: HttpContextContract) {
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
            return res.admin > 0
        })

        if (validHeader && tokenOK) {
            const contas = await Accounts.all()
            return response.status(200).json({
                status: 200,
                contas,
            })
        }
        return response.status(401).json({
            status: 401,
            msg: 'Sem permissão ou token está inválido.',
        })
    }

    public async update({ params, request, response }: HttpContextContract) {
        const regex = /^[A-Za-z_][A-Za-z0-9._]*$/
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]+$/g;
        const body = request.body()
        const user: Accounts | null = await Accounts.findBy('id', params.id)

        if(body.email !== null && !emailRegex.test(body.email) && body.email !== '') {
            return response.status(200).json({
                status: 403,
                msg: 'Formato de e-mail inválido.',
            })
        }


        if (!regex.test(body.name)) {
            return response.status(200).json({
                status: 403,
                msg: 'Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.).',
            })
        }

    if (!user) {
      return response.status(200).json({
        status: 404,
        msg: 'Usuário não encontrado',
      })
    }
    const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
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

        if (validHeader && tokenOK) {
            const newName: string = body.name !== user.name ? body.name : user.name
            const newPass: string = body.password === undefined || body.password === user.password ? user.password : body.password
            // const userEMail: string = this.removeNull(user.email)
            const newEmail: string = body.email === user.email || body.email === undefined ? user.email : body.email === null ? '' : body.email
            const newNameFind = await Accounts.findBy('name', newName)
            const newNameExist = newNameFind !== null && newName !== user.name
            const newEmailFind = await Accounts.findBy('email', newEmail)
            const newEmailExiste = newEmailFind !== null && newEmail !== user.email

      if (newPass === '' || newName === '') {
        return response.status(200).json({
          status: 401,
          msg: 'Nome ou Senha não podem estar vazios.',
        })
      }
      if (newNameExist || newEmailExiste && newEmail !== '') {
        return response.status(200).json({
          status: 401,
          msg: 'Este Nome ou Email já está cadastrado.',
        })
      } else {
        await Accounts.updateOrCreate({
          'id': params.id,
        }, {
          'name': newName,
          'password': newPass,
          'email': newEmail,
        })
        return response.status(200).json({
          'status': 200,
          'name': newName,
          'password': newPass,
          'email': newEmail,
          'ip': user.ip,
          'vip': user.vip,
          'viptime': user.viptime,
          'msg': 'Atualizado com sucesso.',
        })
      }

    }
    return response.status(200).json({
      status: 404,
      msg: 'Token inválido ou expirado.',
    })
  }

    public async isAdmin({ response }: HttpContextContract) {
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
        const user: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
            if (data) {
                return data.userId
            } else {
                return false
            }
        })
        const levelAdmin = await Accounts.findBy('id', user).then(res => {
            if (!res) {
                return false
            }
            return res.admin
        })

        if (validHeader) {
          return response.status(200).json({
              status: 200,
              isAdmin: levelAdmin
          })
        }
        return response.status(404).json({
              status: 404,
              msg: 'Header Inválido'
        })




    }

    public async updateAdmin({ params, request, response }: HttpContextContract) {
        const regex = /^[A-Za-z_][A-Za-z0-9._]*$/
        const emailRegex = /^[a-z0-9._-]+@[a-z0-9._-]+\.[a-z]+$/g;
        const body = request.body()
        const user: Accounts | null = await Accounts.findBy('id', params.id)

        if (!regex.test(body.name)) {
            return response.status(403).json({
                status: 403,
                msg: 'Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.).',
            })
        }
        if(body.email !== null && !emailRegex.test(body.email) && body.email !== '') {
            return response.status(200).json({
                status: 403,
                msg: 'Formato de e-mail inválido.',
            })
        }

        if (!user) {
            return response.status(404).json({
                status: 404,
                msg: 'Usuário não encontrado',
            })
        }
        const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
        const findAuthorization: number = authorization.indexOf('Authorization') + 1
        const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
        const tokenBody: string = authorization[findAuthorization].split(' ')[1]
        const userAdmin: number | null = await ApiToken.findBy('token', tokenBody).then(data => data ? data.userId : null)

        if (!userAdmin) {
          return response.status(400).json({
            status: 400,
            msg: 'Token Inválido'
          })
        }

        const tokenOK: boolean = await Accounts.findBy('id', userAdmin).then(res => {
            if (!res) {
                return false
            }
            return res.admin === 2
        })

        if (validHeader && tokenOK) {
            const newName: string = body.name !== user.name ? body.name : user.name
            const newPass: string = body.password === undefined || body.password === user.password ? user.password : body.password
            const newEmail: string = body.email === user.email || body.email === null || body.email === undefined ? user.email : body.email
            const newNameFind = await Accounts.findBy('name', newName)
            const newNameExist = newNameFind !== null && newName !== user.name
            const newEmailFind = await Accounts.findBy('email', newEmail)
            const newEmailExiste = newEmailFind !== null && newEmail !== user.email

            if (newPass === '' || newName === '') {
                return response.status(401).json({
                    status: 401,
                    msg: 'Nome ou Senha não podem estar vazios.',
                })
            }
            if (newNameExist || newEmailExiste && newEmail !== '') {
                return response.status(401).json({
                    status: 401,
                    msg: 'Este Nome ou Email já está cadastrado.',
                })
            } else {
                await Accounts.updateOrCreate({
                    'id': params.id,
                }, {
                    'name': newName,
                    'password': newPass,
                    'email': newEmail,
                    'vip': body.vip,
                    'viptime': body.viptime,
                    'admin': user.admin !== body.admin && user.admin < 2 ? body.admin : user.admin
                })
                await Log.create({
                  idAdmin: userAdmin,
                  idUser: user.id,
                  section: 'Atualizar Usuário',
                  alterado: JSON.stringify({
                    "antigo": {
                      "name": user.name,
                      "email": user.email,
                      "vip": user.vip,
                      "viptime": user.viptime,
                      "admin": user.admin
                    },
                    "novo": {
                      'name': newName,
                      'password': body.password === undefined || body.password === user.password ? 'Senhão não alterada' : 'Senha alterada',
                      'email': newEmail,
                      'vip': body.vip,
                      'viptime': body.viptime,
                      'admin': user.admin !== body.admin && user.admin < 2 ? body.admin : user.admin,
                    }
                  })
                })
                return response.status(200).json({
                    'status': 200,
                    'msg': 'Alterado com sucesso',
                })

            }
        }
        return response.status(404).json({
            status: 401,
            msg: 'Sem permissão suficiente',
        })
    }

    public async isValid({ response }: HttpContextContract) {
        const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
        const findAuthorization: number = authorization.indexOf('Authorization') + 1
        const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
        const tokenBody: string = authorization[findAuthorization].split(' ')[1]
        if (tokenBody === undefined) {
            return response.status(200).json({
                status: 200,
                isLogged: false,
            })
        }
        try {
            const user: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => data ? data.userId : false)
            const tokenOK: boolean = !!await Accounts.findBy('id', user)
            return response.status(200).json({
                status: 200,
                isLogged: validHeader && tokenOK,
            })
        } catch (error) {
            return response.status(200).json({
                status: 200,
                isLogged: false,
            })
        }

    }

    public async recovery ({request, response}: HttpContextContract) {
      const email: string = request.body().email
      const emailRegex = /^[a-z0-9_.-]+@[a-z0-9.-]+\.[a-z]+$/i

      if(!emailRegex.test(email)) {
        return response.status(400).json({
          status: 400,
          msg: 'E-mail inválido'
        })
      }
      const user = await Accounts.findBy('email', email)

      if (!user) {
        return response.status(400).json({
          status: 400,
          msg: 'Usuário não está cadastrado'
        })
      }
      try {
        const tempoDefaultExpire = ms('1h')
        const expirationDateTime = DateTime.local().plus({ milliseconds: tempoDefaultExpire });
        const existCode = await Recovery.query().where('id_user', user.id).where('used', 0).first()

        if (existCode) {
          const isExpired: boolean = this.isTokenExpired(existCode.expiresAt)
          const isOverAttempt: boolean = existCode.attempt === 3

          if (isExpired || isOverAttempt) {
            await Recovery.query().where('code', existCode.code).delete()
            function gerarLetraAleatoria() {
              const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              const indiceAleatorio = Math.floor(Math.random() * alfabeto.length);
              return alfabeto[indiceAleatorio];
            }
            function gerarDigitoAleatorio() {
              return Math.floor(Math.random() * 10).toString();
            }
            function gerarCodigoAleatorio() {
              let codigo = '';

              for (let i = 0; i < 6; i++) {
                codigo += gerarDigitoAleatorio();
              }
              codigo += gerarLetraAleatoria();
              codigo = codigo.split('').sort(() => Math.random() - 0.5).join('');

              return codigo;
            }

            const codigoGerado = gerarCodigoAleatorio();

            await Recovery.updateOrCreate({code: codigoGerado},{
              idUser: user.id,
              code: codigoGerado,
              used: 0,
              expiresAt: tempoDefaultExpire
            })
            // Envia o E-mail
            try {
              const html = `
                <html lang='pt-BR'>
                <head>
                  <title>Paradise Roleplay - Recuperação de senhas</title>
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
                    p {
                      color: #333;
                      font-size: 16px;
                    }
                  </style>
                </head>
                <body>
                  <div class='container'>
                    <p>Use este código para recuperar sua senha: ${codigoGerado}, só é válido por uma hora.</p>
                  </div>
                </body>
                </html>
              `
              await EmailService.sendMail(
                email,
                'Recuperação de senha',
                html,
              )
              return response.status(200).json({
                status: 200,
                msg: 'Código enviado por e-mail',
                userID: user.id

              })
              } catch (e) {
              return response.status(500).json({
                  status: 500,
                  msg: 'Erro ao enviar email',
                  erro: e,
              })
            }
          } else {
            try {
              const html = `
                <html lang='pt-BR'>
                <head>
                  <title>Paradise Roleplay - Recuperação de senhas</title>
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
                    p {
                      color: #333;
                      font-size: 16px;
                    }
                  </style>
                </head>
                <body>
                  <div class='container'>
                    <p>Use este código para recuperar sua senha: ${existCode.code}, só é válido por uma hora.</p>
                  </div>
                </body>
                </html>
              `
              await EmailService.sendMail(
                email,
                'Recuperação de senha',
                html,
              )
              return response.status(200).json({
                status: 200,
                msg: 'Código enviado por e-mail',
                userID: user.id

              })
              } catch (e) {
              return response.status(500).json({
                  status: 500,
                  msg: 'Erro ao enviar email',
                  erro: e,
              })
            }
          }

        } else {
            function gerarLetraAleatoria() {
              const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              const indiceAleatorio = Math.floor(Math.random() * alfabeto.length);
              return alfabeto[indiceAleatorio];
            }
            function gerarDigitoAleatorio() {
              return Math.floor(Math.random() * 10).toString();
            }
            function gerarCodigoAleatorio() {
              let codigo = '';

              for (let i = 0; i < 6; i++) {
                codigo += gerarDigitoAleatorio();
              }
              codigo += gerarLetraAleatoria();
              codigo = codigo.split('').sort(() => Math.random() - 0.5).join('');

              return codigo;
            }

            const codigoGerado = gerarCodigoAleatorio();

            await Recovery.create({
              idUser: user.id,
              code: codigoGerado,
              used: 0,
              expiresAt: expirationDateTime
            })
            // Envia o E-mail
            try {
              const html = `
                <html lang='pt-BR'>
                <head>
                  <title>Paradise Roleplay - Recuperação de senhas</title>
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
                    p {
                      color: #333;
                      font-size: 16px;
                    }
                  </style>
                </head>
                <body>
                  <div class='container'>
                    <p>Use este código para recuperar sua senha: ${codigoGerado}, só é válido por uma hora.</p>
                  </div>
                </body>
                </html>
              `
              await EmailService.sendMail(
                email,
                'Recuperação de senha',
                html,
              )
              return response.status(200).json({
                status: 200,
                msg: 'Código enviado por e-mail',
                userID: user.id

              })
              } catch (e) {
              return response.status(500).json({
                  status: 500,
                  msg: 'Erro ao enviar email',
                  erro: e,
              })
            }
        }

      } catch (e){
        console.log(e)
        return response.status(500).json({
          status: 500,
          msg: 'Erro Interno',
          erro: e
        })
      }
    }
    public async checkCode({params, request, response}: HttpContextContract){
      const code = request.body().code
      const regexChangePass = /^[A-Z0-9]+$/;
      try {
        const user = await Recovery.query().where('id_user', params.id).where('used', 0).first()
        if (!user) {
          return response.status(403).json({
            status: 403,
            msg: 'Usuário não possui nenhum código para recuperação'
          })
        }

        if (user.attempt >= 3) {
          await Recovery.query().where('id_user', params.id).where('used', 0).where('code', user.code).delete()
          return response.status(403).json({
            status: 403,
            msg: 'Número de tentativas esgotado, requisite um novo código.'
          })
        }

        if (!regexChangePass.test(code)) {
          await Recovery.updateOrCreate({
            idUser: params.id,
            used: 0,
          }, {
            attempt: user.attempt++
          })
          return response.status(400).json({
            status: 400,
            msg: `Código Incorreto. Tentativas: ${user.attempt++} de 3`
          })
        }

        const existCode = await Recovery.query().where('code', code).where('id_user', params.id).where('used', 0).first()
        if (!existCode) {
          await Recovery.updateOrCreate({
            idUser: params.id,
            used: 0,
          }, {
            attempt: user.attempt++
          })
          return response.status(400).json({
            status: 400,
            msg: `Código Incorreto. Tentativas: ${user.attempt++} de 3`
          })
        }

        if (this.isTokenExpired(existCode.expiresAt || existCode.attempt >= 3)){
          await Recovery.query().where('code', code).delete()
          return response.status(401).json({
            status: 401,
            msg: 'Código expirado, solicite novamente.'
          })
        }
        await Recovery.updateOrCreate({'id': existCode.id}, {used: 1})
        return response.status(200).json({
          status: 200,
          msg: 'Código recuperado.',
          'code': code
        })
      } catch (e) {
        return response.status(500).json({
          status: 500,
          msg: 'Erro Interno',
          error: e
        })
      }
    }
    public async changePass({request, response}: HttpContextContract) {
        const code = request.body().code
        const newPass = request.body().password

        const regexChangePass = /^[A-Z0-9]+$/;
        if (!regexChangePass.test(code)) {
          return response.status(401).json({
            status: 401,
            msg: 'Código Inválido'
          })
        }

        try {
          const validCode = await Recovery.query().where('code', code).where('used', 1).first()
          if (!validCode) {
            return response.status(401).json({
              status: 401,
              msg: 'Código Inválido'
            })
          }
          await Accounts.updateOrCreate({id: validCode.idUser}, {
            password: newPass
          })
          await Recovery.query().where('code', code).delete()
          return response.status(200).json({
            status: 200,
            msg: 'Senha Alterada, Faça Login utilizando a nova senha.'
          })
        } catch (e) {
          return response.status(500).json({
            status: 500,
            msg: 'Erro Interno.'
          })
        }
      }
    public async compra({ request, response }: HttpContextContract) {
      const authorization: string[] = response.header('Authorization', 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      if (tokenBody === undefined) {
        return response.status(401).json({
          status: 401,
          msg: 'Sem permissão ou token está inválido.',
        })
      }
      try {
        const userID: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
          if (data) {
            return data.userId
          } else {
            return false
          }
        })
        const tokenOK: boolean = await Accounts.findBy('id', userID).then(res => {
          return !res ? false : true
        })
        if (!validHeader || !tokenOK) {
          return response.status(401).json({
            status: 401,
            msg: 'Sem permissão ou token está inválido.',
          })
        }
        const user = await Accounts.findBy('id', userID)
        if (!user) {
          return response.status(401).json({
            status: 401,
            msg: 'Usuário não encontrado',
          })
        }
        const body = request.body()
        const produto: string = body.produto
        const nomeProduto: string = body.nomeProduto
        const preco = parseInt(body.preco)
        const uuid = v4()
        let excludePayment:{id: string}[] | never[] = []
        if (preco < 10) {
          excludePayment = [{id: "bolbradesco"}]
        }

        const client = new MercadoPagoConfig({ accessToken: Env.get('TOKEN_MP') || '' })
        const preference = new Preference(client)

        const backUrl = Env.get('BACK_URL')
        const notificUrl = `${Env.get('NOTIFIC_URL')}/${uuid}`

        

        try {
          const result = await preference.create({
          body: {
            items: [
              {
                id: produto,
                currency_id: 'BRL',
                title: nomeProduto,
                unit_price: preco,
                quantity: 1,
              },
            ],
            back_urls: {
              success: backUrl,
              failure: backUrl,
              pending: backUrl,
            },
            payment_methods: {
              excluded_payment_methods: excludePayment,
              excluded_payment_types: [],
              installments: preco < 100 ? 3 : 10
            },
            auto_return: 'approved',
            external_reference: uuid,
            statement_descriptor: 'Paradise Roleplay',
            notification_url: notificUrl
          },
        })
          const compra = {
          uuid: uuid,
          idConta: user.id,
          produto: produto,
          preco: preco,
          status: 'nothing'
        }
          if (result) {
          try {
            await Compra.create(compra)
          } catch (e) {
            console.log(e)
            return response.status(500).json({
              status: 500,
              msg: 'Erro ao gerar Log',
              erro: e
            });
          }
          return response.status(200).json({
            status: 200,
            url: result.init_point
          });

        } else {
            return response.status(400).json(result);
          }
        } catch (e) {
          return response.status(500).json({
            status: 500,
            msg: 'Erro ao realizar compra.',
            erro: e
          })
        }

      } catch (error) {
        console.log(error)
        return response.status(200).json({
          status: 500,
          msg: 'Erro inesperado. Reporte a um administrador. Código: E4976',
          erro: error,
        })
      }
    }
    public async notific({ request, params, response }: HttpContextContract) {
        const body = request.all()
        const status = body.status
        const uuid = params.uuid
        const userID = await Compra.findBy('uuid', uuid)
        if (!userID){
          // LEMBRAR: Gerar Log de erro
          return response.status(404)
        }

        if(userID.status === 'approved') {
          return response.status(200)
        }

        try {
          await Compra.updateOrCreate({
            uuid: uuid
          }, {
            status: status
          })
        } catch (e) {
          return response.status(500).json({
            erro: e
          })
          // LEMBRAR: Gerar Log de erro
        }

        if(status === 'approved') {
          const today = new Date();
          const novaData = new Date(today.getTime() + (30 * 86400));
          switch (userID.produto) {
            case 'coins':
              try {
                await Accounts.updateOrCreate({
                  id: userID.idConta
                }, {
                  saldo: userID.preco
                })
              } catch (e) {
                return response.status(500).json({
                  erro: e
                })
                // LEMBRAR: Gerar Log de erro
              }
              break;
            case 'vipBasic':
              try {
                await Accounts.updateOrCreate({
                  id: userID.idConta
                }, {
                  vip: 1,
                  viptime: novaData.getTime()
                })
                return response.status(200)
              } catch (e) {
                console.log(e)
                return response.status(500).json({
                  erro: e
                })
                // LEMBRAR: Gerar Log de erro
              }
            case 'vipPlus':
              try {
                await Accounts.updateOrCreate({
                  id: userID.idConta
                }, {
                  vip: 2,
                  viptime: novaData.getTime()
                })
              } catch (e) {
                // LEMBRAR: Gerar Log de erro
                return response.status(500).json({
                  erro: e
                })
              }
              break;
            case 'vipUltra':
              try {
                await Accounts.updateOrCreate({
                  id: userID.idConta
                }, {
                  vip: 3,
                  viptime: novaData.getTime()
                })
              } catch (e) {
                // LEMBRAR: Gerar Log de erro
                return response.status(500).json({
                  erro: e
                })
              }
              break;
          }
          try {
            const atualSaldo = await Serverdata.findBy('id', 1).then((data)=> data ? data.finances : null)
            if (!atualSaldo) {
              return response.status(200)
            }
            await Serverdata.updateOrCreate({id: 1}, {
              finances: isNumber(atualSaldo) ? atualSaldo + userID.preco : parseInt(atualSaldo) + userID.preco
            })
          } catch (e) {
            console.log(e)
            return response.status(200)
          }

          return response.status(200)
        }
    }
    public async pagamentoSeguro({request, response}: HttpContextContract) {
      const body = request.all();
      const status = body.status;
      const uuid = body.external_reference;

      if (status === 'success') {
        const url = `http://127.0.0.1:5000/api/notific/${uuid}`;
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
          }),
        };
        const res = await fetch(url, options);
        if (res.ok) {
          response.redirect('https://ucp.paradiseroleplay.pt');
        } else {
          console.error('Error sending notification:', res.statusText);
          response.status(500).send('Internal Server Error');
        }
      }
      response.redirect('https://ucp.paradiseroleplay.pt');
    }
    private isTokenExpired(expirationDate: DateTime): boolean {
      const currentDateTime = DateTime.now()
      const tokenExpirationDate = expirationDate.toJSDate()

      return currentDateTime.toMillis() >= tokenExpirationDate.getTime()
    }

}
