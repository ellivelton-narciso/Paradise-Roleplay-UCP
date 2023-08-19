const nomeInput = $('#nome');
const sobrenomeInput = $('#sobrenome');
const dataNascimentoInput = $('#data_nascimento');
const generoInput = $('#genero');
const localNascInput = $('#local_nascimento');
const historiaInput = $('#historia');
const mensagemInput = $('#mensagem');
const erroAlert = $("#erroAlert");
const inputs = [nomeInput, sobrenomeInput, dataNascimentoInput, generoInput, localNascInput, historiaInput];

const disableAll = () => {
    inputs.forEach(input => {
        input.attr('disabled', '');
    });
};

const personagensSemAplicacao = JSON.parse(localStorage.getItem('personagensSemAplicacao'));
const appEditar = JSON.parse(localStorage.getItem('appEdita'));

if (personagensSemAplicacao !== null) {
    nomeInput.val(personagensSemAplicacao[0].name.split('_')[0]);
    sobrenomeInput.val(personagensSemAplicacao[0].name.split('_')[1]);
    dataNascimentoInput.val(`${personagensSemAplicacao[0].birthday.split('/')[2]}-${personagensSemAplicacao[0].birthday.split('/')[1]}-${personagensSemAplicacao[0].birthday.split('/')[0]}`);
    generoInput.val(personagensSemAplicacao[0].sex).change();

    nomeInput.attr('disabled', '');
    sobrenomeInput.attr('disabled', '');
    dataNascimentoInput.attr('disabled', '');
    generoInput.attr('disabled', '');
}

if (appEditar !== null) {
    $('#mensagemDiv').removeClass('visually-hidden');
    nomeInput.val(appEditar.nome);
    sobrenomeInput.val(appEditar.sobrenome);
    dataNascimentoInput.val(`${appEditar.nascimento.split('/')[2]}-${appEditar.nascimento.split('/')[1]}-${appEditar.nascimento.split('/')[0]}`);
    generoInput.val(appEditar.sexo).change();
    localNascInput.val(appEditar.origem);
    historiaInput.val(appEditar.historia);
    mensagemInput.val(appEditar.mensagem);

    if (appEditar.status !== 0) {
        disableAll();
        erroAlert.text("Aplicação não está disponível para ser editada.");
        $('#editarbtn').html('');
        erroAlert.removeClass("visually-hidden");
        $('#enviarAplicacao').remove();
    }

    mensagemInput.attr('disabled', '');
}

const formatarData = data => {
    const dataObj = new Date(data);
    const dia = String(dataObj.getDate()).padStart(2, "0");
    const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
    const ano = String(dataObj.getFullYear());
    return `${dia}/${mes}/${ano}`;
};

const novaAplicacao =  () => {
    event.preventDefault();
    inputs.forEach(input => {
        input.removeClass("is-invalid");
    });

    const nome = nomeInput.val();
    const sobrenome = sobrenomeInput.val();
    const dtNasc = dataNascimentoInput.val();
    const genero = generoInput.val();
    const localNasc = localNascInput.val();
    const historia = historiaInput.val();

    erroAlert.addClass("visually-hidden");

    const alphabeticRegex = /^[A-Za-z]+$/;
    const locationRegex = /^[A-Za-z,–\s]+(?!\s)$/;

    if (
        nome.trim() === "" ||
        sobrenome.trim() === "" ||
        dtNasc.trim() === "" ||
        genero.trim() === "" ||
        localNasc.trim() === "" ||
        historia.trim() === ""
    ) {
        erroAlert.text("Todos os campos são obrigatórios.");
        erroAlert.removeClass("visually-hidden");
        inputs.forEach(input => {
            input.addClass("is-invalid");
        });
        return;
    }

    if (!alphabeticRegex.test(nome) || !alphabeticRegex.test(sobrenome)) {
        erroAlert.text("Os campos Nome e Sobrenome devem conter apenas letras do alfabeto.");
        erroAlert.removeClass("visually-hidden");
        nomeInput.addClass("is-invalid");
        sobrenomeInput.addClass("is-invalid");
        return;
    }

    const dataNascimento = formatarData(dataNascimentoInput.val());
    const today = new Date();
    const dtNascDate = new Date(dtNasc);

    if (
        dtNascDate.toString() === "Invalid Date" ||
        dtNascDate > today || dtNascDate < new Date("1900-01-01")
    ) {
        erroAlert.text("A Data de Nascimento não é válida ou não pode ser posterior ao dia atual nem inferior a 01/01/1900 (formato correto: dd/mm/aa).");
        erroAlert.removeClass("visually-hidden");
        dataNascimentoInput.addClass("is-invalid");
        return;
    }

    if (!locationRegex.test(localNasc)) {
        erroAlert.text("O campo Local de Nascimento não pode conter caracteres especiais, apenas vírgulas e traços.");
        erroAlert.removeClass("visually-hidden");
        localNascInput.addClass("is-invalid");
        return;
    }

    const body = {
        "nome": personagensSemAplicacao !== null && personagensSemAplicacao.length > 0 ? personagensSemAplicacao[0].name.split('_')[0] : nome,
        "sobrenome": personagensSemAplicacao !== null && personagensSemAplicacao.length > 0 ? personagensSemAplicacao[0].name.split('_')[1] : sobrenome,
        "nascimento": personagensSemAplicacao !== null && personagensSemAplicacao.length > 0 ? personagensSemAplicacao[0].birthday : dataNascimento,
        "origem": localNasc,
        "sexo": Number(genero),
        "historia": historia
    };

    if (appEditar !== null && appEditar.status === 0) {
        body.idEdita = appEditar.id
    }
    
    console.log(body)

    const userID = JSON.parse(localStorage.usuario).userId;

    $.ajax({
        "url": `${url}/characters/${userID}/register`,
        "method": "POST",
        "headers": {
            "Authorization": `Bearer ${getCookie('tk')}`,
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(body),
        "beforeSend": function () {
            $('#enviarAplicacao').addClass('disabled');
        }
    })
        .done(res => {
            $('#enviarAplicacao').removeClass('disabled');

            switch (res.status) {
                case 403:
                    erroAlert.text(res.msg);
                    erroAlert.removeClass("visually-hidden");
                    break;
                case 401:
                    alert('Sessão expirada');
                    logout();
                    break;
                case 500:
                    erroAlert.text(res.msg);
                    erroAlert.removeClass("visually-hidden");
                    console.log(res.erro);
                    break;
                case 201:
                    erroAlert.text(res.msg);
                    erroAlert.removeClass("visually-hidden");
                    erroAlert.removeClass('alert-danger');
                    erroAlert.addClass('alert-success');
                    disableAll();
                    $('#enviarAplicacao').addClass('disabled');
                    localStorage.removeItem('appEdita');
                    localStorage.removeItem('personagensSemAplicacao');
                    break;
                default:
                    erroAlert.text("Erro desconhecido, reporte para um administrador! E3982");
                    erroAlert.removeClass("visually-hidden");
            }
        });
};

$('#enviarAplicacao').click(()=> {
    novaAplicacao()
});
