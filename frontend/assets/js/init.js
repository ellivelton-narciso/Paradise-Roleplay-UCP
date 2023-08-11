const url = "http://127.0.0.1:3333/api";
const data = new Date();
const developer = '_vako_'
const servidor = 'Paradise Roleplay'
const getCookie = (k)=> {
    const cookies = " " + document.cookie;
    const token = " " + k + "=";
    const start = cookies.indexOf(token);

    if (start === -1) {
        return null;
    }

    const pos = start + token.length;
    const last = cookies.indexOf(";", pos);

    if (last !== -1) {
        return cookies.substring(pos, last);
    }

    return cookies.substring(pos);
}
const logout = ()=> {
    localStorage.removeItem('usuario');
    localStorage.removeItem('appEdita')
    localStorage.removeItem('personagensSemAplicacao')
    document.cookie = "tk= "
    location.assign('login.html')
}
const verificaLogado = () => {
    return new Promise((resolve, reject) => {
        const usuario = localStorage.getItem('usuario');
        const validToken = usuario !== null && getCookie('tk') === JSON.parse(usuario).tokenHash;

        if (!validToken) {
            resolve(false); // Token inválido ou usuário não existe
        } else {
            $.ajax({
                "url": `${url}/isValid`,
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${getCookie('tk')}`
                },
            }).done(res => {
                switch (res.status) {
                    case 200:
                        resolve(res.isLogged);
                        break;
                    default:
                        resolve(false);
                }
            }).fail(() => {
                resolve(false);
            });
        }
    });
};