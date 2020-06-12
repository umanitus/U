module.exports = cas => `
    <form class="valoriser">
        <div class="edition">
            <input type="number" id="valeur" name="points" pattern="[0-9]*" placeholder="${ cas == 'achat' ? 'ma valeur' : 'le coût pour moi'}"/>
            <button hx-post="/${ cas == 'achat' ? 'acheter' : 'vendre'}">Valider</button>
        </div>
        <div class="monnaie">Soit <span>12,3</span>€</div>
    </form>`