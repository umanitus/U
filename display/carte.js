const tag = value => `
    <div class="tag">
            <label>${value}</label>
            <!--<div class="close">x</div>-->
    </div>`

module.exports = (media, title, tags, actions) => `
  <article class="card">
    <section class="media">
        ${media || ''}
    </section>
    <section class="description">
        <h1>${title || ''}</h1>
    </section>
    <section class="tags">
         ${tags.reduce((acc,t) => acc + tag(t),"")}
         <input name="nouveau_tag" class="nouveau_tag"/>
         <button>+</button>
    </section>
    <section class="actions">
        ${actions.reduce((acc,a) => acc + a,"")}
    </section>
  </article>`