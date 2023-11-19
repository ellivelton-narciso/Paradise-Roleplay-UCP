document.addEventListener('DOMContentLoaded', ()=> {
    const geraProduto = (idProduto, nomeProduto, precoProduto, beneficios)=> {
        if(Number.isInteger(precoProduto)) return JSON.stringify(precoProduto).replace('.', ',')
        if(Number.isFinite(precoProduto)) return JSON.stringify(precoProduto).toFixed(2).replace('.', ',')
        idProduto = idProduto.replace(' ', '').replace('"', '').replace("'", "").replace('<', '').replace('/', '')
        const cardProduto = `
            <style>
                #${idProduto}-${idProduto}.cardProduto:hover{
                    transform: scale(1.05);
                }
                #carProduto_titulos-${idProduto}{
                    -webkit-box-shadow: 0 -4px 15px 6px rgba(0,0,0,0.28);
                    box-shadow: 0 -4px 15px 6px rgba(0,0,0,0.28);
                    border-radius: 0.375rem 0.375rem  0 0!important;
                }
                #carProduto_beneficios-${idProduto}{
                    -webkit-box-shadow: 0 8px 15px 6px rgba(0,0,0,0.28);
                    box-shadow: 0 8px 15px 6px rgba(0,0,0,0.28);
                    border-radius:   0 0 0.375rem 0.375rem !important;
                }
                #item_beneficios-${idProduto} li{
                    list-style: none;
                    text-decoration: none;
                }
                .preco_coins {
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  padding: 5px;
                }
            </style>
            <div id='${idProduto}-${idProduto}' class='col-lg-3 col-md-4 col-sm-6 cardProduto mb-5'>
                <div class='card' id='cardProduto_titulos-${idProduto}' style='background-color: #818181; color: #ffffff; border: none'>
                  <div class='row' style='padding: 30px 20px'>
                    <h5 class='tituloProduto' style='font-size: 0.8rem'>${nomeProduto}</h5>
                    <div id='precoProduto-${idProduto}'><h3 class='precoProduto'>R$ ${precoProduto}</h3></div>
                  </div>
                </div>
                <div class='card' id='carProduto_beneficios-${idProduto}' style='border: none'>
                  <div class='row' style='padding: 30px'>
                    <div class='col-10'>
                      <div class='row'>
                        <ul id='item_beneficios-${idProduto}'>
                        </ul>
                      </div>
                    </div>
                    <div class='col-2' style='margin-left: 25%'>
                      <button id='${idProduto}' class='btn btn-outline-danger botaoCompraProduto' style='font-size: 0.7rem'><i class='fa-solid fa-cloud-arrow-down d-inline me-1'></i>Adquirir</button>
                    </div>
                  </div>
                </div>
              </div>
        `
        $(cardProduto).clone().appendTo('#area_produtos')

        if (idProduto === 'coins') {
            const inputPreco = $(`#precoProduto-${idProduto} #preco_coins`)
            $(`#precoProduto-${idProduto}`).html(`<h3 class='precoProduto'>R$ <input type="number" min='1' max='500' id="preco_coins" class="form-control d-inline preco_coins" style="width: 100px;" value='${precoProduto}' pattern="[0-9]+"></h3>`)
        }
        let beneficiosLista
        for (let i = 0; i < beneficios.length; i++) {
            beneficiosLista = `<li><i class="fa-solid fa-circle-check text-success"></i> ${beneficios[i]}</li><hr>`
            $(beneficiosLista).clone().appendTo(`#item_beneficios-${idProduto}`)
        }

        $(`#${idProduto}`).click(()=>{
            const cart = {
                "produto": idProduto,
                "nomeProduto": nomeProduto,
                "preco": idProduto === 'coins' ? parseInt($('#preco_coins').val()) : parseInt(precoProduto.split(',')[0]),
            }
            localStorage.setItem('compra', JSON.stringify(cart))
            $.ajax({
                url: `${url}/compraFeita`,
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${getCookie('tk')}`
                },
                data: cart,
                success: function (data) {
                    console.log(data)
                    switch (data.status){
                        case 200:
                        case 201:
                            location.assign(data.url)
                            break;
                        case 401:
                        case 500:
                            swal({
                                title: 'Erro',
                                text: data.msg,
                                icon: 'error',
                                button: 'OK'
                            })
                            break;
                        case 400:
                            swal({
                                title: 'Erro',
                                text: data.message,
                                icon: 'error',
                                button: 'OK'
                            })
                            break;
                    }
                },
                error: (e) => {
                    console.log(e)
                }
            })
        })
    }

    geraProduto('coins', 'Coins', '1', []);
    geraProduto('vipBasic', 'Vip Basic', '20,00', ['30 dias de vip', 'Tag no Discord de Vip', 'Tag Vip no servidor', 'Pode ter até 3 veículos', 'Pode ter até 2 casas', 'e muito mais...'])
    geraProduto('vipPlus', 'Vip Plus', '40,00', ['30 dias de vip', 'Tag no Discord de Vip', 'Tag Vip no servidor', 'Pode ter até 5 veículos', 'Pode ter até 3 casas', ' + R$250 no payday', 'e muito mais...'])
    geraProduto('vipUltra', 'Vip Ultra', '60,00', ['30 dias de vip', 'Tag no Discord de Vip', 'Tag Vip no servidor', 'Pode ter até 7 veículos', 'Pode ter até 4 casas', ' + R$500 no payday', 'e muito mais...'])

    const inputPreco = $('#preco_coins')
    function isNumber(value) {
      return /^[0-9]+$/.test(value);
    }
    inputPreco.change(()=> {
        if (inputPreco.val() > 500) {
            inputPreco.val('500')
        }
        if (!isNumber(inputPreco.val())) {
            inputPreco.val('1');
        }
    })
})


