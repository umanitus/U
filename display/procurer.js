module.exports = (id) => `
    <form>
        <button style="background-color:blue;" hx-post="/procurer" hx-target='closest .actions'>Procurer</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`

