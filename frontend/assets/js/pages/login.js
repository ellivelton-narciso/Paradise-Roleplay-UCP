const loginUser = async () => {
    event.preventDefault();

    const nameInput = document.querySelector("#name");
    const passwordInput = document.querySelector("#password");
    const erroAlert = document.getElementById("erroAlert");

    nameInput.setAttribute('disabled', '')
    passwordInput.setAttribute('disabled', '')
    document.getElementById("submit").classList.add('disabled')

    nameInput.classList.remove("is-invalid");
    passwordInput.classList.remove("is-invalid");
    erroAlert.classList.add("visually-hidden");
    erroAlert.innerHTML = "";

    const name = nameInput.value;
    const password = passwordInput.value;

    if (name === "") {
        nameInput.removeAttribute('disabled')
        passwordInput.removeAttribute('disabled')
        document.getElementById("submit").classList.remove('disabled')
        nameInput.classList.add("is-invalid");
        erroAlert.classList.remove("visually-hidden");
        erroAlert.innerHTML = "Campo usuário não está preenchido.";
    } else if (password === "") {
        nameInput.removeAttribute('disabled')
        passwordInput.removeAttribute('disabled')
        document.getElementById("submit").classList.remove('disabled')
        passwordInput.classList.add("is-invalid");
        erroAlert.classList.remove("visually-hidden");
        erroAlert.innerHTML = "Campo senha não está preenchido.";
    } else {
        try {
            const body = {
                name: name,
                password: password,
            };

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            nameInput.setAttribute("disabled", "");
            passwordInput.setAttribute("disabled", "");

            const response = await fetch(`${url}/login`, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const result = await response.json();
                erroAlert.classList.remove("visually-hidden");
                erroAlert.innerHTML = result.msg;
                if (response.status === 401) {
                    nameInput.classList.add("is-invalid");
                    passwordInput.classList.add("is-invalid");
                }
            } else {
                const usuario = await response.json();
                const token = usuario.user.tokenHash;
                const expiresToken = new Date(usuario.user.expiresAt)
                const expires = expiresToken.toGMTString()
                document.cookie = "tk=" + token + "; expires=" + expires + "";
                localStorage.usuario = JSON.stringify(usuario.user);
                location.assign("index.html");
            }

            nameInput.removeAttribute("disabled");
            passwordInput.removeAttribute("disabled");
            document.getElementById("submit").classList.remove('disabled')
        } catch (error) {
            nameInput.removeAttribute("disabled");
            passwordInput.removeAttribute("disabled");
            erroAlert.classList.remove("visually-hidden");
            document.getElementById("submit").classList.remove('disabled')
            erroAlert.innerHTML =
                "Erro inesperado. Reporte a um administrador. Código: E4975";
            console.log("error", error);
        }
    }
};

document.getElementById("submit").addEventListener("click", loginUser);
