let style = "style=font-size:150%;padding:3%;margin-bottom:3%" ;

module.exports = (msisdn) => `
    <form action="/login${msisdn ? '/'+encodeURIComponent(msisdn.trim()) : ''}" method="GET" style="display:flex;flex-direction:column" id="login">
    
        ${ msisdn ? `<input ${style} placeholder="mot de passe" autocomplete="new-password" name="password" type="password"/>`
                  : `<input ${style} type="tel" name="msisdn" id="msisdn" placeholder="numéro de mobile" required autocomplete="tel">`
         } 
        <button type="submit" style="background-color:blue">Valider</button>
    </form>
`