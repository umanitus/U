module.exports = id => `
    <form>
    <button style="background-color:#C32C57;" hx-post="/servir" hx-target='closest .card' hx-swap='outerHTML'>Servir</button>
    <input name="o" value="${id}" style="display:none"/>
    </form>
`