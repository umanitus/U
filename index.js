addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


///  /#video/+.((+.@+www.).+.(https://s3.eu-west-3.amazonaws.com/umanitus.com/test2.mov))

/**
 * Respond to the request
 * @param {Request} request
 */

/*
`#page/+.@(@(@/+:montrer:+.${carte}):+.+.):+.+.`
`(@(@(@/+:vendre:+.${produit}):+.+.).+.+.)`
`(@/+:@(/#person/+.+#msisdn/.+.+${telephone}.):+.+.))`
#page/+.@(@(@(/+):montrer:+.(/#carte/+.((+2020-07-06T14:06:46.649Z):+.+.).((/+):+:+.+.))):+.+.):+.+.

#page/+.@(@(@(/+):montrer:+.(${la_carte}):+.+.):+.+.

*/

const NOUVEAU_PRODUIT = {
    image:"",
    tags: [],
    role:"SERVEUR"
}

const page = require("./display/page.js");
const login = require("./display/login.js");
const meta = require("./display/meta.js");
const style = require("./display/style.js");
const header = require("./display/header.js");
const carte = require("./display/carte.js");
const media = require("./display/media.js");
const partager = require("./display/partager.js");
const valoriser = require ("./display/valoriser.js");
const jouer = require("./display/jouer.js");
const passer = require("./display/passer.js");
const servir = require("./display/servir.js");
const taster = require("./display/taster.js");
const vouloir = require("./display/vouloir.js");
const acheter = require("./display/acheter.js");
const procurer = require("./display/procurer.js");
const contacter = require("./display/contacter.js");
const U = require("./U.js");

const hashed = async (bytes) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

async function handleRequest(request) {
    let link = new URL(request.url);
    
    
    if (link.pathname.indexOf("/login") == 0) {
        let msisdn_param = link.searchParams.get("msisdn");
        if (msisdn_param) {
            msisdn_param = decodeURIComponent(msisdn_param);
            msisdn_param = msisdn_param.split("+").join('');
        }
        let msisdn_path = link.pathname.split("/")[2];
        if (msisdn_param || !msisdn_path)
            return new Response(page(null,style(),header(null),carte({media:null,titre:null,tags:null,actions:[login(msisdn_param ? msisdn_param : null)]})), {
                status:200,
                headers: new Headers({
                    "Content-Type":"text/html;charset=UTF-8",
                    "Set-Cookie":"token=5; Path=/; domain=umanitus.com ; Expires=Fri, 5 Oct 2018 14:28:00 GMT"
                })
            })
        else {
            if (msisdn_path) {
                msisdn_path = '+'+decodeURI(msisdn_path);
                let password = link.searchParams.get("password");
                let secret_input = password ? await hashed(new TextEncoder().encode(SALT+password)) : null ;
                let secret_stored = secret_input ? await MY_KV.get(`@+umanitus./#secret/+.(/#personne/+.(+#msisdn/.+.${msisdn_path}.)):+.+.`) : null ;
                    
                if (secret_stored && (secret_input == secret_stored) ) {
                    let domain = await MY_KV.get(`@+umanitus./#domaine/+.(@+umanitus.com.+.+.).((/#personne/+.(+#msisdn/.+.${msisdn_path}.))#+.+.+.`)
                    let token = await(hashed(crypto.getRandomValues(new Uint8Array(40))));
                    let store = await MY_KV.put(token,domain,{expirationTtl: 300 });
                    return new Response(null, {
                        status:301,
                        headers: new Headers({
                            "Location":`https://${link.hostname}/@${encodeURI(domain)}/`,
                            "Set-Cookie":`token=${token};Path=/;domain=${link.hostname}`
                        })
                    })
                }
                return new Response(null, {
                    status:301,
                        headers: new Headers({
                            "Location":"/login"
                        })
                    })
                }
            }
        }
    
    
    /*
    let domain = link.hostname.split(".umanitus.com")[0];
    */
    let in_memory = link.pathname.split('/')[1];
    let domain = in_memory.indexOf("@") == 0 ? decodeURI(in_memory.substring(1,in_memory.length-1)) : null ;
    //console.log(domain);
    /*
    let ressource = decodeURIComponent(link.pathname);
    */

    let ressource = '/'+ ( link.pathname.split('/')[2] || '');
    //console.log(ressource);
    let method = request.method;
    
    //Getting the user
    let cookie_string = request.headers.get('cookie');
    let cookies = cookie_string ? cookie_string.split(";") : [] ;
    let token = null ;
    console.log(cookies);
    for (let i = 0;i<cookies.length;i++) {
        let kv = cookies[i].split("=");
        if (kv[0].trim() == "token") {
            token = kv[1];
            break;
        }
    }
    console.log(token);
    let user = token ? await MY_KV.get(token) : null ;
    
    if (user && user != domain)
        return new Response(null, {
            status:301,
            headers: new Headers({
                "Location":`https://${user}.umanitus.com/`,
            })
        })
    
    if (method == "GET") {
        let owner = {};
        owner.image = await MY_KV.get(`@+${domain}./#image/.(+.@+.+./+.).@+www.`);
        owner.pieces = await MY_KV.get(`@+${domain}.//+#piece//.#//+.@+umanitus.`);
        owner.niveau = await MY_KV.get(`@+${domain}./#niveau/+.(@+.+./+.).@+umanitus.`);
        if (ressource == '/') {
            if (!user)
                return new Response(null, {
                    status: 301,
                    headers: new Headers({
                        "Location":"/login",
                        "Set-Cookie":"token=5; Path=/; domain=umanitus.com ; Expires=Fri, 5 Oct 2018 14:28:00 GMT"
                    })
                })
            else 
                return new Response(page(null,style(),header(owner,true),null), {
                    status:200,
                    headers: new Headers({
                        "Content-Type":"text/html;charset=UTF-8"
                    })
                })
        }
        let subject = U.parse(ressource.substring(1));
        
        if (subject[1] == "#image/") {
            let product = await MY_KV.get("@+"+domain+"."+ressource,"arrayBuffer");
            return new Response(product, {
                status:200,
                headers: new Headers({
                    "Content-Type": "image/jpg"
                })
            })
        }
        if (subject[1] == "#video/") {
            let video = U.parse(subject[2]);
            let url = video[1] == "(+.@+www.)." ? video[2] : null ;
            if (url)
                return new Response(null, {
                    status:301,
                    headers: new Headers({
                        "Location": url
                        //"Content-Type":"video/quicktime"
                    })
                })
            else
                return new Response(null, {
                    status:404
                })
        }
        if (subject[1] == "#page/") {
            let cle_carte = U.parse(U.parse(U.parse(U.parse(U.parse(subject[2])[1])[1])[1])[1])[2];
            let sur_la_carte = U.parse(await MY_KV.get("@+"+domain+"."+cle_carte));
            let la_carte = {} ;
            if (sur_la_carte[0] == ".")
                for (var i = 1;i<sur_la_carte.length;i++) {
                    let parsed = U.parse(sur_la_carte[i]);
                    if (parsed[2].indexOf("video") !=-1)
                        la_carte["media"] = media({video:"https://jboyreau.umanitus.com/" + encodeURIComponent(parsed[2].substring(1))});
                    else if (parsed[1].indexOf("@(@(@")!=-1) {
                        let purpose = U.parse(U.parse(U.parse(U.parse(parsed[1])[1])[1])[1]);
                        la_carte["titre"] = purpose[1] == "@(/+):vendre:" ? "Vente" : "Achat"
                        la_carte["tags"] = [purpose[2]];
                        la_carte["actions"] = [ jouer(encodeURIComponent(cle_carte), la_carte["titre"]), passer(encodeURIComponent(cle_carte)) ]
                    }
                }
            //la_carte["owner"] = domain == user ;
            console.log(la_carte);
            return new Response(page(meta(link.hostname, {id:encodeURIComponent(ressource.substring(1)), description:la_carte["titre"], image: owner.image, but:la_carte["titre"] }), style(), header(owner), carte(la_carte)), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
    }
    else if (method == "POST") {
        if (ressource == "/#carte/") {
            let id = `/#carte/+.(+${new Date().toISOString()}:+.+.).(/+:+:+.+.)`;
            //let save = await MY_KV.put(id, `(#carte/+.+.).(/+:+:+.+.)`);
            let encoded = encodeURIComponent(id);
            return new Response(carte({media:null, titre: null, tags:null, actions: [contacter({nom:null,tel:null,domaine:null})]}), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
        if (ressource == "/#video/") {
            const { headers } = request ;
            const contentType = headers.get("content-type");
            if (contentType.includes("video/")) {
                let myBlob = await request.arrayBuffer();
                let h = await hashed(myBlob);
                let path = `#octet//+.(+.@+sha256..@+base64.+._${h}.)`
                let k = await MY_KV.put(`@+${domain}./${path}`,myBlob);
                return new Response(`<video controls autoplay src='https://${domain}.umanitus.com/${encodeURIComponent(path)}'></video>`, {
                    status:200,
                    headers: new Headers({
                        "Content-Type":"text/html"
                    })
                });
            }
        }
        if (ressource == "/#image/") {
            let myBlob = await request.arrayBuffer();
            let h = await hashed(myBlob);
            let path = `#image/+.+.#octet//+.(+.@+sha256..@+base64.+._${h}.)`;
            let k = await MY_KV.put(`@+${domain}./${path}`,myBlob);
            return new Response(carte("3",media({image:`https://${domain}.umanitus.com/${encodeURIComponent(path)}`}),'Qualifier ce que tu vends avec des tags',["à vendre"], []), {
                status:200,
                headers: new Headers({
                    "Content-Type":"text/html;charset=UTF-8"
                })
            })
        }
        if (ressource == "/servir") {
            let b = await request.text();
            let la_carte = decodeURIComponent(b.split("=")[1]);
            return new Response(carte(null, media(null), `Toucher l'icône pour ajouter votre vidéo de promotion, en paysage de préférence`, null , []), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
        if (ressource == "/jouer") {
            let b = await request.text();
            let la_carte = decodeURIComponent(b.split("=")[1]);
            
            return new Response(valoriser("achat"), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        if (ressource =="/acheter") {
            let b = await request.text();
            let la_carte = b.split("=")[1];
            return new Response(acheter(la_carte)+procurer(la_carte), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        if (ressource =="/obtenir") {
            let b = await request.text();
            let la_carte = b.split("=")[1];
            return new Response(valoriser(la_carte), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        if (ressource == "/valoriser") {
            let b = await request.text();
            let points = parseInt(b.split("=")[1]);
            return new Response(valoriser("achat", points , points/100), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        if (ressource == "/procurer") {
            let b = await request.text();
            let la_carte = decodeURIComponent(b.split("=")[1]);
            return new Response(contacter({tel:null,nom:null,domaine:null}) /*partager(`https://${domain}/#page/+.@(@(@(/+):montrer:+.(${la_carte}):+.+.):+.+.`)*/, {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
    }
    else
        return new Response(null, {
            status: 404
        })
}