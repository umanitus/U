const style = "display:flex;justify-content:space-between;width:max-content;align-items:center;background-color:#2E6FCC;color:white;border-radius:15px;padding:10px;margin-right:2%;margin-bottom:2%";
const tag = value => `
    <div style=${style}>
            <div style="margin-right:10px">${value}</div>
            <div>x</div>
    </div>`
const input = () => `
    <div style=${style}>
    <input name="nouveau_tag" list="tags" class="nouveau_tag"/>
    <datalist id="tags">
        <option value="pour dormir">
        <option value="à jouer">
        <option value="à voir">
        <option value="à lire">
        <option value="à écouter">
        <option value="drôle">
        <option value="bon">
        <option value="à visiter">
        <option value="pour se laver">
        <option value="avant 1h">
        <option value="aller à Bordeaux">
        <option value="comment faire un gâteau">
        <option value="se faire masser">
        <option value="courir">
        <option value="jouer du violon">
        <option value="avant 1mn">
        <option value="avant 30mn">
    </datalist>
    </div>
`
const valider = `
    <div style="${style};background-color:green;text-align:center;">
        OK
    </div>
`
module.exports = (id, media, title, tags, actions) => `
  <article class="card">
    <section class="media">
        ${media || ''}
    </section>
    <section class="description">
        <h1>${title || ''}</h1>
    </section>
    <section class="tags" style="display:flex;flex-wrap: wrap;margin-bottom:3%;">
         ${tags ? tags.reduce((acc,t) => acc + tag(t),"") : ''}
         ${tags ? input()+valider :''}
    </section>
    <section class="actions">
        ${actions.reduce((acc,a) => acc + a,"")}
    </section>
  </article>`