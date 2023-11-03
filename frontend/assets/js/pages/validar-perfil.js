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
    const loadingAlert = swal({
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

    $.ajax({
        url: `${url}/users/${userID}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${getCookie('tk')}`
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
                        logout();
                    }
                });
            }
        },
        error: () => {
            swal.close();
        }
    });
};

const validarPerfil = ()=> {
    event.preventDefault();

    if (username.value.trim() === '') {
        showError(username, 'O nome de usuário é obrigatório');
    } else {
        removeError(username);
    }

    if (newPassword.value !== '' || confirmPassword.value !== '') {
        checkPasswordsMatch(newPassword, confirmPassword);
    }

    if (!username.parentElement.classList.contains('has-error')) {
        const body = {
            name: username.value,
            email: email.value,
        };

        if (newPassword.value !== '') {
            body.password = newPassword.value;
        }

        toggleFormLoading(true);

        try {
             $.ajax({
                "url": `${url}/users/${userID}`,
                "method": 'POST',
                "headers": {
                    'Authorization': `Bearer ${getCookie('tk')}`
                },
                "data": body,
                "success": response => {
                    if (response.status === 200) {
                        popularInputs();
                    }
                }
            });
        } catch (error) {
        } finally {
            toggleFormLoading(false);
        }
    }
};

function toggleFormLoading(isLoading) {
    if (isLoading) {
        submitButton.disabled = true;
        inputs.forEach(input => input.disabled = true);
        submitButton.innerHTML = 'Loading...';
    } else {
        submitButton.disabled = false;
        inputs.forEach(input => input.disabled = false);
        submitButton.innerHTML = 'Atualizar Perfil';
    }
}

document.querySelector('#submit').addEventListener('click', validarPerfil)

popularInputs()