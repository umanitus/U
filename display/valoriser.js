module.exports = (cas, points, prix)  => `
    <form class="valoriser">
        <input hx-post='/valoriser' hx-target='closest .valoriser' hx-swap='innerHTML' type="number" id="valeur" name="points" pattern="[0-9]*" placeholder="${ cas == 'achat' ? 'mon maximum en jetons Umanitus' : 'mon minimum en jetons Umanitus'}" value="${points ||''}"/>
        <div class="monnaie">${ prix ? 'Soit '+prix+'€' : ''}</div>
        <button style="${!points ? 'display:none': ''}" hx-post="/${ cas == 'achat' ? 'acheter' : 'vendre'}">Valider</button>
    </form>`