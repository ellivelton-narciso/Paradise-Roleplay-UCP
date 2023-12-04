const userID = JSON.parse(localStorage.getItem('usuario')).userId
const nomeInput = $('#nome')
const sobrenomeInput = $('#sobrenome')
const dataNascimentoInput = $('#data_nascimento')
const generoInput = $('#genero')
const localNascInput = $('#local_nascimento')
const historiaInput = $('#historia')
const mensagemInput = $('#mensagem')
const erroAlert = document.getElementById("erroAlert");
const inputs = [nomeInput, sobrenomeInput, dataNascimentoInput, generoInput, localNascInput, historiaInput];
const disableAll = ()=>{
    inputs.forEach((input) => {
        input.attr('disabled', "")
    });
}
const avaliacaoApp = JSON.parse(localStorage.getItem('avaliacaoApp'))
if (avaliacaoApp !== null) {
    nomeInput.val(avaliacaoApp.nome)
    sobrenomeInput.val(avaliacaoApp.sobrenome)
    dataNascimentoInput.val(`${avaliacaoApp.nascimento.split('/')[2]}-${avaliacaoApp.nascimento.split('/')[1]}-${avaliacaoApp.nascimento.split('/')[0]}`)
    generoInput.select().val(avaliacaoApp.sexo)
    localNascInput.val(avaliacaoApp.origem)
    historiaInput.val(avaliacaoApp.historia)
    disableAll()

}

const avaliarAplicacao = (status) => {
    event.preventDefault()
    if (status !== 1 && status !== 0) {
        logout()
        return;
    }
    const mensagem = mensagemInput.val()
    if (mensagem === '') {
        erroAlert.textContent = "É obrigatorio inserir uma mensagem para o usuário.";
        erroAlert.classList.remove("visually-hidden");
        mensagemInput.classList.add("is-invalid");
        return;
    }
    const body = {
        "idAdm": userID,
        "status": status,
        "resposta": mensagem
    }
    $.ajax({
        url: `${url}/characters/avaliacao/${avaliacaoApp.id}`,
        method: 'POST',
        "headers": {
            "Authorization": `Bearer ${getCookie('tk')}`,
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(body),
        "beforeSend": function () {
            document.querySelector('#negarAplicacao').classList.add('disabled')
            document.querySelector('#aprovarAplicacao').classList.add('disabled')
        },
        success: res => {
            document.querySelector('#negarAplicacao').classList.remove('disabled')
            document.querySelector('#aprovarAplicacao').classList.remove('disabled')
            erroAlert.classList.remove("visually-hidden");
            erroAlert.textContent = res.msg;
            switch (res.status) {
                case 200:
                case 201:
                    document.querySelector('#negarAplicacao').classList.add('disabled')
                    document.querySelector('#aprovarAplicacao').classList.add('disabled')
                    erroAlert.classList.remove('alert-danger')
                    erroAlert.classList.add('alert-success')
                    return;
                case 403:
                    document.querySelector('#negarAplicacao').classList.add('disabled')
                    document.querySelector('#aprovarAplicacao').classList.add('disabled')
                    return;
                case 500:
                    document.querySelector('#negarAplicacao').classList.add('disabled')
                    document.querySelector('#aprovarAplicacao').classList.add('disabled')
                    return;
                default:
                    logout()
                    return;
            }
        }
    })
}
document.querySelector('#negarAplicacao').addEventListener('click', () => {
    avaliarAplicacao(0);
});
document.querySelector('#aprovarAplicacao').addEventListener('click', ()=> {
    avaliarAplicacao(1)
})