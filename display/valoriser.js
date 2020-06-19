module.exports = (cas, points, prix)  => `
    <form class="valoriser">
        <div class="edition">
            <input hx-post='/valoriser' hx-target='closest .valoriser' hx-swap='innerHTML' type="number" id="valeur" name="points" pattern="[0-9]*" placeholder="${ cas == 'achat' ? 'ma valeur' : 'mon coût'}" value="${points ||''}"/>
            <button style="${!points ? 'display:none': ''}" hx-post="/${ cas == 'achat' ? 'acheter' : 'vendre'}">Valider</button>
        </div>
        <div class="monnaie">${ prix ? 'Soit '+prix+'€' : ''}</div>
    </form>`