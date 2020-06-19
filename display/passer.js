module.exports = id => `
    <button style="background-color:black;" hx-post="/passer/${id}" hx-target='closest .card'>Passer</button>
`