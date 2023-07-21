import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Accounts from "App/Models/Accounts";

export default class AccountsController {
    public async login({request, response}: HttpContextContract) {
      const body = request.body()
      const name: string  =  body.name
      const password: string = body.password
      const accountExist: Accounts | null = await Accounts.findBy('name', name)

      if (!name || !password) {
        response.status(400)
        return {
          status: 400,
          msg: "Um ou mais campos está incompleto!"
        }
      } if(accountExist === null) {
        response.status(401)
          return{
            status: 401,
            msg: "Usuário não existe!"
          }
      } if(accountExist.password !== body.password) {
        response.status(401)
        return{
          status: 401,
          msg: "Senha incorreta!"
        }
      } else {
        response.status(201)
        const jwt = require('jwt-simple');
        const payload = {
          "id": accountExist.id,
          "name": name,
          "email": accountExist.email,
          "creat": String(new Date().getTime())
        };
        const secret = new Date().getSeconds();
        const accountsToken = jwt.encode(payload, String(secret), 'HS256');

        await Accounts.updateOrCreate({
          "id": accountExist.id,
        },{
          tokentmp: accountsToken
        })

        if(!accountExist.createdAt) {
          await Accounts.updateOrCreate({
            "id": accountExist.id,
          },{
            createdAt: accountExist.updatedAt
          })
        }

        return {
          "status": 201,
          "id": accountExist.id,
          "user": accountExist.name,
          "character0": accountExist.character0,
          "character1": accountExist.character1,
          "character2": accountExist.character2,
          "tokentmp": accountsToken,
        }
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
       response.status(400)
       return {
         status: 400,
         msg: "Um ou mais campos está incompleto!"
       }
     } if (accountExist !== null || emailExist !== null && email !== ''){
        response.status(400)
        return {
          status: 400,
          msg: "Este usuário ou email já está cadastrado.",
        }
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
         tokentmp: ''
       })
        response.status(201)
       return {
         status: 201,
         msg: "Conta criada com sucesso."
       }
     }
    }

    public async show({params, response}: HttpContextContract) {
      const validAccount: Accounts | null = await Accounts.findOrFail(params.id)
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const token: string = authorization[findAuthorization].split(' ')[1]
      const tokenOK: boolean = validAccount.tokentmp === token

      if (validHeader && tokenOK && validAccount.tokentmp !== null) {
        response.status(200)
        return {
          "status": 200,
          "name": validAccount.name,
          "password": validAccount.password,
          "email": validAccount.email,
          "ip": validAccount.ip,
          "vip": validAccount.vip,
          "viptime": validAccount.viptime
        }
      } else {
        await Accounts.updateOrCreate({
          "id": validAccount.id,
        }, {
          "tokentmp": ''
        })
        return {
          status: 401,
          msg: 'Não autorizado, token invalido ou expirado.'
        }
      }
    }

    public async update({params, request, response}: HttpContextContract) {
      const body = request.body()
      const validAccount : Accounts = await Accounts.findOrFail(params.id)
      const authorization: string[] = response.header("Authorization", 'Bearer').request.rawHeaders
      const findAuthorization: number = authorization.indexOf('Authorization') + 1
      const validHeader: boolean = authorization[findAuthorization].split(' ')[0] === 'Bearer' && authorization[findAuthorization].split(' ').length === 2
      const token: string = authorization[findAuthorization].split(' ')[1]
      const tokenOK: boolean = validAccount.tokentmp === token

      if (validHeader && tokenOK && validAccount.tokentmp !== null) {
        const newName: string = body.name !== validAccount.name ? body.name : validAccount.name
        const newPass: string = body.password !== validAccount.password ? body.password : validAccount.password
        const newEmail: string = body.email !== validAccount.email ? body.email : validAccount.email
        const newNameExist: boolean = await Accounts.findBy('name', newName) !== null && newName !== validAccount.name
        const newEmailExiste: boolean = await Accounts.findBy('email', newEmail) !== null && newEmail !== validAccount.email

        if (newPass === '' || newName === '') {
          response.status(401)
          return{
            status: 401,
            msg: 'Nome ou Senha não podem estar vazios.'
          }
        } if (newNameExist || newEmailExiste && newEmail !== '') {
          response.status(401)
          return {
            status: 401,
            msg: "Este Nome ou Email já está cadastrado."
          }
        } else {
          await Accounts.updateOrCreate({
            "id": params.id
          }, {
            "name": newName,
            "password": newPass,
            "email": newEmail
          })
          return {
            "status": 200,
            "name": newName,
            "password": newPass,
            "email": newEmail,
            "ip": validAccount.ip,
            "vip": validAccount.vip,
            "viptime": validAccount.viptime
          }
        }

      }
    }
}
