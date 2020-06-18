addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */

const NOUVEAU_PRODUIT = {
    image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX///8AAAA+Pj7i4uLd3d1ISEhWVlb19fXIyMhra2vv7+/6+vrLy8sqKionJyfq6upbW1uXl5fR0dGnp6dwcHB8fHxQUFCIiIi0tLQgICAJCQmQkJBiYmIZGRm6urqUlJQ4ODijo6MVFRUxMTGCgoJHxlCNAAADT0lEQVR4nO3d4XaaQBBAYRQUlSiKiUk1SZuk7/+MPWhbJeywCCndGe/9a/f0fMmeWoUdooiIiIiIiIiIiIiIiIiIiEhP8XIcfqs+wmSkIYQIww8hwvBDiDD8ECIMv68TjvM4kDoJN7tppUlcE076/LC+tA7CdF373SeRJeGdY3ebEn53AC0JFzsX0JBw5vQZEj4KQCvCfCIBjQhfRZ8NYfbQALQgjH80AQ0Inxp9BoT3HqB2YfLNB/QK0/X8sgFc5/zCrdfXQtjiB/mv8v3V2bwFULMw2btJm+q7v17hm9u3n0U2hOmzG7hbRDaExbsbeChftCDcuH374viqfuFi6gauF6fX1Qtnwg7d/PkD2oXCR9334u863cJ87AY+p+d1qoWvwrv89nKdZqHwUfelqKzTK8yFj7rzrLruOmE2qzQcL6oJpY+628/rrhP+z6oQ4d/Qj6S2TqvQ3X1WX2dK+ORaZ0g4ru/QMjvCB8cOLTMjfJXWGREer167syF8bFhnQiju0DIDwsmicZ1+4cGzTr3Q+59j5cJd8w4t0y307dAyzcKXuzbrFAunqX9RpFm48S85plW4LPwrTmkVCh8kHGkVtl+HEOFwIZRCiHC4EEohRDhcCKUQIhwuhFIIEQ4XQimECIcLoRRChMOFUAohwuGqCu1fP1yZvwZs/zr+6AbuxbiB+2lG9u+JGt3AfW0jU/cmJsJJvKY7oMv0CMWzambuEY7k0TpG7vMui4XxSDbu1T8lnFkzcd7id1fvVHXCKHePmjNw7uncwU1Uf3btImmgnvLzh5elwk7VfYa0mrBTl5rPAX9q1mbaQJlaobhT+53HDythLk2vmQqBVQjz2XrMxQgtxyjkY91nm4TXm5u47zqfJsCKpdvYccZQiEmz9rrNiQozaV5il1lfgRav3MQO89pCLRPmlu5yK0Jx9uzVcxMDLhbe/a+cfRl0jTOgTQi9U5L1C6P4w7qwxU5VL2ycOG9D2PTUACPCKPppXih+2WhHKH4tbkcoftloSOh8EpItoTRA2ZBQ+LLRlFDdM7s61Oq5a+E8O6+S+1JhvRbPzgu1Pr9ahGGEEGH4IUQYfggRhh/CpuLlOPxWfYRERERERERERERERERERERa+gVTL0cqJsc+sQAAAABJRU5ErkJggg==",
    description:"Toucher pour décrire ce que vous voulez",
    tags: [],
    role:"SERVEUR"
}

const page = require("./display/page.js");
const head = require("./display/head.js");
const style = require("./display/style.js");
const header = require("./display/header.js");
const carte = require("./display/carte.js");
const partager = require("./display/partager.js");
const valoriser = require ("./display/valoriser.js");
const U = require("./U.js");

async function handleRequest(request) {
    let link = new URL(request.url);
    let owner = JSON.parse(await MY_KV.get(link.hostname));
    let ressource = decodeURIComponent(link.pathname);
    //let user = JSON.parse(await MY_KV.get(link.searchParams.get("key")));
    let method = request.method;
    if (method == "GET") {
        if (ressource == "/+.") {
            let data = await MY_KV.list({prefix:'/+.#./.'});
            let response = '';
            for (var i = 0; i < data.keys.length ; i++)
                response += '('+await MY_KV.get(data.keys[i].name)+').\n';
            /*
            data.keys.forEach(async (key) => {
                let value = await MY_KV.get(key.name);
                console.log("I have the value "+value)
                response+=`(${value}).\n`
            });
            */
            return new Response(response, {
                status:200,
                headers:new Headers({
                    "Content-Type":"text/plain"
                })
            })                                                   
        }
        else {
            let product = ressource == "/" ? null : JSON.parse(await MY_KV.get(ressource)) ;
            return new Response(page(head(owner,product,style()), header(owner), product ? carte(product , "CLIENT") : null), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            });
        }
    }
    else if (method == "POST") {
        if (ressource == "/#carte/")
            return new Response(carte(NOUVEAU_PRODUIT,""), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
        });
        else if (ressource == "/miser") {
            return new Response(valoriser("achat"), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        else if (ressource.indexOf("/procurer") == 0) {
            return new Response(partager(`https://${owner.domain}${ressource.substring(9)}`), {
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