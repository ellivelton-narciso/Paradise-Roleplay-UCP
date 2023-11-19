const recoveryUser = async () => {
    event.preventDefault();

    const emailInput = document.querySelector("#email");
    const infoAlert = document.getElementById("erroAlert");

    emailInput.classList.remove("is-invalid");
    infoAlert.classList.add("visually-hidden");
    infoAlert.innerHTML = "";

    const email = emailInput.value;

    function validarEmail(e) {
        const emailRegex = /^[a-z0-9_.-]+@[a-z0-9.-]+\.[a-z]+$/i
        return emailRegex.test(e);
    }

    if(email.length > 0 && !validarEmail(email)){
        emailInput.classList.add("is-invalid");
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = "Formato inválido de e-mail.";
    } else {
        try {
            const body = {
                "email": email
            };

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            emailInput.setAttribute("disabled", "")

            const response = await fetch(`${url}/recovery`, {
                method: "POST",
                headers: myHeaders,
                body: JSON.stringify(body),
            });
            const result = await response.json();

            emailInput.removeAttribute("disabled")

            infoAlert.removeAttribute('class')
            infoAlert.setAttribute('class', 'alert alert-danger mt-3')
            infoAlert.innerHTML = result.msg;
            switch (result.status) {
                case 400:
                case 403:
                    emailInput.classList.add("is-invalid");
                    break;
                case 200:
                case 201:
                    const userID = result.userID
                    await sendCode(userID)

                    break;
                default:
                    infoAlert.removeAttribute('class')
                    infoAlert.setAttribute('class', 'alert alert-danger mt-3')
                    infoAlert.innerHTML =
                        "Erro inesperado. Reporte a um administrador. Código: E4976";
                    break;
            }
        } catch (error) {
            emailInput.removeAttribute("disabled")
            infoAlert.removeAttribute('class')
            infoAlert.setAttribute('class', 'alert alert-danger mt-3')
            infoAlert.innerHTML =
                "Erro inesperado. Reporte a um administrador. Código: E4975";
            console.log("error", error);
        }
    }
};

const sendCode = (id)=> {
    document.getElementById('loginForm').innerHTML = `
      <div class="form-group input-group mb-3">
        <span class="input-group-text"><i class="fa fa-lock"></i></span>
        <input type="text" class="form-control" name="code" id="code" placeholder="Código" autofocus>
      </div>
      <div id="erroAlert" class="alert alert-info mt-3" role="alert">Digite o código enviado por e-mail.</div>
      <button id="sendCode" class="btn btn-success btn-block">Enviar</button>
    `
    document.querySelector('#sendCode').addEventListener('click', async ()=> {
        event.preventDefault();
        const codeInput = document.getElementById('code')
        const infoAlert = document.getElementById("erroAlert");

        const codeValue = codeInput.value
        const regexCOde = /^[A-Z0-9]+$/;
        if(!regexCOde.test(codeValue)) {
            codeInput.classList.add("is-invalid");
            infoAlert.removeAttribute('class')
            infoAlert.setAttribute('class', 'alert alert-danger mt-3')
            document.querySelector('#erroAlert').innerHTML = 'Formato do código inválido'
            return;
        }
        const body = {
            "code": codeValue
        };
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        codeInput.setAttribute("disabled", "")
        const response = await fetch(`${url}/recovery/code/${id}`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
        });

        const res = await response.json();
        codeInput.removeAttribute("disabled")
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = res.msg

        switch (res.status) {
            case 400:
            case 401:
            case 403:
                codeInput.classList.add("is-invalid");
                break;
            case 200:
                    await changePass(id, res.code)
                break;
            default:
                codeInput.classList.add("is-invalid");
                infoAlert.innerHTML = "Erro inesperado. Reporte a um administrador. Código: E4975";
                break;
        }
    })

}

const changePass = async (id, code) => {
    document.getElementById('loginForm').innerHTML = `
      <div class="form-group input-group mb-3">
        <span class="input-group-text"><i class="fa fa-lock"></i></span>
        <input type="text" class="form-control" name="pass" id="pass" placeholder="Nova Senha" autofocus>
      </div>
      <div id="erroAlert" class="alert alert-info mt-3 visually-hidden" role="alert">Digite a nova senha</div>
      <button id="changePass" class="btn btn-success btn-block">Enviar</button>
    `
    document.querySelector('#changePass').addEventListener('click', async ()=> {
        event.preventDefault();
        const nSenhaInput = document.getElementById('pass')
        const infoAlert = document.getElementById("erroAlert");

        const novaSenhaInput = nSenhaInput.value
        const body = {
            "password": novaSenhaInput,
            "code": code
        };

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        nSenhaInput.setAttribute("disabled", "")

        const response = await fetch(`${url}/recovery/${id}`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(body),
        });
        const recoveryLast = await response.json();
        nSenhaInput.removeAttribute("disabled")
        infoAlert.removeAttribute('class')
        infoAlert.setAttribute('class', 'alert alert-danger mt-3')
        infoAlert.innerHTML = recoveryLast.msg

        switch (recoveryLast.status) {
            case 400:
            case 401:
            case 403:
                nSenhaInput.classList.add("is-invalid");
                break;
            case 200:
                    document.querySelector('#changePass').classList.add('disabled')
                    nSenhaInput.setAttribute("disabled", "")
                    infoAlert.removeAttribute('class')
                    infoAlert.setAttribute('class', 'alert alert-success mt-3')
                break;
            default:
                nSenhaInput.classList.add("is-invalid");
                infoAlert.innerHTML = "Erro inesperado. Reporte a um administrador. Código: E4975";
                break;
        }

    })
}

document.getElementById("submit").addEventListener("click", recoveryUser);
