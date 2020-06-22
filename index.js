addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */

const NOUVEAU_PRODUIT = {
    image:"",
    tags: [],
    role:"SERVEUR"
}

const page = require("./display/page.js");
const head = require("./display/head.js");
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

async function handleRequest(request) {
    let link = new URL(request.url);
    let owner = JSON.parse(await MY_KV.get(link.hostname));
    let ressource = decodeURIComponent(link.pathname);
    let key = link.searchParams.get("key");
    let user = key ? await MY_KV.get(key) || null : null;
    let method = request.method;
    if (method == "GET") {
        if (ressource == "/+.") {
            let data = await MY_KV.list({prefix:'/+.#./.'});
            let response = '';
            for (var i = 0; i < data.keys.length ; i++)
                response += '('+await MY_KV.get(data.keys[i].name)+').\n';
            return new Response(response, {
                status:200,
                headers:new Headers({
                    "Content-Type":"text/plain"
                })
            })
        }
        else {
            let product = ressource == "/" ? null : JSON.parse(await MY_KV.get(ressource)) ;
            return new Response(page(head(owner,product,style()), header(owner), product ? carte(media(product), product.description, product.tags,[jouer(product.id),passer(product.id)]) : null), {
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
            let save = await MY_KV.put(id, `(#carte/+.+.).(/+:+:+.+.)`);
            let encoded = encodeURIComponent(id);
            return new Response(carte(encoded,null, null, null, [servir(id),taster(id),vouloir(id)]), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
        if (ressource == "/servir") {
            let b = await request.text();
            let la_carte = decodeURIComponent(b.split("=")[1]);
            return new Response(carte("3", media(null), `Toucher l'icône pour ajouter votre vidéo de promotion, en paysage de préférence pour ${la_carte}`, null , []), {
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