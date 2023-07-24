import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from "App/Models/Accounts";
import ApiToken from "App/Models/ApiToken";
import ms from 'ms';

export default class AccountsController {
    public async login({ request, auth, response }: HttpContextContract) {
    const { name, password } = request.only(['name', 'password'])

    try {
      const user = await Accounts.findBy('name', name)

      if (!user) {
        return response.status(404).json({
          status: 404,
          msg: 'Usuário não encontrado.',
        })
      }

      if (user.password !== password) {
        return response.status(401).json({
          status: 401,
          msg: 'Senha incorreta.',
        })
      }

      const existToken = await ApiToken.findBy("user_id", user.id)
      if (!existToken) {

        // Autenticação manual do usuário
        await auth.login(user, {expiresIn: ms('3h')})

        // Obtém o token gerado após a autenticação
        const token = auth.use('api').token!

        return response.status(200).json({
          "userId": token.userId,
          "user": user.name,
          "character0": user.character0,
          "character1": user.character1,
          "character2": user.character2,
          "tokenHash": token.tokenHash,
          "expiresAt": token.expiresAt
        })
      } else {
        return response.status(200).json({
          "userId": existToken.userId,
          "character0": user.character0,
          "character1": user.character1,
          "character2": user.character2,
          "tokenHash": existToken.token,
          "expiresAt": existToken.expiresAt
        })
      }
    } catch (error) {
      return response.status(500).json({
        status: 500,
        msg: 'Erro interno.',
        erro: error.message,
      })
    }
  }

    public async register({ request, response}: HttpContextContract) {
      const body = request.body()
      const name: string = body.name
      const password: string = body.password
      const email: string = body.email ? body.email : ''
      const ip: string = body.ip ? body.ip : ''
      const accountExist: Accounts | null = await Accounts.findBy('name', name)
      const emailExist: Accounts | null = await Accounts.findBy('email', email)

     if(!name || !password) {
       return response.status(400).json({
         status: 400,
         msg: "Um ou mais campos está incompleto!"
       })

     } if (!accountExist || !emailExist && email !== ''){

        return response.status(400).json({
          status: 400,
          msg: "Este usuário ou email já está cadastrado.",
        })
      } else {
       await Accounts.create({
         "name": name,
         "password": password,
         "email": email,
         "ip": ip,
         character0: -1,
         character1: -1,
         character2: -1,
         vip: 0,
         viptime: 0,
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
        response.status(200)
        return {
          "status": 200,
          "name": user.name,
          "password": user.password,
          "email": user.email,
          "ip": user.ip,
          "vip": user.vip,
          "viptime": user.viptime
        }
      } else {
        // LEMBRAR: expirar token ao errar a senha.
        /*await ApiToken.updateOrCreate({
          "userId": user.id,
        }, {
          "expiresAt": DateTime.fromFormat("2020-07-24 04:18:01","string")
        })*/
        return {
          status: 401,
          msg: 'Não autorizado, token invalido ou expirado.'
        }
      }
    }

    public async update({params, request, response}: HttpContextContract) {
      const body = request.body()
      const user : Accounts = await Accounts.findOrFail(params.id)
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
        const newPass: string = body.password !== user.password ? body.password : user.password
        const newEmail: string = body.email !== user.email ? body.email : user.email
        const newNameExist: boolean = await Accounts.findBy('name', newName) !== null && newName !== user.name
        const newEmailExiste: boolean = await Accounts.findBy('email', newEmail) !== null && newEmail !== user.email

        if (newPass === '' || newName === '') {
          return response.status(401).json({
            status: 401,
            msg: 'Nome ou Senha não podem estar vazios.'
          })
        } if (newNameExist || newEmailExiste && newEmail !== '') {
          return response.status(401).json({
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
    }
}
