module.exports = cas => `
    <form class="valoriser">
        <input type="number" name="points" pattern="[0-9]*" placeholder="${ cas == 'achat' ? 'ma valeur' : 'le coût pour moi'}"/>
        <button hx-post="/${ cas == 'achat' ? 'acheter' : 'vendre'}">Valider</button>
    </form>`