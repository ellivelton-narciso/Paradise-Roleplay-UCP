import {language} from "../traducaoTabela.js";

const userID = JSON.parse(localStorage.getItem('usuario')).userId;
const personagensStorage = JSON.parse(localStorage.getItem('usuario')).character
const qtdPersonagens = personagensStorage.filter(k => k !== -1).length

document.getElementById('qtdPersonagens').innerHTML = `${qtdPersonagens}/${personagensStorage.length}`

$.ajax({
    url: `${url}/aplicacoes/user/${userID}`,
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
                const data = res.aplicacoes;
                const table = $('<table id="tabela" class="table table-striped table-bordered"></table>').appendTo('.table-responsive');

                table.DataTable({
                    data: data,
                    columns: [
                        { data: 'nome', title: 'Nome' },
                        { data: 'sobrenome', title: 'Sobrenome' },
                        {
                            data: 'sexo',
                            title: 'Sexo',
                            render: function (data) {
                                return data === 1 ? 'Masculino' : 'Feminino';
                            }
                        },
                        {
                            data: 'status',
                            title: 'Status',
                            render: function (data) {
                                if (data === -1) {
                                    return 'Não revisado';
                                } else if (data === 0) {
                                    return 'Negado';
                                } else if (data === 1) {
                                    return 'Aprovado';
                                } else {
                                    return '';
                                }
                            }
                        },
                        {
                            data: 'mensagem',
                            title: 'Mensagem',
                            render: function (data) {
                                const trimmedMessage = data.split(' ').slice(0, 100).join(' ');
                                return trimmedMessage + (data.length > trimmedMessage.length ? '...' : '');
                            }
                        },
                        {
                            data: 'status',
                            title: 'Opções',
                            render: function (data) {
                                return '<div class="text-center"><a class="btn btn-primary"><i class="fas fa-search"></i></a></div>';
                            }
                        }
                    ],
                    language: language
                });
                table.on('click', '.btn-primary', function () {
                    const table = $('#tabela').DataTable();
                    const rowData = table.row($(this).parents('tr')).data();
                    const appId = rowData.id;

                    const appEdit = data.filter(filtro => filtro.id === appId)
                    localStorage.setItem('appEdita', JSON.stringify(appEdit[0]))

                    window.location.href = 'personagem-criar.html';
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