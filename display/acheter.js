module.exports = id => `
    <form>
        <button style="background-color:green;" hx-post="/obtenir" hx-target='closest .actions'>Obtenir</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`