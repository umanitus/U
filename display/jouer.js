module.exports = id => `
    <div class="jouer">
        <button class="miser" hx-post="/miser" hx-target='closest .jouer'>Faire une offre</button>
        <button class="procurer" hx-post="/procurer/${id}" hx-target='closest .jouer'>Se procurer</button>
    </div>`