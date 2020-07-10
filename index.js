addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})




/**
 * Respond to the request
 * @param {Request} request
 */

/*
`#page/+.@(@(@/+:montrer:+.${carte}):+.+.):+.+.`
`(@(@(@/+:vendre:+.${produit}):+.+.).+.+.)`
`(@/+:@(/#person/+.+#msisdn/.+.+${telephone}.):+.+.))`
#page/+.@(@(@/+:montrer:+.(/#carte/+.((+2020-07-06T14:06:46.649Z):+.+.).((/+):+:+.+.))):+.+.):+.+.
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
const U = require("./U.js");

const hashed = async (bytes) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}

async function handleRequest(request) {
    let link = new URL(request.url);
    let domain = link.hostname.split(".")[0];
    
    let ressource = decodeURIComponent(link.pathname);
    let cookie = request.headers.get('cookie');
    //console.log(cookie);
    let user = cookie ? await MY_KV.get(cookie.split(";")[0].split("=")[1]) : null ;
    //console.log(user);
    let method = request.method;
    if (method == "GET") {
        
        if (ressource == '/') {
            if (!user)
                return new Response(null, {
                    status: 301,
                    headers: new Headers({
                        "Location":"/login"
                    })
                })
        }
        
        let owner = {};
        owner.image = await MY_KV.get(`@+${domain}./#image/.(+.@+.+./+.).@+www.`);
        owner.pieces = await MY_KV.get(`@+${domain}.//+#piece//.#//+.@+umanitus.`);
        owner.niveau = await MY_KV.get(`@+${domain}./#niveau/+.(@+.+./+.).@+umanitus.`);
        
        if (ressource.indexOf("/login") == 0) {
            let msisdn_param = link.searchParams.get("msisdn");
            let msisdn_path = ressource.split("/")[2];
            if (msisdn_param || !msisdn_path)
                return new Response(page(null,style(),header(owner),carte(null,null,null,null,[login(msisdn_param ? decodeURIComponent(msisdn_param) : null)])), {
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
            //let product = await MY_KV.get("@+"+domain+"."+ressource,"arrayBuffer");
            return new Response(null, {
                status:301,
                headers: new Headers({
                    "Location":"https://s3.eu-west-3.amazonaws.com/umanitus.com/test2.mov"
                    //"Content-Type":"video/quicktime"
                })
            })
        }
        if (subject[1] == "#page/") {
            
            let la_carte = U.parse(U.parse(U.parse(U.parse(U.parse(subject[2])[1])[1])[1])[1])[2];
            let sur_la_carte = U.parse(await MY_KV.get("@+jboyreau."+la_carte));
            let carte = {} ;
            if (sur_la_carte[0] == ".")
                for (var i = 1;i<sur_la_carte.length;i++) {
                    let parsed = U.parse(sur_la_carte[i]);
                    if (parsed[2].indexOf("video") !=-1)
                        carte["video"] = "https://jboyreau.umanitus.com/" + encodeURIComponent(parsed[2].substring(1));
                    else if (parsed[1].indexOf("@(@(@")!=-1) {
                        let purpose = U.parse(U.parse(U.parse(U.parse(parsed[1])[1])[1])[1]);
                        carte["purpose"] = purpose[1];
                        carte["product"] = purpose[2];
                    }
                }
            console.log(carte);
            //let product = ressource == "/" ? null : await MY_KV.get("@+jboyreau."+ressource);
            return new Response(page(meta(domain == "u" ? "jboyreau" : domain, product), style(), header(owner), product ? carte(null,media(product), product.description, product.tags,[jouer(product.id),passer(product.id)]) : carte(null, media(null), null, null, [])), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
        
        let product = ressource == "/" ? null : await MY_KV.get("@+"+domain+"."+ressource);
        return new Response(page(meta(link.hostname,product), style(), header(owner), product ? carte(null,media(product), product.description, product.tags,[jouer(product.id),passer(product.id)]) : carte(null, media(null), null, null, [])), {
            status: 200,
            headers: new Headers({
                "Content-Type": "text/html;charset=UTF-8"
            })
        });
    }
    else if (method == "POST") {
        if (ressource == "/#carte/") {
            let id = `/#carte/+.(+${new Date().toISOString()}:+.+.).(/+:+:+.+.)`;
            //let save = await MY_KV.put(id, `(#carte/+.+.).(/+:+:+.+.)`);
            let encoded = encodeURIComponent(id);
            return new Response(carte(encoded,null, null, null, [servir(id),taster(id),vouloir(id)]), {
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
            return new Response(valoriser("achat"), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        if (ressource == "/procurer") {
            return new Response(partager(`https://${owner.domain}${ressource.substring(9)}`), {
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
    }
    else
        return new Response(null, {
            status: 404
        })
}