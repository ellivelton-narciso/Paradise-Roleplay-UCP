const registerUser = async () => {
    event.preventDefault();

    const nameInput = document.querySelector("#name");
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const infoAlert = document.getElementById("infoAlert");

    nameInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    emailInput.classList.remove("is-invalid");
    infoAlert.classList.add("visually-hidden");
    infoAlert.innerHTML = "";

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    function validarEmail(e) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(e);
    }

    if (name === "") {
        nameInput.classList.add("is-invalid");
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = "Campo usuário não está preenchido.";
    } else if(email.length > 0 && !validarEmail(email)){
        emailInput.classList.add("is-invalid");
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = "Formato inválido de e-mail.";
    } else if (password === "") {
        passwordInput.classList.add("is-invalid");
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = "Campo senha não está preenchido.";
    } else {
        try {
            const body = {
                "name": name,
                "email": email,
                "password": password,
            };

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            nameInput.setAttribute("disabled", "");
            emailInput.setAttribute("disabled", "")
            passwordInput.setAttribute("disabled", "");

            const response = await fetch(`${url}/register`, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body),
            });
            const result = await response.json();

            nameInput.removeAttribute("disabled");
            emailInput.removeAttribute("disabled")
            passwordInput.removeAttribute("disabled");

            infoAlert.removeAttribute('class')
            infoAlert.setAttribute('class', 'alert alert-danger mt-3')
            infoAlert.innerHTML = result.msg;
            switch (result.status) {
                case 400:
                    nameInput.classList.add("is-invalid");
                    passwordInput.classList.add("is-invalid");
                    break;
                case 403:
                    nameInput.classList.add("is-invalid");
                    if (email.length > 0) {
                        emailInput.classList.add("is-invalid")
                    }
                    break;
                case 201:
                    infoAlert.removeAttribute('class')
                    infoAlert.setAttribute('class', 'alert alert-success mt-3')
                    nameInput.setAttribute("disabled", "");
                    emailInput.setAttribute("disabled", "")
                    passwordInput.setAttribute("disabled", "");
                    document.getElementById('submit').classList.add('disabled')
                    break;
                default:
                    nameInput.removeAttribute("disabled");
                    passwordInput.removeAttribute("disabled");
                    infoAlert.removeAttribute('class')
                    infoAlert.setAttribute('class', 'alert alert-danger mt-3')
                    infoAlert.innerHTML =
                        "Erro inesperado. Reporte a um administrador. Código: E4976";
                    break;
            }
        } catch (error) {
            nameInput.removeAttribute("disabled");
            emailInput.removeAttribute("disabled")
            passwordInput.removeAttribute("disabled");
            infoAlert.removeAttribute('class')
            infoAlert.setAttribute('class', 'alert alert-danger mt-3')
            infoAlert.innerHTML =
                "Erro inesperado. Reporte a um administrador. Código: E4975";
            console.log("error", error);
        }
    }
};

document.getElementById("submit").addEventListener("click", registerUser);
