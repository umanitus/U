module.exports = (id, but) => `
    <form>
        <button class="jouer" style="background-color:green;" hx-post="/${ but == 'Vente' ? 'acheter' : 'vendre'}" hx-target='closest .actions'>Jouer</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`