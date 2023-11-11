const headerComponent = `
<div class="container">
    <a class="navbar-brand" href="index.html">
      <img src="assets/img/logo.png" alt="Logo" width="40" height="40" class="d-inline-block align-top">
      User Control Panel
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="https://discord.gg/MymDXAdexs">Discord</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://paradiseroleplay.forumeiros.com/">Fórum</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="login.html">Entrar</a>
        </li>
      </ul>
    </div>
  </div>
`
const navBarLogado = `
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="https://discord.gg/MymDXAdexs">Discord</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="https://paradiseroleplay.forumeiros.com/">Fórum</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="loja.html">Loja</a>
          </li>
           <li class="nav-item">
            <a class="nav-link" href="index.html">Personagens</a>
          </li>
          <li id="aplicacoes"></li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" id="userDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              User
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
              <li><a class="dropdown-item" href="perfil.html">Minha conta</a></li>
              <li><a class="dropdown-item" href="todas_aplicacoes.html">Minhas aplicações</a></li>
              <li><a class="dropdown-item" href="loja.html">Loja</a></li>
              <li id="logout"><a class="dropdown-item"  onclick="logout()">Logout</a></li>
            </ul>
          </li>
        </ul>
    `
export const renderHeader = ()=> {
    return document.querySelector('nav#navBar').innerHTML = headerComponent
}

export const alteraHeader = ()=> {
    verificaLogado().then((isLoggedIn) => {
        if(isLoggedIn) {
            document.getElementById('navbarNav').innerHTML = navBarLogado
            document.getElementById('userDropdown').innerHTML = JSON.parse(localStorage.getItem('usuario')).name
            $.ajax({
                "url": `${url}/isadmin`,
                "method": "GET",
                "headers": {
                    "Authorization": `Bearer ${getCookie('tk')}`
                },
            }).done((res) =>{
                if (res.isAdmin) {
                    const itemAplicacoes = document.getElementById('aplicacoes')
                    itemAplicacoes.setAttribute('class', 'nav-item')
                    itemAplicacoes.innerHTML = `<li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" id="adminDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              Admin
            </a>
            <ul class="dropdown-menu" aria-labelledby="adminDropdown">
              <li><a class="dropdown-item" href="aplicacoes.html">Aplicações</a></li>
              <li><a class="dropdown-item" href="todos_usuarios.html">Todos os usuários</a></li>
              <li><a class="dropdown-item" href="todos_personagens.html">Todos os personagens</a></li>
            </ul>
          </li>`
                }
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}