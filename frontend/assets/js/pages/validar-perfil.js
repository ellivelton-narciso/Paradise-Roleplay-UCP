const userID = JSON.parse(localStorage.getItem('usuario')).userId
const username = document.getElementById('username');
const email = document.getElementById('email');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const form = document.querySelector('form');
const submitButton = document.querySelector('#submit');
const inputs = form.querySelectorAll('input');

const showError = (input, message) => {
    const formControl = input.parentElement;
    formControl.classList.add('has-error');

    let errorSmall = formControl.querySelector('.error-message');
    if (!errorSmall) {
        errorSmall = document.createElement('small');
        errorSmall.classList.add('error-message');
        formControl.appendChild(errorSmall);
    }
    errorSmall.innerText = message;
};

const removeError = (input) => {
    const formControl = input.parentElement;
    formControl.classList.remove('has-error');

    const errorSmall = formControl.querySelector('.error-message');
    if (errorSmall) {
        errorSmall.innerText = '';
    }
};

const checkPasswordsMatch = (password, confirmPassword) => {
    if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'As senhas não coincidem');
    } else {
        removeError(confirmPassword);
    }
};

const popularInputs = () => {
    $.ajax({
        url: `${url}/users/${userID}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getCookie('tk')}`
        },
        beforeSend: () => {
            swal({
                title: 'Loading...',
                content: {
                    element: 'div',
                    attributes: {
                        className: 'spinner-border',
                        role: 'status'
                    }
                },
                buttons: false,
                closeOnEsc: false,
                closeOnClickOutside: false,
            });
        },
        success: res => {
            swal.close();
            if (res.status === 200) {
                $('#username').val(res.name);
                if (res.email === 'Undefined') {
                    $('#email').val('');
                } else {
                    $('#email').val(res.email);
                }
            } else {
                swal({
                    text: `Erro interno. Por segurança será deslogado.`,
                    className: "custom-swal4",
                    buttons: {
                        confirm: true
                    }
                }).then((confirm) => {
                    if (confirm) {
                        return logout();
                    }
                });
            }
        },
        error: () => {
            swal.close();
        }
    });
};

const validarPerfil = () => {
    event.preventDefault();
    removeError(username)
    removeError(email)

    function validarEmail(e) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(e);
    }
    if (username.value.trim() === '') {
        showError(username, 'O nome de usuário é obrigatório');
        return;
    }

    if (email.value !== '' && !validarEmail(email.value)) {
        showError(email, 'Formato inválido de e-mail.');
        return;
    }

    if (newPassword.value !== '' || confirmPassword.value !== '') {
        checkPasswordsMatch(newPassword, confirmPassword);
        return;
    }

    const body = {
        name: username.value,
        email: email.value,
    };

    if (newPassword.value !== '') {
        body.password = newPassword.value;
    }

    console.log(body)

    $.ajax({
            "url": `${url}/users/${userID}`,
            "method": 'POST',
            "headers": {
                'Authorization': `Bearer ${getCookie('tk')}`
            },
            "data": body,
            "success": response => {
                switch (response.status) {
                    case 200:
                        popularInputs()
                        document.getElementById('userDropdown').innerHTML = response.name
                        swal({
                            title: 'Alterado',
                            text: response.msg,
                            icon: 'success',
                            button: 'OK'
                        })
                        break;
                    case 403:
                    case 401:
                        swal({
                            title: 'Erro',
                            text: response.msg,
                            icon: 'error',
                            button: 'OK'
                        })
                        break;
                    case 404:
                        swal({
                            title: 'Erro',
                            text: response.msg,
                            icon: 'error',
                            button: 'OK'
                        }).then(confirm => {
                            if (confirm) {
                                logout()
                            }
                        })
                        break;
                }
            }
        });
};

function toggleFormLoading(isLoading) {
    const submitButton = document.querySelector('#submit');
    const inputs = document.querySelectorAll('input');

    submitButton.disabled = isLoading;
    inputs.forEach((input) => {
        input.disabled = isLoading;
    });

    submitButton.innerHTML = isLoading ? 'Loading...' : 'Atualizar Perfil';
}
document.querySelector('#submit').addEventListener('click', validarPerfil)

popularInputs()