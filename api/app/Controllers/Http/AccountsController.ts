import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from "App/Models/Accounts";
import ApiToken from "App/Models/ApiToken";
import ms from 'ms';
import {DateTime} from "luxon";

export default class AccountsController {
    public async login({ request, auth, response }: HttpContextContract) {
      const { name, password } = request.only(['name', 'password'])

      try {
        const user = await Accounts.findBy('name', name)

        if (!user) {
          return response.status(401).json({
            status: 401,
            msg: 'Usuário não encontrado.',
          })
        }

        if (user.password !== password) {
          return response.status(401).json({
            status: 401,
            msg: 'Senha incorreta.',
          })
        }
        const tempoDefaultExpire = ms('3h')
        const existToken = await ApiToken.findBy("user_id", user.id)


        if (existToken) {
          const isExpired = this.isTokenExpired(existToken.expiresAt)
          if (isExpired) {
            try {
              await ApiToken.query().where('token', existToken.token).delete();
              // Autenticação manual do usuário
              await auth.login(user, {expiresIn: tempoDefaultExpire})

              // Obtém o token gerado após a autenticação
              const token = auth.use('api').token!

              return response.status(200).json({
                "status": 200,
                "user": {
                  "userId": token.userId,
                  "name": user.name,
                  "admin": user.admin,
                  "character": [user.character0, user.character1, user.character2],
                  "tokenHash": token.tokenHash,
                  "expiresAt": token.expiresAt
                }
              })
            } catch (e) {
              return response.status(500).json({
                status: 500,
                msg: "Erro interno, contacte um administrador. Codigo: 1001"
              })
            }
          }
          return response.status(200).json({
            "status": 200,
            "user": {
              "userId": existToken.userId,
              "name": user.name,
              "admin": user.admin,
              "character": [user.character0, user.character1, user.character2],
              "tokenHash": existToken.token,
              "expiresAt": existToken.expiresAt
            }
          })
        }

        // Autenticação manual do usuário
        await auth.login(user, {expiresIn: tempoDefaultExpire})

        // Obtém o token gerado após a autenticação
        const token = auth.use('api').token!

        return response.status(200).json({
          "status": 200,

          "user": {
            "userId": token.userId,
            "name": user.name,
            "admin": user.admin,
            "character": [user.character0, user.character1, user.character2],
            "tokenHash": token.tokenHash,
            "expiresAt": token.expiresAt
          }
        })
      } catch (error) {
        return response.status(500).json({
          status: 500,
          msg: 'Erro interno.',
          erro: error.message,
        })
      }
    }

    public async register({ request, response}: HttpContextContract) {
      const regex = /^[A-Za-z_][A-Za-z0-9._]*$/;

      const body = request.body()
      const name: string = body.name
      const password: string = body.password
      const email: string = body.email ? body.email : ''
      const ip: string = body.ip ? body.ip : ''
      if (!regex.test(name)) {
        return response.status(403).json({
          status: 403,
          msg: "Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.)."
        });
      }
      const accountExist: Accounts | null = await Accounts.findBy('name', name)
      const emailExist: Accounts | null = await Accounts.findBy('email', email)

     if(!name || !password) {
       return response.status(400).json({
         status: 400,
         msg: "Um ou mais campos está incompleto!"
       })

     } if (accountExist || emailExist && email !== ''){

        return response.status(403).json({
          status: 403,
          msg: "Este usuário ou email já está cadastrado.",
        })
      } else {
       await Accounts.create({
         "name": name,
         "password": password,
         "email": email,
         "ip": ip,
         "character0": -1,
         "character1": -1,
         "character2": -1,
         "vip": 0,
         "viptime": 0,
         "saldo": 0
       })

       return response.status(201).json({
         status: 201,
         msg: "Conta criada com sucesso."
       })
     }
    }

    public async show({params, response}: HttpContextContract) {
      const user: Accounts | null = await Accounts.findOrFail(params.id)
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

      if (validHeader && tokenOK) {

        return response.status(200).json({
          "status": 200,
          "name": user.name,
          "email": user.email,
          "ip": user.ip,
          "vip": user.vip,
          "viptime": user.viptime
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
          msg: 'Não autorizado, token invalido ou expirado.'
        })
      }
    }

    public async showAll(response: HttpContextContract) {
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
        const contas = await Accounts.all()
        return response.response.status(200).json({
          status: 200,
          contas
        })
      }
      return response.response.status(401).json({
        status: 401,
        msg: 'Sem permissão ou token está inválido.'
      })
    }

    public async update({params, request, response}: HttpContextContract) {
      const regex = /^[A-Za-z_][A-Za-z0-9._]*$/;
      const body = request.body()
      const user : Accounts | null = await Accounts.findBy('id', params.id)

      if (!regex.test(body.name)) {
        return response.status(200).json({
          status: 403,
          msg: "Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.)."
        });
      }

      if (!user) {
        return response.status(200).json({
          status: 404,
          msg: 'Usuário não encontrado'
        })
      }
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

      if (validHeader && tokenOK) {
        const newName: string = body.name !== user.name ? body.name : user.name
        const newPass: string = body.password === undefined || body.password === user.password ? user.password : body.password
        const userEMail: string = this.removeNull(user.email)
        const newEmail: string = body.email === user.email || body.email === null || body.email === undefined ? user.email : body.email
        const newNameFind = await Accounts.findBy('name', newName)
        const newNameExist = newNameFind !== null && newName !== user.name
        const newEmailFind = await Accounts.findBy('email', newEmail)
        const newEmailExiste = newEmailFind !== null && newEmail !== user.email

        if (newPass === '' || newName === '') {
          return response.status(200).json({
            status: 401,
            msg: 'Nome ou Senha não podem estar vazios.'
          })
        } if (newNameExist || newEmailExiste && newEmail !== '') {
          return response.status(200).json({
            status: 401,
            msg: "Este Nome ou Email já está cadastrado."
          })
        } else {
          await Accounts.updateOrCreate({
            "id": params.id
          }, {
            "name": newName,
            "password": newPass,
            "email": newEmail
          })
          return response.status(200).json({
            "status": 200,
            "name": newName,
            "password": newPass,
            "email": newEmail,
            "ip": user.ip,
            "vip": user.vip,
            "viptime": user.viptime
          })
        }

      }
      return response.status(200).json({
        status: 404,
        msg: 'Token inválido ou expirado.'
      })
    }

    public async isAdmin({response}: HttpContextContract) {
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
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

      return response.status(200).json({
        status: 200,
        isAdmin: validHeader && tokenOK
      })


    }

    public async updateAdmin({params, request, response} : HttpContextContract) {
      const regex = /^[A-Za-z_][A-Za-z0-9._]*$/;

      const body = request.body()
      const user: Accounts | null = await Accounts.findBy('id', params.id)

      if (!regex.test(body.name)) {
        return response.status(200).json({
          status: 403,
          msg: "Usuário não pode conter espaços ou caracteres especiais exceto underline(_) e ponto(.)."
        });
      }

      if (!user) {
        return response.status(404).json({
          status: 404,
          msg: 'Usuário não encontrado'
        })
      }
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      const userAdmin: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
        if (data) {
          return data.userId
        } else {
          return false
        }
      })
      const tokenOK: boolean = await Accounts.findBy('id', userAdmin).then(res => {
        if (!res) {
          return false
        }
        return res.admin === 1;
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
          return response.status(200).json({
            status: 401,
            msg: 'Nome ou Senha não podem estar vazios.'
          })
        }
        if (newNameExist || newEmailExiste && newEmail !== '') {
          return response.status(200).json({
            status: 401,
            msg: "Este Nome ou Email já está cadastrado."
          })
        } else {
          await Accounts.updateOrCreate({
            "id": params.id
          }, {
            "name": newName,
            "password": newPass,
            "email": newEmail,
            "vip": body.vip,
            "viptime": body.viptime,
            "admin": body.admin
          })
          return response.status(200).json({
            "status": 200,
            "msg": 'Alterado com sucesso'
          })

        }
      }
      return response.status(200).json({
        status: 404,
        msg: 'Token inválido ou não é um administrador.'
      })
    }

    public async isValid({response}: HttpContextContract) {
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const tokenBody: string = authorization[findAuthorization].split(' ')[1]
      if (tokenBody === undefined) {
        return response.status(200).json({
          status: 200,
          isLogged: false
        })
      }
      try {
        const user: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
          if (data) {
            return data.userId
          } else {
            return false
          }
        })
        const tokenOK: boolean = await Accounts.findBy('id', user).then(res => {
          return !res ? false : true
        })

        return response.status(200).json({
          status: 200,
          isLogged: validHeader && tokenOK
        })
      } catch (error) {
        return response.status(200).json({
          status: 200,
          isLogged: false
        })
      }

    }

    private removeNull(value : string | null ) : string {
      if (value === null) {
        return ''
      } else {
        return value
      }
    }
    private isTokenExpired(expirationDate: DateTime): boolean {
      const currentDateTime = DateTime.now();
      const tokenExpirationDate = expirationDate.toJSDate();

      return currentDateTime.toMillis() >= tokenExpirationDate.getTime();
    }

}
