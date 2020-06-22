module.exports = id => `
    <form>
        <button style="background-color:black;" hx-post="/passer" hx-target='closest .card'>Passer</button>
        <input name="o" value="${id}" style="display:none"/>
    </form>
`