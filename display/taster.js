module.exports = id => `
    <form>
        <button style="background-color:#62275D;" hx-post="/taster" hx-target='closest .card'>Taster</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`