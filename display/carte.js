const tag = value => `
    <div class="tag">
            <label>${value}</label>
            <!--<div class="close">x</div>-->
    </div>`
const jouer = require("./jouer.js");
const servir = require("./servir.js");
module.exports = (produit, role) => `
  <article class="card">
    <section class="media">
        <label for="media-${produit && produit.id ? produit.id : ''}">
            <img for="media-${produit && produit.id ? produit.id : ''}" src="${produit ? produit.image : ''}"/>
        </label>
        <input accept="image/*,video/*" capture="camera" id="media-123" style="display:none" id="files-upload" type="file" multiple>
    </section>
    <section class="description">
        <h1>${produit.description}</h1>
    </section>
    <section class="tags">
         ${produit.tags.reduce((acc,t) => acc + tag(t),"")}
         <input name="nouveau_tag" class="nouveau_tag"/>
         <button>+</button>
    </section>
    <section class="actions">
        ${ role == "CLIENT" ? jouer(produit.id) : servir(produit.id)}
    </section>
  </article>`