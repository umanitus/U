module.exports = ({tel,nom,domaine}) => `
    <div style="display:flex;flex-direction:row;">
    <form>
        <input style="width:25%;;padding:2%" autocomplete="tel" placeholder="téléphone" />
        <input style="width:25%;padding:2%" autocomplete="name" placeholder="nom" />
        <input style="width:25%;;padding:2%" autocomplete="username" placeholder="domaine Umanitus" />
        <button style="font-size:100%;padding:2%;width:10%;flex:1;background-color:green">OK</button>
    </form>
    </div>
`