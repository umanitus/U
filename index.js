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

`${domain}
https://umanitus.com/@jboyreau./((/+):inviter:+.(https://umanitus.com/@ahenry./+.)):+:+.
#page/+.@(@(@(/+):montrer:+.(${la_carte}):+.+.):+.+.

`#msisdn/+.((#personne/:inviter:+.(#personne/+.(+#+.+.+.))):+.(_)

@+umanitus./#domaine/+.(@+umanitus.+.+.).((/#personne/+.(+#msisdn/.+.+33687041667.))#+.+.+.)

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
const se_connecter = require("./display/se_connecter.js");
const U = require("./U.js");
import { AwsClient } from 'aws4fetch';

const hashed = async (bytes) => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);           // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                     // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
    return hashHex;
}


async function handleRequest(request) {
    let link = new URL(request.url);
    
    
    //HANDLING LOGIN WITH MSISDN AND PASSWORD
    
    if (link.pathname.indexOf("/login") == 0) {
        let msisdn_param = link.searchParams.get("msisdn");
        if (msisdn_param) {
            msisdn_param = decodeURIComponent(msisdn_param);
            msisdn_param = msisdn_param.split("+").join('');
        }
        let invitation = link.searchParams.get("invitation");
        let invited_msisdn = invitation ? await MY_KV.get(`@+umanitus./#msisdn/+.((#personne/:inviter:+.(#personne/+.(+#+.+.+.))):+.(_${invitation}))`) : null
        let msisdn_path = link.pathname.split("/")[2];
        if (msisdn_param || !msisdn_path) {
                return new Response(page(null,style(),header(null),carte({media:null,titre:null,tags:null,actions:[login(msisdn_param ? msisdn_param : null, invitation, invited_msisdn)]})), {
                    status:200,
                    headers: new Headers({
                        "Content-Type":"text/html;charset=UTF-8"
                    })
                })
        }
        else {
            if (msisdn_path) {
                msisdn_path = '+'+decodeURI(msisdn_path);
                let password = link.searchParams.get("password");
                let secret_input = password ? await hashed(new TextEncoder().encode(SALT+password)) : null ;
                let domain = await MY_KV.get(`@+umanitus./#domaine/+.(@+umanitus.+.+.).((/#personne/+.(+#msisdn/.+.${msisdn_path}.))#+.+.+.)`)
                let secret_stored = domain ? await MY_KV.get(`${domain}//+#secret/+.(@+umanitus.+.+.)`) : null ;
                if ( (secret_stored && (secret_input == secret_stored) ) || (secret_input && domain && (msisdn_path == invited_msisdn ))) {
                    let token = await(hashed(crypto.getRandomValues(new Uint8Array(40))));
                    if (invitation) {
                        let signup = await MY_KV.put(`${domain}//+#secret/+.(@+umanitus.+.+.)`, secret_input);
                        let burnt = await MY_KV.delete(`@+umanitus./#msisdn/+.((#personne/:inviter:+.(#personne/+.(+#+.+.+.))):+.(_${invitation}))`);
                    }
                    let store = await MY_KV.put(token,domain,{expirationTtl: 3600 });
                    return new Response(null, {
                        status:301,
                        headers: new Headers({
                            "Cache-Control":'no-cache',
                            "Location":`${domain}/`,
                            "Set-Cookie":`token=${token};Secure;SameSite=Strict;Max-Age=3590;Path=/;Domain=umanitus.com`
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
    //Getting the domain
    let d = link.hostname ;
    let domain = null ;
    let ressource = null ; 
    if (d === "umanitus.com") {
        let parts = link.pathname.split('/');
        domain = "https://umanitus.com/"+parts[1];
        ressource = request.url.substring(domain.length);
    }
    
    //Getting the user
    let cookie_string = request.headers.get('cookie');
    let cookies = cookie_string ? cookie_string.split(";") : [] ;
    let token = null ;
    for (let i = 0;i<cookies.length;i++) {
        let kv = cookies[i].split("=");
        if (kv[0].trim() == "token") {
            token = kv[1];
            break;
        }
    }
    let user = token ? await MY_KV.get(token) : null ;
    if (user && (user != domain))
        return new Response(null, {
            status:301,
            headers: new Headers({
                "Location":`${user}/`,
            })
        })
    if (request.method == "GET") {
        if (!user) {
            let token = link.searchParams.get('invitation');
            token = token ? await MY_KV.get(token) : null ;
            if (!token)
                return new Response(page(null,style(),header(),carte({media:null, titre: 'Pour rejoindre Umanitus, vous devez y être invité par un membre que vous connaissez', tags:null, actions:null})+carte({media:null, titre:'Déjà membre ?',tags:null, actions:[se_connecter()]})), {
                    status:200,
                    headers: new Headers({
                        "Content-Type":`text/html;charset=UTF-8`,
                    })
                })
        }
        let owner = {};
        owner.image = await MY_KV.get(`${user}/#image/.(+.@+.+./+.).@+www.`);
        owner.jetons = await MY_KV.get(`${user}//+#jeton//.#//+.@+umanitus.`);
        owner.niveau = await MY_KV.get(`${user}/#niveau/+.(@+.+./+.).@+umanitus.`);
        owner.niveau = owner.niveau ? parseInt(owner.niveau) : 0 ;
        owner.jetons = owner.jetons ? parseInt(owner.jetons) : 0 ;
        console.log(owner);
        
        console.log(ressource);
        if (ressource == '/') {
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
        if (subject[1] == "#carte/") {
            /*
            let c = '/'+ressource ;
            let la_carte = {
                video: await MY_KV.get(`${domain}/#video/+.(@(${c}).+.+.).(@+www.)`),
                but: await MY_KV.get(`${domain}/#:%/+.@(#(@(@+.+.(${c}).((/+):+:+.+.)).):+.+.)/+.).+.+.`)
            };
            */
            
        }
    }
    else if (request.method == "POST") {
        const { headers } = request ;
        const contentTypeString = headers.get("content-type");
        const contentType = contentTypeString.split("/")[0];
        if (user && (contentType == "image" || contentType == "audio" || contentType == "video" || contentType == "text")) {
            let myBlob = await request.arrayBuffer();
            let h = await hashed(myBlob);
            let path = `#${contentType}/+.(+.@+sha256..@+base64.+._${h}.).(@+www.)`
            const aws = new AwsClient({ accessKeyId: AWS_S3_ACCESS_KEY, secretAccessKey: AWS_S3_SECRET_KEY });
            const url = 'https://s3.eu-west-3.amazonaws.com/umanitus.com/'+h;
            console.log("to upload new file");
            const res = await aws.fetch(url, { method:"PUT", body: myBlob, headers: new Headers({
                "x-amz-acl": "public-read",
                "content-type":contentTypeString
            })});
            console.log("uploaded")
            return new Response(JSON.stringify(res) , {
                status:200,
                headers: new Headers({
                    "Content-Type": "text/plain"
                })
            })
        }
        if (ressource == "/@(/+):(+):+.+.") {
            let b = await request.text();
            let o = decodeURIComponent(b.split("=")[1]).substring(1);
            if (o == "#carte/") {
                let id = `#carte/+.(@(+${new Date().toISOString()}).+.((/+):(+):+.+.))`;
                //console.log("let us save "+id)
                //let saved = await MY_KV.put(`@+${domain}/${id}`,'+.');
                return new Response(await U.s(MY_KV, domain, `(@+html.).((${id}).(@(/+):+.+.))?`), {
                    status: 200,
                    headers: new Headers({
                        "Content-Type": "text/html;charset=UTF-8"
                    })
                })
            }
            return new Response(null, {
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