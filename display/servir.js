module.exports = id => `
    <button style="background-color:#C32C57;" hx-post="/servir/${id}" hx-target='closest .card' hx-swap='outerHTML'>Servir</button>
`