import {language} from "../traducaoTabela.js";

const table = $('<table id="tabela" class="table table-striped table-bordered"></table>').appendTo('.table-responsive');
let conta;
let personagens;

const renderTabela = ()=> {
    $.ajax({
        url: `${url}/admin/characters`,
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getCookie('tk')}`
        },
        beforeSend: () => {
            $('#loading').show();
        },
        success: res => {
            switch (res.status) {
                case 200:
                  $.ajax({
                    url: `${url}/users`,
                    method: 'GET',
                    headers: {
                        "Authorization": `Bearer ${getCookie('tk')}`
                    },
                    success: (users)=> {
                      conta = users
                      $('#loading').hide();
                      switch (users.status) {
                        case 200:
                          personagens = res;
                          table.DataTable({
                            data: personagens.personagens,
                            columns: [
                              {
                                data: 'id',
                                title: 'Conta Principal',
                                render: function (data) {
                                  for (const acc of users.contas) {
                                    if (acc.character0 === data || acc.character1 === data || acc.character2 === data) {
                                      return acc.name;
                                    }
                                  }
                                  return 'Sem conta';
                                }
                              },
                              { data: 'name', title: 'Personagem' },
                              { data: 'level', title: 'Nível' },
                              {
                                  data: 'sex',
                                  title: 'Sexo',
                                  render: (data) => data === 1 ? 'Masculino' : 'Feminino'
                              },
                              { data: 'birthday',title: 'Nascimento' },
                              { data: 'money', title: 'Dinheiro'},
                              {
                                  data: 'id',
                                  title: 'Editar',
                                  render: function () {
                                      return '<div class="text-center"><a class="btn btn-primary">Editar</a></div>';
                                  }
                              }
                            ],
                            language: language
                          });
                        break;
                      }
                    }
                  })
                    break;
                case 404:
                    alert(res.msg)
                    logout()
                    break;
                default:
                    $('#datatables-base').html(res.msg);
                    break;
            }
        },
        error: err => {
            $('#loading').hide();
            $('#datatables-base').html('<p>Erro na requisição.</p>');
            console.log(err)
        }
    });
}
renderTabela()

table.on('click', '.btn-primary', function () {
    function converterData(data) {
      const [dia, mes, ano] = data.split("/");
      return `${ano}-${mes}-${dia}`;
    }
    function reconverterData (data){
      const [ano, mes, dia] = data.split('-');
      return `${dia}/${mes}/${ano}`;
    }

    const table = $('#tabela').DataTable();
    const rowData = table.row($(this).parents('tr')).data();
    const idClicado = rowData.id;
    const userApp = personagens.personagens.filter(filtro => filtro.id === idClicado)[0]
    const bankAccount = personagens.bankAccount.filter(filtro => filtro.owner === userApp.name)[0]
    let divBanco;
    if (bankAccount === undefined) {
      divBanco = `
        <div class="mb-3 col-md-6">
            <label for="bankaccount" class="form-label">Banco</label>
            <input min="0" type="text" id="bankaccount" class="form-control" value="Sem conta no Banco" disabled>
        </div>
      `
    } else {
      divBanco = `
        <div class="mb-3 col-md-6">
            <label for="bankaccount" class="form-label">Banco</label>
            <input min="0" type="number" id="bankaccount" class="form-control" value="${bankAccount.balance}" required>
        </div>
      `
    }
    swal({
        title: 'Editar Personagem',
        content: {
            element: 'div',
            attributes: {
                className: '',
                innerHTML: `
                    <div class='row'>
                      <div class="mb-3 col-md-6">
                          <label for="name" class="form-label">Nome</label>
                          <input type="text" id="name" class="form-control" value="${userApp.name.split('_')[0]}" required>
                      </div>
                      <div class="mb-3 col-md-6">
                          <label for="sobrenome" class="form-label">Sobrenome</label>
                          <input type="text" id="sobrenome" class="form-control" value="${userApp.name.split('_')[1]}" required>
                      </div>
                    </div>
                    <div class='row'>
                      <div class="mb-3 col-md-6">
                        <label for="nascimento" class="form-label">Nascimento</label>
                        <input type="date" id="nascimento" class="form-control" value="${converterData(userApp.birthday)}" min="1900-01-01" max="2099-09-13" required>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Gênero:</label>
                        <select id="genero" name="genero" class="form-control" required>
                            <option value="1" ${userApp.sex === 1 ? 'selected' : ''}>Masculino</option>
                            <option value="2" ${userApp.sex === 2 ? 'selected' : ''}>Feminino</option>
                        </select>
                    </div>
                    </div>
                    <div class="mb-3">
                        <label for="level" class="form-label">Nível</label>
                        <input min="0" max="3650" type="number" id="level" class="form-control" value="${userApp.level}" required>
                    </div>
                    <div class='row'>
                      <div class="mb-3 col-md-6">
                          <label for="money" class="form-label">Dinheiro</label>
                          <input min="0" type="number" id="money" class="form-control" value="${userApp.money}" required>
                      </div>
                      ${divBanco}
                    </div>
                `
            }
        },
        buttons: {
            confirm: {
                text: 'Salvar',
                value: true,
                visible: true,
                className: "btn btn-primary",
                closeModal: true
            }
        },
        focusConfirm: false,
    }).then((confirm) => {
        if (confirm) {
            const nome = document.getElementById('name').value;
            const sobrenome = document.getElementById('sobrenome').value;
            const nascimento = document.getElementById('nascimento').value;
            const genero = parseInt(document.getElementById('genero').value);
            const level = parseInt(document.getElementById('level').value);
            const money = parseInt(document.getElementById('money').value)
            const bankaccount = bankAccount === undefined ? 0 : parseInt(document.getElementById('bankaccount').value)

            const alphabeticRegex = /^[A-Za-z]+$/;

            if (
              nome.trim() === "" ||
              sobrenome.trim() === "" ||
              nascimento.trim() === "" ||
              isNaN(genero) ||
              isNaN(level) ||
              isNaN(money) ||
              isNaN(bankaccount)
            )
            {
              swal({
                    title: 'Erro de Validação',
                    text: 'Todos os campos são obrigatórios.',
                    icon: 'error',
                    button: 'OK'
                });
                return;
            }
            if (!alphabeticRegex.test(nome) || !alphabeticRegex.test(sobrenome)) {
                swal({
                    title: 'Erro de Validação',
                    text: 'Os campos Nome e Sobrenome devem conter apenas letras do alfabeto.',
                    icon: 'error',
                    button: 'OK'
                });
                return;
            }
            const today = new Date();
            const dtNascDate = new Date(nascimento);
            if (dtNascDate.toString() === "Invalid Date" || dtNascDate > today || dtNascDate < new Date("1900-01-01")) {
              swal({
                title: 'Erro de Validação',
                text: 'A Data de Nascimento não é válida ou não pode ser posterior ao dia atual nem inferior a 01/01/1900 (formato correto: dd/mm/aa).',
                icon: 'error',
                button: 'OK'
              });
              return;
            }
            if (level > 3650 || level < 0) {
              swal({
                title: 'Erro de Validação',
                text: 'Formato do nível inválido',
                icon: 'error',
                button: 'OK'
              });
              return;
            }
            const body = {
              "name": `${nome}_${sobrenome}`,
              "nascimento": reconverterData(nascimento),
              "genero": genero === 1 ? 'Masculino' : 'Feminino',
              "level": level,
              "money": money,
              "bankAccount": bankAccount === undefined ? null : bankaccount
            }

            $.ajax({
                url: `${url}/admin/characters/${userApp.id}`,
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${getCookie('tk')}`
                },
                "data": body,
                beforeSend: ()=> {

                },
                success: response => {
                  switch (response.status) {
                    case 200:
                      swal({
                        title: 'Alterado',
                        text: response.msg,
                        icon: 'success',
                        button: 'OK'
                      }).then(() => {
                        table.destroy()
                        renderTabela()

                      });
                    return;
                    case 502:
                    case 401:
                      swal({
                        title: 'Error',
                        text: response.msg,
                        icon: 'error',
                        button: 'OK'
                      });
                    return;
                    case 404:
                      swal({
                        title: 'Error',
                        text: response.msg,
                        icon: 'error',
                        button: 'OK'
                      });
                      logout()
                    return;
                    default:
                      swal({
                        title: 'Error',
                        text: 'Erro Interno, tente novamente. E98734',
                        icon: 'error',
                        button: 'OK'
                      });
                    return;
                  }
                }
            })
        }
    })
});
