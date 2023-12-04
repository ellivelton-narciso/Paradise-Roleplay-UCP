import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ApiToken from 'App/Models/ApiToken'
import Accounts from 'App/Models/Accounts'
import Character from 'App/Models/Character'

export default class SspController {
	 public async index({response}: HttpContextContract) {
			try {
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
	      const userID: number | boolean = await ApiToken.findBy('token', tokenBody).then(data => {
	          if (data) {
	              return data.userId
	          } else {
	              return false
	          }
	      })
	      const tokenOK: boolean = await Accounts.findBy('id', userID).then(res => {
	          if (!res) {
	              return false
	          }
	          return res.admin > 0
	      })
				if (!validHeader || !tokenOK) {
					 return response.status(403).json({
						 status: 403,
						 msg: 'Token inválido'
				   })
	      }
				const user = await Accounts.findBy('id', userID)
				if(!user) {
					return response.status(401).json({
						status: 401,
						msg: 'Erro ao encontrar usuário'
					})
				}
				const personagem1 = user.character0 !== -1 ? await Character.findBy('id', user.character0)
		    .then(data => {
		        if (data) {
		            return data.faction === 1 || data.faction === 2 || data.faction === 3 ? data.name : null;
		        }
		        return null;
		    })
		    .catch(error => {
		        console.error('Erro ao buscar personagem:', error);
		        return null;
		    }) : null;

				const personagem2 = user.character1 !== -1 ? await Character.findBy('id', user.character1)
		    .then(data => {
		        if (data) {
		            return data.faction === 1 || data.faction === 2 || data.faction === 3 ? data.name : null;
		        }
		        return null;
		    })
		    .catch(error => {
		        console.error('Erro ao buscar personagem:', error);
		        return null;
		    }) : null;
				
				const personagem3 = user.character2 !== -1 ? await Character.findBy('id', user.character2)
		    .then(data => {
		        if (data) {
		            return data.faction === 1 || data.faction === 2 || data.faction === 3 ? data.name : null;
		        }
		        return null;
		    })
		    .catch(error => {
		        console.error('Erro ao buscar personagem:', error);
		        return null;
		    }) : null;
				
				if (!personagem1 && !personagem2  && !personagem3) {
					return response.status(401).json({
						status: 401,
						msg: 'Você não tem personagem que faça parte da SSP'
					})
				}
				let personagens: string[] = []
				if (personagem1 !== null) {
					personagens.push(personagem1)
				}
				if (personagem2 !== null) {
					personagens.push(personagem2)
				}
				if (personagem3 !== null) {
					personagens.push(personagem3)
				}
				
				return response.status(200).json({
					status: 200,
					personagens: personagens
				})
				
			} catch (e) {
				return response.status(500).json({
					status: 500,
					msg: 'Erro interno',
					erro: e
				})
			}
	
	 }
}
