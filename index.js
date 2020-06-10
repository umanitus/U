addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */

const USER = {
    image:"https://media-exp1.licdn.com/dms/image/C5103AQEUXnchNk4iSA/profile-displayphoto-shrink_100_100/0?e=1596672000&v=beta&t=0ohJNudOPkva6462OwWv0ACTeaC09gUIYzkxILneTko",
    points:1400,
    domain:"u.umanitus.workers.dev"
}
const getProduct = id => {
    return id == "/1239383" ? EXEMPLE_PRODUIT : null
}
const EXEMPLE_PRODUIT = {
    id:1239383,
    image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSM357s_lNqANIO3qReDHSgItzQP7FR3gRpvlL3kcqJdChIgFp4SKfyVCesd1Zr1aYLvSiciY&usqp=CAc",
    description:"Ma mère veut un iPhone 8 à moins de 300€",
    tags: ["un iPhone 8S","moins de 300€"],
    role: "CLIENT"
}
const NOUVEAU_PRODUIT = {
    image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX///8AAAA+Pj7i4uLd3d1ISEhWVlb19fXIyMhra2vv7+/6+vrLy8sqKionJyfq6upbW1uXl5fR0dGnp6dwcHB8fHxQUFCIiIi0tLQgICAJCQmQkJBiYmIZGRm6urqUlJQ4ODijo6MVFRUxMTGCgoJHxlCNAAADT0lEQVR4nO3d4XaaQBBAYRQUlSiKiUk1SZuk7/+MPWhbJeywCCndGe/9a/f0fMmeWoUdooiIiIiIiIiIiIiIiIiIiEhP8XIcfqs+wmSkIYQIww8hwvBDiDD8ECIMv68TjvM4kDoJN7tppUlcE076/LC+tA7CdF373SeRJeGdY3ebEn53AC0JFzsX0JBw5vQZEj4KQCvCfCIBjQhfRZ8NYfbQALQgjH80AQ0Inxp9BoT3HqB2YfLNB/QK0/X8sgFc5/zCrdfXQtjiB/mv8v3V2bwFULMw2btJm+q7v17hm9u3n0U2hOmzG7hbRDaExbsbeChftCDcuH374viqfuFi6gauF6fX1Qtnwg7d/PkD2oXCR9334u863cJ87AY+p+d1qoWvwrv89nKdZqHwUfelqKzTK8yFj7rzrLruOmE2qzQcL6oJpY+628/rrhP+z6oQ4d/Qj6S2TqvQ3X1WX2dK+ORaZ0g4ru/QMjvCB8cOLTMjfJXWGREer167syF8bFhnQiju0DIDwsmicZ1+4cGzTr3Q+59j5cJd8w4t0y307dAyzcKXuzbrFAunqX9RpFm48S85plW4LPwrTmkVCh8kHGkVtl+HEOFwIZRCiHC4EEohRDhcCKUQIhwuhFIIEQ4XQimECIcLoRRChMOFUAohwuGqCu1fP1yZvwZs/zr+6AbuxbiB+2lG9u+JGt3AfW0jU/cmJsJJvKY7oMv0CMWzambuEY7k0TpG7vMui4XxSDbu1T8lnFkzcd7id1fvVHXCKHePmjNw7uncwU1Uf3btImmgnvLzh5elwk7VfYa0mrBTl5rPAX9q1mbaQJlaobhT+53HDythLk2vmQqBVQjz2XrMxQgtxyjkY91nm4TXm5u47zqfJsCKpdvYccZQiEmz9rrNiQozaV5il1lfgRav3MQO89pCLRPmlu5yK0Jx9uzVcxMDLhbe/a+cfRl0jTOgTQi9U5L1C6P4w7qwxU5VL2ycOG9D2PTUACPCKPppXih+2WhHKH4tbkcoftloSOh8EpItoTRA2ZBQ+LLRlFDdM7s61Oq5a+E8O6+S+1JhvRbPzgu1Pr9ahGGEEGH4IUQYfggRhh/CpuLlOPxWfYRERERERERERERERERERERa+gVTL0cqJsc+sQAAAABJRU5ErkJggg==",
    description:"Toucher pour décrire ce que vous voulez",
    tags: [],
    role:"SERVEUR"
}
async function handleRequest(request) {
    let ressource = decodeURIComponent(request.url.split(`https://${USER.domain}`)[1]);
    if (request.method == "GET") {
        if (ressource === `/`)
            return new Response(page(NOUVEAU_PRODUIT), {
            status: 200,
            headers: new Headers({
                "Content-Type": "text/html;charset=UTF-8"
            })
        })
        else {
            let product = getProduct(ressource);
            if (!product)
                return new Response(null, {
                status: 404,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })})
            else
                return new Response(page(product), {
                    status: 200,
                    headers: new Headers({
                        "Content-Type": "text/html;charset=UTF-8"
                    })
                })
        }
    }
    else if (request.method == "POST") {
        if (ressource == "/#carte/")
            return new Response(card(NOUVEAU_PRODUIT), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
        })
        else if (ressource == "/miser") {
            return new Response(valoriser("achat"), {
                status: 200,
                headers: new Headers({
                    "Content-Type": "text/html;charset=UTF-8"
                })
            })
        }
        else if (ressource.indexOf("/procurer") == 0) {
            return new Response(partager(`https://${USER.domain}${ressource.substring(9)}`), {
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

// Pages
const page = (produit) => `
  <html>
    ${head(produit)}
    <body>
    ${header(USER)}
    <div id="cards">
      ${card(produit)}
    </div>
    </body>
  </html>`
const head = ({role,id,image,description}) => `
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Umanitus">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png" type="image/png">

    <!-- Open Graph meta pour Facebook -->
    <meta property="og:title" content="Jouez à Umanitus - Vente" />
    <meta property="og:url" content="${ id ? 'https://'+USER.domain+'/'+id:''}" />
    <meta property="og:image" content="${image || ''}" />
    <meta property="og:description" content="${description || ''}" />
    <meta property="og:site_name" content="${USER.domain}" />
    <meta property="og:type" content="article" />
    <script src="https://unpkg.com/htmx.org@0.0.4"></script>
    ${style()}
  </head>`
const style = () => `
  <style>
    body {
      font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
      margin:0;
    }
    nav {
      display:flex;
      overflow: hidden;
      width:100%;
      position: fixed;
      top:0;
      height:8%;
      background-color:black;
      color:white;
      align-items:center;
    }
    nav img {
      height:100%;
    }
    nav .stats {
      flex-grow:2;
      text-align:center;
    }
    nav button {
      height:80%;
      margin-right:2%;
      font-size:120%;
      border:none;
      border-radius:30%;
      background-color:white;
    }
    #cards {
      margin-top:17%;
    }
    .card {
        margin:2%;
        opacity: 1;
        transition: opacity 1s ease-out;
        padding-top:3%;
        box-shadow:  2px 1px 2px 1px rgba(0,0,0,0.6);
        display:flex;
        border-radius: 15px;
        flex-direction: column;
        border:1px solid #e2e8f0;
    }
    .card.htmx-settling {
        opacity: 0;
    }
    .card .media img {
        width:97%;
    }
    .card .description, .tags, .actions {
        padding-left:5%;
        padding-right:5%;
    }
    .card .description {
        text-align:center;
    }
    .card .tags {
        display:flex;
        flex-wrap: wrap;
        margin-bottom:3%;
    }
    .card .tag, .tags button {
        position:relative;
        background-color:darksalmon;
        padding:2%;
        margin:1%;
        color:white;
        border-radius:15px;
    }
    .card .tag .close {
        float:right;
    }
    .actions {
        padding-bottom:2%;
        display:flex;
        flex-direction:column;
    }
    .actions input {
        border-radius:10px;
    }
    .valoriser {
        display:flex;
    }
    .valoriser input {
        flex:1;
    }
    .valoriser  button {
        flex:1;
        background-color:green;
        margin-left:5%;
    }
    .actions button {
        width:100%;
        border-radius:15px;
        color:white;
        border:none;
        padding:3%;
    }
    .partager {
        display:flex;
    }
    .partager div {
        flex:1;
        border:1px solid #e2e8f0;
        text-align:center;
    }
    .partager img {
        width:70%;
    }
    .jouer {
        display:flex;
        flex-direction: column;
    }
    button.miser {
        background-color: cornflowerblue;
    }
    button.procurer {
        background-color: cadetblue;
    }
  </style>`
const header = ({points,image}) => `
  <nav>
    <img src="${image}"/>
    <div class="stats">
      <label>Score :</label>
      <span>${points}</span>
    </div>
    <button hx-post="/%23carte%2F" hx-target="#cards" hx-swap="afterbegin settle:1s">
      +
    </button>
  </nav>`
const card = ({id,image,description,tags,role}) => `
  <article class="card">
    <section class="media">
        <label for="media-${id}">
            <img for="media-${id}" src="${image}"/>
        </label>
        <input accept="image/*,video/*" capture="camera" id="media-123" style="display:none" id="files-upload" type="file" multiple>
    </section>
    <section class="description">
        <h1>${description}</h1>
    </section>
    <section class="tags">
         ${tags.reduce((acc,t) => acc + tag(t),"")}
         <button>+</button>
    </section>
    <section class="actions">
        ${ role == "CLIENT" ? jouer(id) : servir(id)}
    </section>
  </article>`
const tag = value => `
    <div class="tag">
            <label>${value}</label>
            <!--<div class="close">x</div>-->
    </div>`
const servir = (id) => `
    ${valoriser("vente")}
    ${partager()}
    `
const valoriser = (cas) => `
    <form class="valoriser">
        <input type="number" pattern="[0-9]*" placeholder="${ cas == 'achat' ? 'ma valeur' : 'mon coût'}"/>
        <button>Valider</button>
    </form>`
const partager = (url) => `
    <div class="partager">
        <div class="toFacebook">
            <a target="_blank" href="https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}">
                <img src="data:image/png;base64,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"/>
            </a>
        </div>
        <div class="toWhatsApp">
            <a target="_blank" href="whatsapp://send?text=${encodeURIComponent(url)}">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAZlBMVEX///960G10zmZyzmR3z2pwzWFvzWB2z2j0+/P6/fna8dfq9+jv+e7Q7cyk3pz3/PaA0nS35LGM1oGT2Inl9ePV79Gu4aec25PM7MjB6LzE6b+G1Hvd8tqt4aa25LB90XCg3JeZ2o9YqYENAAAPjUlEQVR4nNVd65qiuhJtyE28IIKoiCj9/i85gNqtLauSQIjO+nPO/sYmFJXUvSpfX5NjvTitil28z9LyEgTBJSnLNKurc3GYL9bTLz8pFqtNXQZMMBYqznnwg+Y/VBiy5l+Ccr/JF+9+0SFYHqpUipaygAbnIRMi3a2W735lCywP9UUwLW1PdComkvjwX1A53yWSKQvifqGYTKp59G4KSOR1aMe7Hl6y/epTiZy35I2g7ofKhsj83cS8YrHjTsi7QjG1+ywBu8qEO/KuCEX2MYycnRkbc/YQOOPFJ1gEs4qFE5B3RciqdyuQRS1db89nKBm/k8Zl7Pz49dAoqnft1Wg3Mf/uCNn5LRqycKgdtDSGhXf68gvzRl8Llpy80jf7Fl7pa8Dl3uNxPIb+NugvVHj0RN8i9c7AG0TqRXMUYgoDxgycTc/GWeZXwvyFyCY+jfO3nMBHKDWpQV7JN9PXQlaT0TdLB+9QrlTIGBNXsDb4pvjQ88zS2TQEnob4SLyhTMhLVm2Oh3x+2i6Wi+3plB+O5+q7ZNIyYHV/aDiJ+j9a71AeirCMixyL+PXpWKXNr6wPt5xAplZ2SpArJrPNyUTwRdtj3VBpx0uxc03gt80RbJhX7uZWz98WmV2kgH07pS9KzfdRS14xxPZYH76FBZFh6tClmiXGBCqRDCLviuiQSuOYiEqcidRlYPplQxaPlXKLXWjKSB44MlMXhkKAs8BJbCw6JoamL+dOSFyYfVIuypWL5TrMUzMauXJAoiEHWeKOvhZ5aUSjAy6acZBdDi7IesLKKE4ymsSliVGlxDRxosIkVskvo87+2kCKcllNFeuLYmmwfjJm+VK/AEu2zih6xSnRb1WVDn9+ptW+XGzckdOLjV7ihPuhD4+13y9Mps/yLfRsZOdhjy603oR0buD3Yqf12+QgVTXXPZcrO/dhOOZanSwGCIOZbm+E5USxhL6XKTUSgXN7naEToyKegBKMWHNk7AVqrPlo0ncyaKM5NMxSJhw0zxP+qwhyDRel1Sst6UPIwym1PMJWI2+UzVFMyWc58zwtofHEVWb+qIJkIb/4E6LPmF1IEoWxg7MgDyFP3lfksk5oEk0/PakoRnorI7EmuWi6TzfUHuXBu7boFTMy22G2T5f0Hn13jdKS3KfMxFfMqEfId6iJZ2wpDigDS2tFKVY7rToRcopEqY/XUntgoniMLSi3jpe6v6bETOjX2MagjGZdLQPlM+k+T7TwJoVIfUb/aUzE70JSTxSpFJLt/UgiihGMjBwtiB0uqDO8vVwjx2rCMoJHzIkXZZRJsscsJP2v1W9ckw0OfFlhh7kYEm9KqBryEBaPf+dJ4BJHkTBPv/FfSSJs+Mf9NrIrRoNwDxRk4hZvbkYw5vxnrXDqIPEVhIvHEBNreAqpPXp+/S6TUPQCvE9DECEmTG5ijxavf8Xcp9r6QEgN1v8XFWQhIZ36jES95eQGFTRt+g2bCJtCHC7Sz3dSdbpDBLcpT/p+j08usev6owrcj078OsJX7o12Yg72fpAONeC79GShwrAN74lnYDsI7znoqSk/thvx0vJVYUBVwWFGIEKPb2STpyYXGNh9Vcoz/DUgC3dYNlEWgktgJl7+/hQeWsxC/FFaTEvZDyATX84WNBDwKcTqqAFzW0AEAZn4VxQs0Q+x9o7o0P+IAgkrQHEaPv+uQPzAuvBA56eG5J2HAL4Ge87B42QTfDQZV212iSet/4V0wPM2hUY39oQII++KHo00Cc7QnH78FZSkAhonJ10tCvZD3QLGlp7OCdpxfcbPDZpj2JL4Zq3/uP+gWGQ4ir/RVoR56DPrgL71oxqYIwpD/FzsTf7gxayYBpg/v5IAmV+qxs+lYsc3CE81U3uwTR+sDmTQEJuUCOr8fiBPHgbapr/rr5GuAOGODrVBbasnuyYC0vT3IOboqFJK24CHvuI1UBXIe3wf6UwyZmZwDr3Zpsjm/DHc0CfA6v6LdA7voBIIToGU/o9GROqe3GTQVv+FQcbZES6AgpvBgr4ALQpXepvGogprJOCRod+VDl1r7VJNRtUpkF19O2dI0NAhQW0NsfRVI/2Fc0o3UYNMAsJka6EhcGj9/DAAjX6bpJH0/6sucE17wB4PIfEyN1EC6FeaNCDpXPDA71SgXf9JuwpTJEp10TJS1PiK0twBvdX2H5HrJHTtMFTFh69JMnegzy3bf0SSVuui46y/N4P0B2tKXaDzhDNON+A4hqck8COAVdPFs4E9QIRobsAakfkvQgUubidMkKDVl+lBfYFzxpMBKPVuChqg3qBmBJqmb6AQuDqqtTuAwjcRh8jeJSvLpgFwdTqVj97SIHkE9OzflIEPAI3QGmYReksD5w4lA3xVKjwARGJaeQk1iYlVgmoZ/Re8A5XfBlJmgA9kCOMOVJbkX+UD/6l9EZQbNaIQ2jW23YCjAazrtlIGnSWzkhhYA+kvRnMFYlRD4RrZrGYxCBghCf3aNVDoRVDSSDOdBk03opJqCiBxEkYwl2uawj0jEr2luTsModB0l8F+OeazAQWdw5bCIQHvR+DJBJPPzHgAilRwgkLjiRc4R+OxpR1m8yPsOxqbJcjua0n05gqjiGmbh0a+hblCI9rlvJGIok2tRKe8Y0MQvWS+SAQhlc58BMUaVuEyov/YE4nAP+xiMcj/txGEVOeqHxJB8qXz40DZiElH7S+otk4vEhWUFXQ+Pogm6mNtzysQSW/3s0ZfAc5atxOR/29pV1LTDjzMsgE6r4vcIjlrWZY2o1JRbOpMFPIfuogR0pXmRs0VdJ+8y3GqfYtTRETgzaiCqF6sSBKDSeeeoQyD7D4skBH2bYQbKt/GJ61yQ3HNa2waiKEBIUF6hN2UWgMkGG4KAQUiBsTmv8kiG1Fr/jw/x1UxKMCD8tjXLDeq/RlSqE3PjKZHvK0CoZQKhaoPtivDWoyr6YnUhbWoaVGSJPIQP7P+4YNirNxYsRLW01yfgoJJg8rSIppEfLFB/fQWPBTcgpXooN2rhFFV2KDAdaSZ/c3KXrVRv35mxUS5MfPDAQU/ddgocC0GJcl0XOSixy8DUrhhZVCvtK8BgzR3dQDLMwd2Z2lIDET2N8pFqRnFpI6ViICfe7BOyDIdaDBrp/DzPyVhulGw7ah+6mvDAtm7uEJ2m66yjVhSV3zKgge/WD/rtp3HXMPVUGLioU4ddZ0M7zrf6yfj3rmS62aT3v8AkghbSn49GlR/OaKdQH/hB2dqf97FF+Pro+AYLiQpHyxr2DMzoteVNMPvRCqb+1eQ9oI9Mw8hX/ybEf6A/b00OoDpHLA2Sz38CAmjUfmj3PX9q8CMRFLkqacJ9h+OqozRjVS1prA3LgkzFk8/hz2k4/rq14Zi0pTCXp2InN8/Jhnq7Rqbyd27vEiw/xwajsaA/SFjYw89A3qGol+W4l7uZ/MXbmbLwPArTtzVbXuid5PCOO3fiV94psLY8qa1oxsT+/vE4EyFF9bAbeqg4MBE+evRX5YLBwm8CF44NoKc1GaIEx8vU/sH6OIigtf5MbAunTu44Cyqx7IR3NIBWdjj+aFGUke9E3k4io380psVsBuMBN9gtDjtYHQrDgRIouA5UX16HHf5OKoWnRvcioPeoN/DJ/oh+nL0uLnADRO/2hG+w3QjGKeJ57WBOVV4eKmzkt9ZPeS6ZJRDxq3IYb/rjhOADpuyF5n1cRQg0kDM90RFebij0OWYwFNmctnYw9uiVk08NQhOu8Cyd1AKA2K7l8Y0cnhr7BGrWKzf8Ggwx03Ly8rwokoVoJcl+pAJGwVGpNy3+UTHRH/jKJc1TP8T16hQghGsyWvnFDbY7i7kLcBcJNg5haXJtK+AghnhVPnp0yYVrJdKTSCfatGlikjg7IEJWwtm+S4NGzJDxW9ob/IO0w3l0hC6ns62nMEuHZZms8BiXuzqLC1bfFdFrrMwMkIWw0HQLVBVhvceHw2IQ6gZq28SWv0AkKVJpNiHY14+4+KOO+hBAGRWFzkjvscH0CBvTNO4QWgEm/Q7AYJGRF5qpemDQYLGbwcTDZpAWszg0qlPuV6mBVkioBP6sHTK/4QECEoR6j11WDr1OYImJY113R6FpVO+pnRqoali0RsmIHXhba6cDmtNJZJ2GgdqRPQ131GHheYWdH3nCjIVPkTQzDVROoMLxaCgmf7qbQPoMq0m3gESNGL619dDmy0nfaYbUJXpBwiapbbiwWT8HRrT6m2AJcZBGyg3ukULlWD6ugIAItLXc5h1jaM097sFTa6vdDCc74emJ/q6qKIfM4OCHFPfB01PpL/P9rgP4ukmYBQG6TgeGM63QGNa4QjL6LTJmGA8UHIiGs1SqqYjRuzaStb5OWW/AWslJqDRMA9n7PmgHPdrWGC5qi6SqefVlazdSqRlbZZnZMauHSw2efrV9lgnov9sKOGQxmVsmGO08F1R/9pPoio6Fd8MUHejUWZuWgxPpvlFbs5BPPykc5vX83Maknmi24oiOY51l6NDaZrr58xi16B6IXaarary5dgRi4p4TBpnGzPj2mnObY4FvKzlwoypu0GJy24YkdvzxSLFrxKrxLTm4h9LhCKocrt8VTTfJebZ/QbMsjvccVX9tbXuPDejcj3fZMJyq9gOMSCuIB0O3vaCxsWcMgaW8yIuQRqYgrRtNNcPyR+INqErRbmvitVpMZut11EUrdezxXa+Ou72iWyIszzm3VPth2saXOUwBl3mmomWnmsSWwjG2v8/7HFhYm8jEqUbnwdt03sfpmWhU/D+cmgNqEvjPwysHOTF6G8Y+xBwMfDGBYP7tz4CLBmaBvs/BA0fMaXwvziGrz3u5kDJ308Cu4wpccXXW38K1MgxmgbXb70VXMYjK3hh35p+7QFGpfUa4ntsAGg9zKLhoRDZJh3TCWOyiszGl37q76Z6QeP9Bd/XeUe2pfd264i9i0KQoxUPG69PBvXxYeNsY33F9iCEsnIToDQXNLzxgcpq9aKX1oX57AfjtcSlcFXmAnIyr9TJ8pwjoZZn0mH3PWdy7268G7yj85E6wbPNif6ks6J0QyRnIh0ddn0ESv7elmuESrgvzM77oijFyFERHXmO0zz4qsZWqCTxweq0L48Zsw8s/azHMtfkfaHkbxcoq1ZDbIko3yXWceTmIITpeT5JCd2rRdPq8ma1MZbSbH7OQmkUSOOd/tkXmmM+As/h7ubY8WzY7MIXLPJNXHLBWNct8rpLwjbqxpP9Jp/2poiD/FmSSV4fXVeTLk+HoqrTJGCygWjQ/g9PsnhXrE4zH6Wd+0ZbN9pOJNVh6ls31ssO3q+DOmaXbAN1+f+Of2+Fz3t0kRawAAAAAElFTkSuQmCC"/>
            </a>
        </div>
        <div class="SMS">
            <a href="sms://?body=${encodeURIComponent(url)}">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRokSQ1YYuMegp9hrh6nazJQWhVU5NQ-5kWxzFaqWNg3veQ2zmB&usqp=CAU" />
            </a> 
        </div>
        <div class="LinkedIn">
            <a target="_blank" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRllaU23PZO3-aqmB8Fx6CK5a0xYO1EJszZ04BCGhuAAHG5Nuks&usqp=CAU"/>
            </a>
        </div>
        <div>
            <img src="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png"/>
        </div>
    </div>`

const jouer = (id) => `
    <div class="jouer">
        <button class="miser" hx-post="/miser" hx-target='closest .jouer'>Faire une offre</button>
        <button class="procurer" hx-post="/procurer/${id}" hx-target='closest .jouer'>Se procurer</button>
    </div>`

/* This is U, a program that thinks FROM natural languages NOT IN programming languages*/

//Utils
const anU = c => c!="" && (c=="(" || c==")" || c=="+" || c=="-" || c=="#" || c=="/" || c=="." || c=="@" || c==":" || c=="_" || c=="&" || c=="?" || c=="%")
const aD = c => c!="" && (c=="0" || c=="1" || c=="2" || c=="3" || c=="4" || c=="5" || c=="6" || c=="7" || c=="8" || c=="9")
const aM = c => c!="" && (c=="A" || c=="B" || c=="C" || c=="D" || c=="E" || c=="F" || c=="G" || c=="H" || c=="I" || c=="J" || c=="K" || c=="L" || c=="M" || c=="N" || c=="O" || c=="P" || c=="Q" || c=="R" || c=="S" || c=="T" || c=="U" || c=="V" || c=="W" || c=="X" || c=="Y" || c=="Z")
const decapsulated = text => {
    if (text.charAt(text.length-1)==")")
        return text.substring(text.charAt(0)=="("?1:0,text.slice(-1)==")"?text.length-1:text.length);
    return text;
}
const pointified = text => anU(text.charAt(text.length-1))?text:(text+".")

//Parser
const p = t => {
    var parsed=[];
    if (!t)
        return parsed;
    var le=t.length;
    
    ///Detecting Questions
    var last=t.slice(-1);
    if (last=="?")
        return [last+" ",t.substring(0,le-1)];

    ///Detecting Facts, Determination and Conjonctions

    var first=t.charAt(0);
    if (!anU(first))
        return [first,t.substring(1,le)];
    var op=0;
    var remaining=t;
    var counting_combi=-1;
    var verb_start=-1;
    var possession=-1;
    for (var j=0;j<le;j++) {
        var c=t.charAt(j);
        counting_combi=counting_combi+1;
        if (c=="(")
            op=op+1;
        else if (c==")")
            op=op-1;
        else if (op==0) {
            var n=t.charAt(j+1);
            if ((c=="+" || c=="-") && n=="." && t.charAt(j-1)!="_") {
                if (t.charAt(j-1)=="/") {
                    var plural= (t.charAt(j-2)=="/");
                    parsed[0]=(plural ? "//" : "/")+c+".";
                    parsed[1]="("+t.substring(0,j)+(plural ? "" : "/")+")."+(t.charAt(j+2)=="("?"":"(")+t.substring(j+2)+(t.charAt(le-1)==")"?"":")");
                    break;
                }
                else if (t.charAt(j-1)!="@") {
                    parsed[0]=c+".";
                    parsed[1]=decapsulated(t.substring(0,j));
                    parsed[2]=decapsulated(t.substring(j+2,last=="."?le-1:le));
                    break;
                }
            }
        else if ( c=="&" || (c=="." && t.charAt(j+1)=="(" && n!="") || c=="?" ||  (c=="_" && anU(n)) || j==(le-1) ) {
            if (!parsed[0] && j<(le-1))
                parsed[0]=c;
            if (parsed[0]==c) {
                parsed.push(decapsulated(remaining.substring(0,counting_combi)));
                remaining=remaining.substring(counting_combi+1);
                counting_combi=-1;
            }
        }
        else if (c==":" && n!="" && !anU(n) && verb_start==-1)
            verb_start=j+1;
        else if (c=="#" && possession==-1 && j>0 && ( t.charAt(j-1)==")" || t.charAt(j-1)=="+" || t.charAt(j-1)=="/" || !anU(t.charAt(j-1))))
            possession=j;
        }
    }
    var f=parsed[0];
    if (f) {
        if (f=="." || f=="?" || f=="&" || f=="_")
            parsed.push(decapsulated(remaining));
        if (f=="." && parsed[1].charAt(0)=="@" && !anU(parsed[1].charAt(1))) {
            var for_adj=[];
            for_adj[0]="@%";
            for_adj[1]=parsed[1].substring(1);
            var modifier=decapsulated(parsed[2]);
            var pm=p(modifier);
            if (pm[0]=="_")
                return for_adj.concat(pm);
            else {
                for_adj.push(parsed[2]);
                return for_adj;
            }
        }
        else
            return parsed;
    }
    var at=(first=="@");
    var postp=t.indexOf(":");
    if (at || last==":" || verb_start!=-1) {
        parsed[0]=(at?"@":"")+last;
        parsed[1]=verb_start!=-1?decapsulated(t.substring(at?1:0,verb_start-1)):decapsulated(t.substring(at?1:0,le-1))
        if (verb_start!=-1)
            parsed[2]=t.substring(verb_start,le-1)
        return parsed;
    }
    if (possession>0) {
        parsed[0]="%#";
        parsed[1]=decapsulated(t.substring(0,possession));
        parsed[2]=t.substring(possession);
        return parsed;
    }
    if (first=="#") {
        parsed[0]="#"+(last=="/"?t.charAt(le-2)=="/"?"//":"/":".");
        parsed[1]=decapsulated(t.substring(1,last=="/"?t.charAt(le-2)=="/"?(le-2):(le-1):last=="."?(le-1):le));
        return parsed;
    }
    if (first=="+") {
        parsed[0]="+";
        return parsed.concat(t.substring(1).split("_"));
    }
    else
        return p(decapsulated(t));
}
//Interpreter
const from = t => {
    t=t.replace(/\s/g,"");
    var parsed=p(t);
    //console.log(parsed)
    var f=parsed[0];
    if (f=="? ") {
        var in_memory=memory[parsed[1]];
        if (in_memory)
            return "("+in_memory+")";
        else {
            var q = p(parsed[1]);
            if (q[0] == ".") {
                q=q.slice(1);
                var l = q.length;
                var answer = readFromMemory(q[0])
                var j = 1;
                while (answer.length > 0 && j < l) {
                    var l2 = readFromMemory(q[j]);
                    var l3 = [];
                    var k=0;
                    for (var i=0; i < answer.length; ++i)
                        if (l2.indexOf(answer[i])!=-1)
                            l3[k++]=answer[i];
                    answer = l3 ;
                    j++;
                }
                if (answer.length == 0)
                    return "?";
                else
                    return "("+answer.map(function(el) {return "("+el+")";}).join("&")+")";
            }
            else if (q[0] == "/+.") {
                var intersection = from(q[1]+"?");
                if (intersection == "?")
                    return intersection;
                else {
                    var data = p(intersection);
                    if ("&_.?".indexOf(data[0].charAt(0))==-1)
                        return intersection
                    else
                        return "("+data.slice(1).join("?")+")";
                }
            }
            return "?"
        }
    }
    else if (f=="+.") {
        var psub=p(parsed[1]);
        var pobj=p(parsed[2]);
        
        if (".?&_".indexOf(psub[0])==-1 && ".?&_".indexOf(pobj[0])==-1) {
            if (psub[0]=="@." || psub[0]==":" || psub[0]=="@:") {
                var subordinated=parsed[1]+"+.+.";
                var obj=pointified(parsed[2]);
                var in_m=memory[obj];
                if (!in_m || in_m.indexOf("("+subordinated+")")==-1) {
                    addToMemory(subordinated,obj,"position");
                    if (psub[0]=="@.")
                        var indirected="@+"+(psub[2]?":"+psub[2]+".":".")+"+."+obj;
                    else if (psub[0]=="@:")
                        var indirected="@+"+(psub[2]?":"+psub[2]+":":":")+"+."+obj;
                    else
                        var indirected="+:"+(psub[2]?(psub[2]+":"):"")+"+."+obj;
                    addToMemory(indirected,pointified(psub[1]),"position");
                    saveMemoryTo("U.json",function() {
                    });
                }
            }
            else if (pobj[0]="#/") {
                var plural=parsed[2]+"/";
                var obj=pointified(parsed[1]);
                //console.log("one is between "+obj+" and "+plural);
                
                var in_m=memory[obj];
                if (!in_m || in_m.indexOf("("+parsed[2]+")")==-1) {
                    addToMemory(plural,obj,"type");
                    saveMemoryTo("U.json",function() {
                    });
                }
            }
            return  "+ok.";
        }
        else {
            return "?";
        }
    }
    else if (f=="-.") {
        var psub=p(parsed[1]);
        var pobj=p(parsed[2]);
        if (psub[0]=="@." || psub[0]=="@:" ) {
            var key="@"+psub[1]+":"+psub[2]+psub[0].charAt(1)+"+.+.";
            var current = memory[key];
            var obj = pointified(parsed[2]);
            if (current && current.indexOf("("+obj+")")!=-1) {
                var nextCurrent = (current+"&").replace("("+obj+")&","");
                //console.log("next current 1 is "+nextCurrent.substring(0,nextCurrent.length-1)+" for "+key)
                if (nextCurrent == "")
                    delete memory[key];
                else
                    memory[key]= nextCurrent.substring(0,nextCurrent.length-1);
                var current2 = memory[obj]+".";
                var nextCurrent2 = current2.replace("("+key+").","");
                //console.log("next current 2 is "+nextCurrent2.substring(0,nextCurrent2.length-1)+" for "+obj)
                if (nextCurrent2 == "")
                    delete memory[obj];
                else
                    memory[obj] = nextCurrent2.substring(0,nextCurrent2.length-1);
                var subj = pointified(psub[1]);
                var current3 = memory[subj]+".";
                var key2 = "@+:"+psub[2]+psub[0].charAt(1)+"+."+obj;
                var nextCurrent3 = current3.replace("("+key2+").","");
                //console.log("next current 3 is "+nextCurrent3.substring(0,nextCurrent3.length-1)+" for "+subj)
                if (nextCurrent3 == "")
                    delete memory[subj];
                else
                    memory[subj] = nextCurrent3.substring(0,nextCurrent3.length-1);
                var current4 = memory[key2]+"&";
                var nextCurrent4 = current4.replace("("+subj+")","");
                //console.log("next current 4 is "+nextCurrent4.substring(0,nextCurrent4.length-1)+" for "+key2)
                if (nextCurrent4 == "")
                    delete memory[key2];
                else
                    memory[key2] = nextCurrent4.substring(0,nextCurrent4.length-1);
                saveMemoryTo("U.json",function() {
                    return "+ok.";
                });
            }
            else
                return "+ok.";
        }
        else 
            return "+ok.";
    }
    else if (f=='.' && parsed[1]=="@+english.") {
        var english="";
        if (parsed[2]=="?")
            return "?";
        var toe=p(parsed[2]);
        var fi=toe[0];
        if (fi=="+") {
            for (var i=1;i<toe.length;i++) {
                var w=toe[i].charAt(toe[i].length-1)=="."?toe[i].substring(0,toe[i].length-1):toe[i];
                english+=w.charAt(0).toUpperCase()+w.substring(1,w.length)+" ";
            }
            english=english.substring(0,english.length-1);
        }
        else if (!anU(fi.charAt(0))) {
            english=fi+toe[1];
        }
        else if (fi=="#." || fi=="#/" || fi=="#//") {
            english=(fi=="#."?"every ":fi=="#/"?"one ":"")+from("(@+english.).("+toe[1]+")")+(fi=="#//"?"s":"");
        }
        else if (fi=="/+." || fi=="//+.") {
            english="the "+from("(@+english.).("+toe[1]+")");
        }
        else if (fi=="+." || fi=="-.") {
            var sub=p(toe[1]);
            var obj=p(toe[2]);
            var head=from("(@+english.).("+toe[1]+")");
            var tail=from("(@+english.).("+toe[2]+")");
            if (sub[0]=="@." || sub[0]=="@:" || sub[0]==":") {
                var verb=sub[2];
                var subor=p(sub[1])[0];
                var fact=(obj[0]=="+." || obj[0]=="-.");
                if (subor=="+." || subor=="-.")
                    english=head+", "+tail;
                else if (!verb) {
                    if (sub[0]==":" && fact && p(obj[1])[0]=="@:" && !p(obj[1])[2]) {
                        english=head+", "+from("(@+english.).("+obj[1]+")")+" , that "+from("(@+english.).("+obj[2]+")");
                    }
                    else
                        english=(fact?head+", ":sub[1]=="+"?head+" is ":tail+" is ")+(fi=="+."?"":"not ")+((fact || sub[1]=="+")?tail:head);
                }
                else {
                    if (fi=="+.")
                        english=head+" "+((obj[0]=="+." || obj[0]=="-.")?" that ":"")+tail;
                    else {
                            var aux=head.indexOf("did")!=-1?(head.indexOf("did")+4):head.indexOf("will")!=-1?(head.indexOf("will")+5):(head.indexOf("is")+3);
                            english=head.substring(0,aux)+"not "+head.substring(aux)+" "+((obj[0]=="+." || obj[0]=="-.")?" that ":"")+tail
                    }
                }
            }
            else
                english=head+" is "+tail; 
        }
        else if (fi=="@." || fi=="@:" || fi==":") {
            var verb=toe[2];
            var sub=p(toe[1]);
            var fact=(sub[0]=="+." || sub[0]=="-.")
            if (!verb)
                english=(fact?(fi=="@."?"while ":fi==":"?"because ":"to that "):(fi=="@."?"at ":fi=="@:"?"to ":"from "))+(toe[1]=="+"?" which ":from("(@+english.).("+toe[1]+")"));
            else
                english=((fact || toe[1]=="+")?"that ":from("(@+english.).("+toe[1]+")"))+" "+(fi=="@:"?("will "+verb):fi==":"?("did "+verb):("is "+verb.substring(0,verb.charAt(verb.length-1)=="e"?verb.length-1:verb.length)+"ing"));
        }
        else if (fi=="." || fi=="&" || fi=="_" || fi=="?") {
            for (var i=1;i<toe.length-1;i++)
                english+=((fi=="_"&&i!=1)?" then ":"")+from("(@+english.).("+toe[i]+")")+", ";
            english=english.substring(0,english.length-2)+(fi=="?"?" or ":fi=="_"?" then ":(fi=="&" || toe.length>3)?" and ":" ")+from("(@+english.).("+toe[toe.length-1]+")");
        }
        else if (fi=="%#") {
            english=from("(@+english.).("+toe[2]+")")+" of "+from("(@+english.).("+toe[1]+")");
        }
        else if (fi=="@%") {
            if (toe[2]=="_") {
                if (toe[3]=="-")
                    english="least "+toe[1];
                else if (toe[4]=="-.")
                    english="most "+toe[1];
                else if (toe[3]=="+")
                    english="less "+toe[1]+" than "+from("(@+english.).("+toe[4]+")");
                else if (toe[4]=="+.")
                    english="more "+toe[1]+" than "+from("(@+english.).("+toe[3]+")");
            }
            else
                english="as "+toe[1]+" as "+from("(@+english.).("+toe[2]+")");
        }
        else if (fi=="? ") {
            english=from("(@+english.).("+toe[1]+")")+" ?";
        }
        return english;
    }
    else if (f=='.' && parsed[1]=="@+html.") {
      var toe = p(parsed[2]);
      var fi = toe[0];
      if (fi == "." || fi == "&") {
        return `<ul>${toe.slice(1).map(x => `<li>${from(`(@+html.).(${x})`)}</li>`).join("")}</ul>`
      }
      else { 
        var plural = fi == "#/" ? "/":"";
        return `<a href="#" class="u-link" id="${parsed[2]+plural}?">${from(`(@+english.).(${parsed[2]})`)}</a>`
      }
    }
    else
        return "?";
}
