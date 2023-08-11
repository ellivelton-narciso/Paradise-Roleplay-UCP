const footerComponent = `
<div class="container">
    <div class="row">
      <div class="col-lg-5 col-md-5 col-sm-12">
        <h4>Informações</h4>
        <p>
          Este painel de controle é feito para os jogadores de <span id="servidorNome"></span>, foi feito para que usuários consigam controlar suas contas.
          <br><br>
          Qualquer erro neste painel, entre em contato com _vako_ no Discord juntamente com o código de erro apresentado ou abra um ticket de suporte no nosso servidor do Discord.
        </p>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <h4>Links Rápidos</h4>
        <ul class="list-unstyled">
          <li><a href="https://discord.gg/MymDXAdexs" target="_blank">Discord</a></li>
        </ul>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <h4>Redes Sociais</h4>
        <ul class="list-inline">
          <li class="list-inline-item"><a href="#" target="_blank"><i class="fab fa-facebook"></i></a></li>
          <li class="list-inline-item"><a href="#" target="_blank"><i class="fab fa-twitter"></i></a></li>
          <li class="list-inline-item"><a href="#" target="_blank"><i class="fab fa-instagram"></i></a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="container text-center">
    &copy; 2022 - <span id="anoAtual"></span>. Todos os direitos reservados.<br>
    <i>Painel de controle feito por <span id="developer"></span>.</i>
  </div>
`

export const renderFooter = ()=> {
    return document.querySelector('footer').innerHTML = footerComponent
}