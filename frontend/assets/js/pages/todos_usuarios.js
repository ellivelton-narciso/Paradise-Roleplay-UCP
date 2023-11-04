import {language} from "../traducaoTabela.js";

const table = $('<table id="tabela" class="table table-striped table-bordered"></table>').appendTo('.table-responsive');
let dataTable;

const renderTabela = ()=> {
    $.ajax({
        url: `${url}/users`,
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
                    dataTable = res.contas;
                    table.DataTable({
                        data: dataTable,
                        columns: [
                            { data: 'name', title: 'Usuário' },
                            {
                                data: 'email',
                                title: 'E-mail',
                                render: function (data) {
                                    return data === 'Undefined' ? 'Sem email' : data
                                }
                            },
                            {
                                data: 'ip',
                                title: 'IP',
                                render: function (data) {
                                    if (data === 'N/A' || data === '') {
                                        return ''
                                    } else {
                                        return data
                                    }
                                }
                            },
                            {
                                data: 'vip',
                                title: 'VIP',
                                render: function (data) {
                                    switch (data) {
                                        case 0:
                                            return 'Sem Vip';
                                        case 1:
                                            return 'Basic';
                                        case 2:
                                            return 'Plus';
                                        case 3:
                                            return 'Ultra';
                                    }
                                }
                            },
                            {
                                data: 'viptime',
                                title: 'Tempo de VIP',
                                render: function (data) {
                                    if (data === 0) {
                                        return '0 dias';
                                    }

                                    const segundos = data / 1000;
                                    const dias = segundos / (60 * 60 * 24);

                                    if (dias >= 365) {
                                        const anos = Math.floor(dias / 365);
                                        return `${anos} ano${anos > 1 ? 's' : ''}`;
                                    } else {
                                        return `${Math.floor(dias)} dia${dias > 1 ? 's' : ''}`;
                                    }
                                }
                            },
                            {
                                data: 'admin',
                                title: 'Admin',
                                render: function (data) {
                                    return data === 1 ? "Sim" : "Não"
                                }
                            },
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
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    const table = $('#tabela').DataTable();
    const rowData = table.row($(this).parents('tr')).data();
    const idClicado = rowData.id;
    const userApp = dataTable.filter(filtro => filtro.id === idClicado)[0]

    const vipLevelTexts = ['Sem VIP', 'Basic', 'Plus', 'Ultra'];
    const vipLevelValue = userApp.vip;

    const emailValue = userApp.email === 'Undefined' ? '' : userApp.email;

    swal({
        title: 'Editar Usuário',
        content: {
            element: 'div',
            attributes: {
                className: '',
                innerHTML: `
                                <div class="mb-3">
                                    <label for="name" class="form-label">Nome</label>
                                    <input type="text" id="name" class="form-control" value="${userApp.name}">
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">E-mail</label>
                                    <input type="email" id="email" class="form-control" value="${emailValue}">
                                    <div class="invalid-feedback" id="emailError"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="password" class="form-label">Senha</label>
                                    <input type="password" id="password" class="form-control">
                                </div>
                                <div class="mb-3">
                                    <label for="vip" class="form-label">VIP</label>
                                    <select id="vip" class="form-select">
                                        ${vipLevelTexts.map((text, index) => `
                                            <option value="${index}" ${vipLevelValue === index ? 'selected' : ''}>${text}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="vipDuration" class="form-label">Tempo de VIP</label>
                                    <input min="0" max="3650" type="number" id="vipDuration" class="form-control" value="${(userApp.viptime / 1000) / (24 * 60 * 60) >> 0 }">
                                </div>
                                <div class="mb-3 form-check">
                                    <input type="checkbox" id="admin" class="form-check-input" ${userApp.admin ? 'checked' : ''}>
                                    <label for="admin" class="form-check-label">Admin</label>
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
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const vip = parseInt(document.getElementById('vip').value);
            const vipDuration = parseInt(document.getElementById('vipDuration').value) * 24 * 60 * 60 * 1000;
            const admin = document.getElementById('admin').checked ? 1 : 0

            if (email && !validateEmail(email)) {
                swal({
                    title: 'Erro de Validação',
                    text: 'Por favor, insira um e-mail válido.',
                    icon: 'error',
                    button: 'OK'
                });
                return;
            }
            if (vip > 0 && vipDuration === 0) {
                swal({
                    title: 'Erro ao aplicar VIP',
                    text: 'Você deve inserir a quantidade de dias para o vip.',
                    icon: 'error',
                    button: 'OK'
                });
            }

            if (name.length < 3) {
                swal({
                    title: 'Erro de Validação',
                    text: 'O nome de usuário deve ter pelo menos 3 letras.',
                    icon: 'error',
                    button: 'OK'
                });
                return;
            }
            const body = {
                "name": name,
                "email": email,
                "vip": vip,
                "viptime": vipDuration,
                "admin": admin
            }

            if (password !== '') {
                body.password = password
            }
            $.ajax({
                url: `${url}/admin/users/${userApp.id}`,
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