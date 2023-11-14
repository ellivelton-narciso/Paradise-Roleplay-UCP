const semPersonagensDiv = `<div class="alert alert-warning">
        <p style="text-align: center;">Você não tem nenhum personagem. <a href="personagem-criar.html">Crie</a> um agora mesmo!</p>
        </div>
    `
const comPersonagensDiv =`
        <div class="row my-auto">
            <div id="personagem0" class="cardPersonagem col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3 p-3 mx-3 rounded bg-white">
                <div class="card border-1 border-dark" style="font-size: 0.6em">
                  <img id="personagem0-img" src="https://assets.open.mp/assets/images/skins/0.png" class="card-img-top" alt="">
                  <div class="card-body">
                    <p style="font-size: 1.2em; font-weight: bold;" id="personagem0-nome" class="card-title">Nome_Personagem</p>
                    <p class="card-text"></p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li id="personagem0-level" class="list-group-item text-center">Nível <span></span></li>
                    <li id="personagem0-money" class="list-group-item text-center">Dinheiro: R$ <span></span></li>
                  </ul>
                  <div class="card-body align-items-center">
                    <a id="cPer-0" href="personagem-criar.html" class="bg-primary text-center btn-primary d-block rounded p-1 text-decoration-none text-white">Criar Personagem</a>
                    <a id="ePer-0" style=" cursor: pointer;" class="bg-primary text-center btn-primary d-none rounded p-1 text-decoration-none text-white">Editar Personagem</a>
                    <a id="tPer-0" style=" cursor: pointer;" class="bg-primary btn-warning text-center mt-2 rounded p-1 text-decoration-none text-white d-none">Troca de nome</a>
                  </div>
                </div>
            </div>
            <div id="personagem1" class="cardPersonagem col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3 p-3 mx-3 rounded bg-white">
                <div class="card border-1 border-dark" style="font-size: 0.6em">
                  <img id="personagem1-img" src="https://assets.open.mp/assets/images/skins/0.png" class="card-img-top" alt="">
                  <div class="card-body">
                    <p style="font-size: 1.2em; font-weight: bold;" id="personagem1-nome" class="card-title">Slot_Vazio</p>
                    <p class="card-text"></p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li id="personagem1-level" class="list-group-item text-center">Nível <span></span></li>
                    <li id="personagem1-money" class="list-group-item text-center">Dinheiro: R$ <span></span></li>
                  </ul>
                  <div class="card-body align-items-center">
                    <a id="cPer-1" href="personagem-criar.html" class="bg-primary text-center btn-primary d-block rounded p-1 text-decoration-none text-white">Criar Personagem</a>
                    <a id="ePer-1" style=" cursor: pointer;" class="bg-primary text-center btn-primary d-none rounded p-1 text-decoration-none text-white">Editar Personagem</a>
                    <a id="tPer-1" style=" cursor: pointer;" class="bg-primary btn-warning text-center mt-2 rounded p-1 text-decoration-none text-white d-none">Troca de nome</a>
                  </div>
                </div>
            </div>
            <div id="personagem2" class="cardPersonagem col-12 col-sm-6 col-md-3 col-lg-3 col-xl-3 p-3 rounded bg-white">
                <div class="card border-1 border-dark" style="font-size: 0.6em">
                  <img id="personagem2-img" src="https://assets.open.mp/assets/images/skins/0.png" class="card-img-top" alt="">
                  <div class="card-body">
                    <p style="font-size: 1.2em; font-weight: bold;" id="personagem2-nome" class="card-title">Slot_Vazio</p>
                    <p class="card-text"></p>
                  </div>
                  <ul class="list-group list-group-flush">
                    <li id="personagem2-level" class="list-group-item text-center">Nível <span></span></li>
                    <li id="personagem2-money" class="list-group-item text-center">Dinheiro: R$ <span></span></li>
                  </ul>
                  <div class="card-body align-items-center">
                    <a id="cPer-2" href="personagem-criar.html" class="bg-primary text-center btn-primary d-block rounded p-1 text-decoration-none text-white">Criar Personagem</a>
                    <a id="ePer-2" style=" cursor: pointer;" class="bg-primary text-center btn-primary d-none rounded p-1 text-decoration-none text-white">Editar Personagem</a>
                    <a id="tPer-2" style=" cursor: pointer;" class="bg-primary btn-warning text-center mt-2 rounded p-1 text-decoration-none text-white d-none">Troca de nome</a>
                  </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal" id="myModal">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Editar Personagem</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label for="nomeEditar" class="form-label">Nome:</label>
                  <input type="text" class="form-control" id="nomeEditar" disabled>
                </div>
                <div class="mb-3">
                  <label for="skinEditar" class="form-label">Skin:</label>
                  <input type="text" class="form-control" id="skinEditar">
                </div>
              </div>
              <div id="errorMessage" class="alert alert-danger visually-hidden">Essa skin não pode ser definida.</div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="button" id="salvar" class="btn btn-primary">Salvar</button>
              </div>
            </div>
          </div>
        </div>
    `
let personagensStorage = JSON.parse(localStorage.getItem('usuario')).character
let qtdPersonagens = personagensStorage.filter(k => k !== -1).length
const userID = JSON.parse(localStorage.getItem('usuario')).userId

const renderComPersonagens = () => {
    $.ajax({
        "url": `${url}/characters/${userID}`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Authorization": `Bearer ${getCookie('tk')}`
        },
        "beforeSend": ()=> {

        },
        success: res => {
            if (res.status === 401) {
                logout()
                return
            }

            $.ajax({
                "url": `${url}/aplicacoes/user/${userID}`,
                "method": "GET",
                "timeout": 0,
                "headers": {
                    "Authorization": `Bearer ${getCookie('tk')}`
                },
                success: result => {
                    const personagens = res.personagens;
                    const personagensComAplicacao = [];


                    function getFirstName(fullName) {
                        return fullName.split('_')[0];
                    }

                    for (const aplicacao of result.aplicacoes) {
                        const nomeAplicacao = aplicacao.nome;
                        const sobrenomeAplicacao = aplicacao.sobrenome;

                        const personagemEncontrado = personagens.find(personagem => {
                            const nomePersonagem = getFirstName(personagem.name);
                            const sobrenomePersonagem = personagem.name.split('_')[1];
                            return nomePersonagem === nomeAplicacao && sobrenomePersonagem === sobrenomeAplicacao;
                        });

                        if (personagemEncontrado) {
                            personagensComAplicacao.push(personagemEncontrado.name);
                        }
                    }

                    // Filtra os personagens que não estão em personagensComAplicacao
                    const personagensSemAplicacao = personagens.filter(personagem => !personagensComAplicacao.includes(personagem.name));

                    if (personagensSemAplicacao.length > 0) {
                        localStorage.personagensSemAplicacao = JSON.stringify(personagensSemAplicacao)
                        swal({
                            text: `Você possui ${personagensSemAplicacao.length} personagens criados que não fizeram aplicações na UCP, caso queira deletar o personagem, contecte um administrador.`,
                            className: "custom-swal",
                            closeOnClickOutside: false,
                            closeOnEsc: false,
                            buttons: {
                                confirm: true,
                            }
                        }).then((confirm) => {
                            if (confirm) {
                                window.location.href = "personagem-criar.html";
                            }
                        });
                    }
                },
                error: ()=> logout()
            })
            document.getElementById('qtdNegadas').innerHTML = `${res.aplicacoes}/3`
            const personagens = res.personagens
            for (let i = 0; i < res.personagens.length; i++) {
                document.getElementById(`personagem${i}-img`).removeAttribute('src')
                document.getElementById(`personagem${i}-img`).setAttribute('src', `https://assets.open.mp/assets/images/skins/${personagens[i].skin}.png`)
                document.getElementById(`personagem${i}-nome`).innerHTML = personagens[i].name
                document.querySelector(`#personagem${i}-level span`).innerHTML = String(personagens[i].level)
                document.querySelector(`#personagem${i}-money span`).innerHTML = String(personagens[i].money)
                document.getElementById(`cPer-${i}`).classList.remove('d-block')
                document.getElementById(`cPer-${i}`).classList.add('d-none')
                document.getElementById(`ePer-${i}`).classList.remove('d-none')
                document.getElementById(`ePer-${i}`).classList.add('d-block')
                document.getElementById(`ePer-${i}`).addEventListener('click', ()=> {
                    const myModal = new bootstrap.Modal(document.getElementById('myModal'));
                    myModal.show();
                    $('#nomeEditar').val(res.personagens[i].name)
                    $('#skinEditar').val(res.personagens[i].skin)
                    document.getElementById('skinEditar').classList.remove('is-invalid')
                    document.getElementById('errorMessage').classList.add('visually-hidden')

                    // Tratar ação de salvar os dados do modal
                    document.getElementById('salvar').addEventListener('click', () => {
                        const idEditar = res.personagens[i].id
                        const idConta = Number(JSON.parse(localStorage.getItem('usuario')).userId)
                        const skin = Number(document.getElementById('skinEditar').value);
                        const skinsInvalidas = [0, 211, 217, 265, 266, 267, 268, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 300, 301, 302, 306, 307, 308, 309, 310, 311]
                        if(skin < 0 || skin > 305 || skinsInvalidas.filter(filtro => skin === filtro).length > 0) {
                            document.getElementById('skinEditar').classList.add('is-invalid')
                            document.getElementById('errorMessage').classList.remove('visually-hidden')
                        } else {
                            const body = {
                                "id": idConta,
                                "skin": skin
                            }

                            $.ajax({
                                url: `${url}/characters/${idEditar}`,
                                method: 'POST',
                                "headers": {
                                    "Authorization": `Bearer ${getCookie('tk')}`,
                                    "Content-Type": "application/json"
                                },
                                "data": JSON.stringify(body),
                                beforeSend: ()=> {

                                },
                                success: res => {
                                    const myModal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
                                    myModal.hide();
                                    document.getElementById(`personagem${i}-img`).removeAttribute('src')
                                    document.getElementById(`personagem${i}-img`).setAttribute('src', `https://assets.open.mp/assets/images/skins/${skin}.png`)
                                    swal({
                                        text:  res.msg,
                                        className: "custom-swal2",
                                        closeOnClickOutside: true,
                                        closeOnEsc: true,
                                        buttons: {
                                            confirm: true,
                                        }
                                    })
                                }
                            })
                        }



                    });
                })

            }
        },
        error: ()=> logout()
    })
    document.getElementById('centerPersonagens').innerHTML = comPersonagensDiv
}
$.ajax({
    "url": `${url}/characters/${userID}`,
    "method": "GET",
    "timeout": 0,
    "headers": {
        "Authorization": `Bearer ${getCookie('tk')}`
    }
})
.done((res)=> {
    if (res.personagens.length === 0) {
        document.getElementById('centerPersonagens').innerHTML = semPersonagensDiv
    } else {
        renderComPersonagens()
        const pers = JSON.parse(localStorage.getItem('usuario'))
        pers.character = res.personagensLista
        localStorage.usuario = JSON.stringify(pers)

    }
    document.getElementById('qtdNegadas').innerHTML = `${res.aplicacoes}/3`
})
document.getElementById('qtdPersonagens').innerHTML = `${qtdPersonagens}/${personagensStorage.length}`