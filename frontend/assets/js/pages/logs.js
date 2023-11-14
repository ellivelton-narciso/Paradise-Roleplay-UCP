import {language} from "../traducaoTabela.js";
const today = new Date().getTime()
const diferencaDiasQntd = (timestamp1, timestamp2) => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  const differenceInMilliseconds = date2.getTime() - date1.getTime();
  const differenceInDays = Math.floor(differenceInMilliseconds / (24 * 60 * 60 * 1000));

  if (differenceInDays < 365) {
    if (differenceInDays === 1) {
        return `${differenceInDays} dia`;
    }
    return `${differenceInDays} dias`;
  } else {
    const years = Math.floor(differenceInDays / 365);
    if (years === 1) {
        return `${years} ano`;
    }
    return `${years} anos`;
  }
}
$.ajax({
    url: `${url}/users`,
    method: "GET",
    headers: {
        "Authorization": `Bearer ${getCookie('tk')}`
    },
    success: userList => {
        const userMap = {};
        userList.contas.forEach(user => {
            userMap[user.id] = user.name;
        });
        $.ajax({
            url: `${url}/logs`,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${getCookie('tk')}`
            },
            beforeSend: () => {
                $('#loading').show();
            },
            success: res => {
                $('#loading').hide();
                switch (res.status) {
                    case 200:
                        const logs = res.logs;
                        let sectionAlt;
                        const table = $('<table id="tabela" class="table table-striped table-bordered"></table>').appendTo('.table-responsive');
                        table.DataTable({
                            data: logs,
                            columns: [
                                {
                                    data: 'id_admin',
                                    title: 'Admin',
                                    render: function(data) {
                                        return userList.contas.filter((filtro)=> filtro.id === data ? filtro.name : 'Sem nome')[0].name

                                    }
                                },
                                {
                                    data: 'id_user',
                                    title: 'Usuário',
                                    render: function(data) {
                                      return userList.contas.filter((filtro)=> filtro.id === data ? filtro.name : 'Sem nome')[0].name
                                    }
                                },
                                {
                                    data: 'section',
                                    title: 'Seção alterada',
                                    render: function(data) {
                                        sectionAlt = data
                                        return data
                                    }
                                },
                              {
                                    data: 'alterado',
                                    title: 'Antigo',
                                    render: function(data) {
                                        let dataJSON;
                                        switch (sectionAlt) {
                                            case 'Atualizar Usuário':
                                                dataJSON = JSON.parse(data).antigo
                                              if (dataJSON) {
                                                  let vip;
                                                switch (dataJSON.vip) {
                                                    case 0:
                                                        vip = 'Sem Vip';
                                                        break;
                                                    case 1:
                                                        vip = 'Basic';
                                                        break;
                                                    case 2:
                                                        vip = 'Plus';
                                                        break;
                                                    case 3:
                                                        vip = 'Ultra';
                                                        break;
                                                }
                                                let admin;
                                                switch (dataJSON.admin) {
                                                    case 0:
                                                        admin = 'Player';
                                                        break;
                                                    case 1:
                                                        admin = 'Admin';
                                                        break
                                                    case 2:
                                                        admin = 'Master'
                                                    break;

                                                }
                                                return `
                                                    <div>
                                                        <div>
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nome</span>: ${dataJSON.name}</p> | 
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'> ${admin}</p>
                                                        </div>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Email</span>: ${dataJSON.email}</p>
                                                        <div>
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>VIP</span>: ${vip}</p> | 
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'> ${diferencaDiasQntd(today, dataJSON.viptime)}</p>
                                                        </div>
                                                    </div>
                                                `
                                              }
                                              return ''
                                            case 'Atualizar personagem':
                                                dataJSON = JSON.parse(data).antigo
                                                if (dataJSON) {
                                                    let sex;
                                                if (dataJSON.sex === 1) {
                                                    sex = 'Masculino'
                                                } else {
                                                    sex = 'Feminino'
                                                }
                                                return `
                                                    <div>
                                                        <div>
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nome</span>: ${dataJSON.name}</p> |
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Level</span>: ${dataJSON.level}</p>
                                                        </div>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nascimento</span>: ${dataJSON.birthday}</p>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Genero</span>: ${sex}</p>
                                                        <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Dinheiro</span>: ${dataJSON.money}</p>
                                                        <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Dinheiro</span>: ${dataJSON.bankAccount}</p>
                                                        
                                                    </div>
                                                `
                                                }
                                                return ''
                                            case 'Aplicação de personagem':
                                                return `<p style='margin-bottom: 2px; font-size: 13px; font-weight: bold'>Não se aplica</p>`
                                            default:
                                                return ''
                                        }

                                    }
                                },
                                {
                                    data: 'alterado',
                                    title: 'Novo',
                                    render: function(data) {
                                        let dataJSON;
                                        switch (sectionAlt) {
                                            case 'Atualizar Usuário':
                                                dataJSON = JSON.parse(data).novo
                                                if (dataJSON) {
                                                    let vip;
                                                    switch (parseInt(dataJSON.vip)) {
                                                        case 0:
                                                            vip = 'Sem Vip';
                                                            break;
                                                        case 1:
                                                            vip = 'Basic';
                                                            break;
                                                        case 2:
                                                            vip = 'Plus';
                                                            break;
                                                        case 3:
                                                            vip = 'Ultra';
                                                            break;
                                                    }
                                                    let admin;
                                                    switch (dataJSON.admin) {
                                                        case 0:
                                                            admin = 'Player';
                                                            break;
                                                        case 1:
                                                            admin = 'Admin';
                                                            break
                                                        case 2:
                                                            admin = 'Master'
                                                        break;
                                                    }
                                                    return `
                                                        <div>
                                                            <div>
                                                              <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nome</span>: ${dataJSON.name}</p> | 
                                                              <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'> ${admin}</p>
                                                            </div>
                                                            <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Email</span>: ${dataJSON.email}</p>
                                                            <div>
                                                              <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>VIP</span>: ${vip}</p> | 
                                                              <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'> ${diferencaDiasQntd(today, parseInt(dataJSON.viptime))}</p>
                                                            </div>
                                                        </div>
                                                    `
                                                }
                                                return ''
                                            case 'Atualizar personagem':
                                                dataJSON = JSON.parse(data).novo
                                                if (dataJSON){
                                                    let sex;
                                                if (dataJSON.sex === 1) {
                                                    sex = 'Masculino'
                                                } else {
                                                    sex = 'Feminino'
                                                }
                                                return `
                                                    <div>
                                                        <div>
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nome</span>: ${dataJSON.name}</p> |
                                                          <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Level</span>: ${dataJSON.level}</p>
                                                        </div>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Nascimento</span>: ${dataJSON.birthday}</p>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Genero</span>: ${sex}</p>
                                                        <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Dinheiro</span>: ${dataJSON.money}</p>
                                                        <p style='display: inline-block; margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Dinheiro</span>: ${dataJSON.bankAccount}</p>
                                                        
                                                    </div>
                                                `
                                                }
                                                return ''
                                            case 'Aplicação de personagem':
                                                dataJSON = JSON.parse(data)
                                                if (dataJSON) {
                                                    return `
                                                      <div>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Status: </span> ${dataJSON.aprovado}</p>
                                                        <p style='margin-bottom: 2px; font-size: 13px'><span style='font-weight: bold'>Mensagem</span>: ${dataJSON.message}</p>
                                                      </div>    
                                                    `
                                                }
                                                return ''
                                        }
                                    }
                                }
                            ],
                            language: language
                        });
                        table.on('click', '.btn-primary', function () {
                            const table = $('#tabela').DataTable();
                            const rowData = table.row($(this).parents('tr')).data();
                            const appId = rowData.id;

                            const avaliacaoApp = data.filter(filtro => filtro.id === appId)
                            localStorage.setItem('avaliacaoApp', JSON.stringify(avaliacaoApp[0]))

                            window.location.href = 'personagem-avaliar.html';
                        });
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
})