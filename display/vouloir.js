module.exports = id => `
    <form>
        <button style="background-color:#2E6FCC;" hx-post="/vouloir" hx-target='closest .card'>Vouloir</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`