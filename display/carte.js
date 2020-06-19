const tag = value => `
    <div style="display:flex;justify-content:space-between;width:max-content;align-items:center;background-color:#2E6FCC;color:white;border-radius:15px;padding:10px;margin-right:2%;margin-bottom:2%">
            <div style="margin-right:10px">${value}</div>
            <div>x</div>
    </div>`

module.exports = (media, title, tags, actions) => `
  <article class="card">
    <section class="media">
        ${media || ''}
    </section>
    <section class="description">
        <h1>${title || ''}</h1>
    </section>
    <section class="tags" style="display:flex;flex-wrap: wrap;margin-bottom:3%;">
         ${tags ? tags.reduce((acc,t) => acc + tag(t),"") : ''}
         ${tags ? '<input name="nouveau_tag" class="nouveau_tag"/><button>+</button>' :''}
    </section>
    <section class="actions">
        ${actions.reduce((acc,a) => acc + a,"")}
    </section>
  </article>`