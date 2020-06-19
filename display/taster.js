module.exports = id => `
    <button style="background-color:#62275D;" hx-post="/servir/${id}" hx-target='closest .card'>Taster</button>
`