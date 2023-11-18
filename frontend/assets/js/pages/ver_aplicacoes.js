import {language} from "../traducaoTabela.js";

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
            url: `${url}/aplicacoes`,
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
                        const data = res.aplicacoes.filter(filtro => filtro.status == '1')
                        const table = $('<table id="tabela" class="table table-striped table-bordered"></table>').appendTo('.table-responsive');

                        table.DataTable({
                            data: data,
                            columns: [
                                {
                                    data: 'user_id',
                                    title: 'Usuário',
                                    render: function (data) {
                                        return userMap[data] || 'Usuário Desconhecido';

                                    }
                                },
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
                                    data: 'historia',
                                    title: 'História',
                                    render: function (data) {
                                        const trimmedMessage = data.split(' ').slice(0, 8).join(' ');
                                        return trimmedMessage + (data.length > trimmedMessage.length ? '...' : '');
                                    }
                                },
                                {
                                    data: 'status',
                                    title: 'Opções',
                                    render: function () {
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
                            localStorage.setItem('back', JSON.stringify({url: 'ver_aplicacoes.html'}))

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
    }
})