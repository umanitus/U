addEventListener('fetch', event => {                                // Un Service sans Serveurs à opérer
  event.respondWith(HOST.handleRequest(event.request))   
})

// Hôte
const HOST = {
    name:"CLOUDFLARE_WORKERS",                                      // Au-delà des VMs de x86 et des conteneurs de Linux, les Isolates de V8 : plus léger et réactif
    handleRequest: async (request) => {
        let {status, headers, body} = await U(HOST,request);        // HTTP comme réponse
            return new Response(body, {
                status,
                headers
        })
    },
    fromHTTP: async req => {
        let response = {};
        let link = new URL(req.url);
        let parts = link.pathname.split("/");
      
        response.chemin = parts[1];                                 // Un chemin pour chaque umain
      
        let cle = link.searchParams.get("cle");                     // Une clé pour la lecture par un U
      
        if (!cle) {
            let cookie_string = req.headers.get("cookie");          // Une clé le quotidien par un propriétaire
            let cookies = cookie_string ? cookie_string.split(";") : [] ;
            for (let i = 0;i<cookies.length;i++) {
                let kv = cookies[i].split("=");
                if (kv[0].trim() == "cle") {
                    cle = kv[1];
                    break;
                }
            }
        }
        response.cle = cle ;
      
        let sujet = parts[2] ? '/'+decodeURIComponent(decodeURIComponent(parts[2])) : '';
        if (req.method == 'GET') {                                  // Un GET est une question
            response.message = sujet + '?';
        }
        else {
            let contentType = req.headers.get("content-type").split(";")[0];
            let objet = '';
            if (contentType == 'application/x-www-form-urlencoded') {
                let body = await req.text();
                let params = body.split("&");
                if (params[1]) {
                    let s = params[1].split("=");
                    if (s[0] == "secret") {                         // Une clé pour ouvrir le domicile
                        response.cle = await HOST.hashed(new TextEncoder().encode(SALT+s[1])); 
                    }
                }                                                   // Une URL comme objet
                objet = params[0] ? decodeURIComponent(params[0].split("=")[1]) : '';  
            }
            else {                                                  // Un Blob à traiter
                let content = contentType.split("/");
                let myBlob = await req.arrayBuffer();
                let hash = await HOST.hashed(myBlob);               // Un hash comme identité
                let url = await HOST.save(hash,myBlob,contentType); // Une URL comme sauvegarde
                                                                    // Un objet comme un contenu en SHA256 et sur le Web
                objet = `/#${content[0]}/+.(+.@+sha256.+.+${hash}.).(+.@+www.+.(${url}))` 
            }
            if (req.method == "POST") {                             // Un POST est un ajout
                response.message = `(${sujet})+.(${objet})`   
            }
            else if (req.method == "PUT") {
                response.message = `(#(${objet})/+.)+.(${objet})`   // Un PUT est une définition
            }
            else if (req.method == "DELETE") {
                response.message = `(${sujet})-.(${objet})`         // Un DELETE est un retrait
            }
        }
        return response;
    },
    save: async (id, blob, type) => {                               // Des blobs immuables sur un bucket AWS S3
        const encoder = new TextEncoder('utf-8');                   // La librairie de AWS4Fetch
        const HOST_SERVICES = {
            'appstream2': 'appstream',
            'cloudhsmv2': 'cloudhsm',
            'email': 'ses',
            'git-codecommit': 'codecommit',
            'marketplace': 'aws-marketplace',
            'mobile': 'AWSMobileHubService',
            'mturk-requester-sandbox': 'mturk-requester',
            'pinpoint': 'mobiletargeting',
            'queue': 'sqs',
            'personalize-runtime': 'personalize',
        };

        // https://github.com/aws/aws-sdk-js/blob/cc29728c1c4178969ebabe3bbe6b6f3159436394/lib/signers/v4.js#L190-L198
        const UNSIGNABLE_HEADERS = [
            'authorization',
            'content-type',
            'content-length',
            'user-agent',
            'presigned-expires',
            'expect',
            'x-amzn-trace-id',
            'range',
        ];
        class AwsClient {
            constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs }) {
                if (accessKeyId == null) throw new TypeError('accessKeyId is a required option')
                if (secretAccessKey == null) throw new TypeError('secretAccessKey is a required option')
                this.accessKeyId = accessKeyId;
                this.secretAccessKey = secretAccessKey;
                this.sessionToken = sessionToken;
                this.service = service;
                this.region = region;
                this.cache = cache || new Map();
                this.retries = retries != null ? retries : 10; // Up to 25.6 secs
                this.initRetryMs = initRetryMs || 50;
            }
            async sign(input, init) {
                if (input instanceof Request) {
                const { method, url, headers, body } = input;
                init = Object.assign({ method, url, headers }, init);
                if (init.body == null && headers.has('Content-Type')) {
                init.body = body != null && headers.has('X-Amz-Content-Sha256') ? body : await input.clone().arrayBuffer();
                }
                input = url;
                }
                const signer = new AwsV4Signer(Object.assign({ url: input }, init, this, init && init.aws));
                const signed = Object.assign({}, init, await signer.sign());
                delete signed.aws;
                return new Request(signed.url, signed)
            }
            async fetch(input, init) {
                for (let i = 0; i <= this.retries; i++) {
                    const fetched = fetch(await this.sign(input, init));
                    if (i === this.retries) {
                        return fetched // No need to await if we're returning anyway
                    }
                    const res = await fetched;
                    if (res.status < 500 && res.status !== 429) {
                        return res
                    }
                    await new Promise(resolve => setTimeout(resolve, Math.random() * this.initRetryMs * Math.pow(2, i)));
                }
            }
        }
        class AwsV4Signer {
            constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }) {
                if (url == null) throw new TypeError('url is a required option')
                if (accessKeyId == null) throw new TypeError('accessKeyId is a required option')
                if (secretAccessKey == null) throw new TypeError('secretAccessKey is a required option')

                this.method = method || (body ? 'POST' : 'GET');
                this.url = new URL(url);
                this.headers = new Headers(headers);
                this.body = body;

                this.accessKeyId = accessKeyId;
                this.secretAccessKey = secretAccessKey;
                this.sessionToken = sessionToken;

                let guessedService, guessedRegion;
                if (!service || !region) {
                    [guessedService, guessedRegion] = guessServiceRegion(this.url, this.headers);
                }
                this.service = service || guessedService;
                this.region = region || guessedRegion;

                this.cache = cache || new Map();
                this.datetime = datetime || new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
                this.signQuery = signQuery;
                this.appendSessionToken = appendSessionToken || this.service === 'iotdevicegateway';

                this.headers.delete('Host'); // Can't be set in insecure env anyway

                const params = this.signQuery ? this.url.searchParams : this.headers;
                if (this.service === 's3' && !this.headers.has('X-Amz-Content-Sha256')) {
                    this.headers.set('X-Amz-Content-Sha256', 'UNSIGNED-PAYLOAD');
                }

                params.set('X-Amz-Date', this.datetime);
                if (this.sessionToken && !this.appendSessionToken) {
                    params.set('X-Amz-Security-Token', this.sessionToken);
                }

                // headers are always lowercase in keys()
                this.signableHeaders = ['host', ...this.headers.keys()]
                .filter(header => allHeaders || !UNSIGNABLE_HEADERS.includes(header))
                .sort();

                this.signedHeaders = this.signableHeaders.join(';');

                // headers are always trimmed:
                // https://fetch.spec.whatwg.org/#concept-header-value-normalize
                this.canonicalHeaders = this.signableHeaders
                .map(header => header + ':' + (header === 'host' ? this.url.host : this.headers.get(header).replace(/\s+/g, ' ')))
                .join('\n');

                this.credentialString = [this.datetime.slice(0, 8), this.region, this.service, 'aws4_request'].join('/');

                if (this.signQuery) {
                    if (this.service === 's3' && !params.has('X-Amz-Expires')) {
                        params.set('X-Amz-Expires', 86400); // 24 hours
                    }
                    params.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
                    params.set('X-Amz-Credential', this.accessKeyId + '/' + this.credentialString);
                    params.set('X-Amz-SignedHeaders', this.signedHeaders);
                }

                if (this.service === 's3') {
                    try {
                        this.encodedPath = decodeURIComponent(this.url.pathname).replace(/\+/g, ' ');
                    } catch (e) {
                        this.encodedPath = this.url.pathname;
                    }
                } else {
                    this.encodedPath = this.url.pathname.replace(/\/+/g, '/');
                }
                if (!singleEncode) {
                    this.encodedPath = encodeURIComponent(this.encodedPath).replace(/%2F/g, '/');
                }
                this.encodedPath = encodeRfc3986(this.encodedPath);

                const seenKeys = new Set();
                this.encodedSearch = [...this.url.searchParams]
                    .filter(([k]) => {
                        if (!k) return false // no empty keys
                        if (this.service === 's3') {
                            if (seenKeys.has(k)) return false // first val only for S3
                                seenKeys.add(k);
                        }
                        return true
                    })
                    .map(pair => pair.map(p => encodeRfc3986(encodeURIComponent(p))))
                    .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0)
                    .map(pair => pair.join('='))
                    .join('&');
            }
            async sign() {
                if (this.signQuery) {
                    this.url.searchParams.set('X-Amz-Signature', await this.signature());
                    if (this.sessionToken && this.appendSessionToken) {
                        this.url.searchParams.set('X-Amz-Security-Token', this.sessionToken);
                    }
                } else {
                    this.headers.set('Authorization', await this.authHeader());
                }

                return {
                    method: this.method,
                    url: this.url,
                    headers: this.headers,
                    body: this.body,
                }
            }
            async authHeader() {
                return [
                    'AWS4-HMAC-SHA256 Credential=' + this.accessKeyId + '/' + this.credentialString,
                    'SignedHeaders=' + this.signedHeaders,
                    'Signature=' + (await this.signature()),
                ].join(', ')
            }
            async signature() {
                const date = this.datetime.slice(0, 8);
                const cacheKey = [this.secretAccessKey, date, this.region, this.service].join();
                let kCredentials = this.cache.get(cacheKey);
                if (!kCredentials) {
                    const kDate = await hmac('AWS4' + this.secretAccessKey, date);
                    const kRegion = await hmac(kDate, this.region);
                    const kService = await hmac(kRegion, this.service);
                    kCredentials = await hmac(kService, 'aws4_request');
                    this.cache.set(cacheKey, kCredentials);
                }
                return hmac(kCredentials, await this.stringToSign(), 'hex')
            }
            async stringToSign() {
                return [
                    'AWS4-HMAC-SHA256',
                    this.datetime,
                    this.credentialString,
                    await hash(await this.canonicalString(), 'hex'),
                ].join('\n')
            }
            async canonicalString() {
                return [
                    this.method.toUpperCase(),
                    this.encodedPath,
                    this.encodedSearch,
                    this.canonicalHeaders + '\n',
                    this.signedHeaders,
                    await this.hexBodyHash(),
                ].join('\n')
            }
            async hexBodyHash() {
                if (this.headers.has('X-Amz-Content-Sha256')) {
                    return this.headers.get('X-Amz-Content-Sha256')
                } else {
                    return hash(this.body || '', 'hex')
                }
            }
        }
        async function hmac(key, string, encoding) {
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                typeof key === 'string' ? encoder.encode(key) : key,
                { name: 'HMAC', hash: { name: 'SHA-256' } },
                false,
                ['sign']
            );
            const signed = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(string));
            return encoding === 'hex' ? buf2hex(signed) : signed
        }
        async function hash(content, encoding) {
            const digest = await crypto.subtle.digest('SHA-256', typeof content === 'string' ? encoder.encode(content) : content);
            return encoding === 'hex' ? buf2hex(digest) : digest
        }
        function buf2hex(buffer) {
            return Array.prototype.map.call(new Uint8Array(buffer), x => ('0' + x.toString(16)).slice(-2)).join('')
        }
        function encodeRfc3986(urlEncodedStr) {
            return urlEncodedStr.replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase())
        }
        function guessServiceRegion(url, headers) {
            const { hostname, pathname } = url;
            const match = hostname.replace('dualstack.', '').match(/([^.]+)\.(?:([^.]*)\.)?amazonaws\.com(?:\.cn)?$/);
            let [service, region] = (match || ['', '']).slice(1, 3);

            if (region === 'us-gov') {
                region = 'us-gov-west-1';
            } else if (region === 's3' || region === 's3-accelerate') {
                region = 'us-east-1';
                service = 's3';
            } else if (service === 'iot') {
                if (hostname.startsWith('iot.')) {
                    service = 'execute-api';
                } else if (hostname.startsWith('data.jobs.iot.')) {
                    service = 'iot-jobs-data';
                } else {
                    service = pathname === '/mqtt' ? 'iotdevicegateway' : 'iotdata';
                }
            } else if (service === 'autoscaling') {
                const targetPrefix = (headers.get('X-Amz-Target') || '').split('.')[0];
                if (targetPrefix === 'AnyScaleFrontendService') {
                    service = 'application-autoscaling';
                } else if (targetPrefix === 'AnyScaleScalingPlannerFrontendService') {
                    service = 'autoscaling-plans';
                }
            } else if (region == null && service.startsWith('s3-')) {
                region = service.slice(3).replace(/^fips-|^external-1/, '');
                service = 's3';
            } else if (service.endsWith('-fips')) {
                service = service.slice(0, -5);
            } else if (region && /-\d$/.test(service) && !/-\d$/.test(region)) {
                [service, region] = [region, service];
            }
            return [HOST_SERVICES[service] || service, region || 'us-east-1']
        }
        const aws = new AwsClient({ accessKeyId: AWS_S3_ACCESS_KEY, secretAccessKey: AWS_S3_SECRET_KEY });
        const url = 'https://s3.eu-west-3.amazonaws.com/umanitus.com/'+id;
        console.log("to upload new file");
        const res = await aws.fetch(url, { method:"PUT", body: blob, headers: new Headers({
            "x-amz-acl": "public-read",
            "content-type":type
        })});
        return url ;
    },
    get: async key => {                                             // L'hôte permet de lire des clés                                   
        return await MY_KV.get(key);
    },
    set: async (key,value) => {                                     // L'hôte permet d'écrire des clés
        return await MY_KV.put(key,value);
    },
    list: async key => {    
        let buffer = await MY_KV.list({prefix:key});                // L'hôte permet de scanner des clés
        return buffer.keys.map(k => k.name.split('.').slice(1).join('.'));         
    },
    hashed: async (bytes) => {                                      // L'hôte permet de hasher des blobs
        const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },
    makeKey: () => crypto.getRandomValues(new Uint8Array(40))       // L'hôte permet de générer des nombres aléatoire
}
// U
const U = async (host, request) => {
    let {chemin, cle, message} = await host.fromHTTP(request);      // Important dans la requête
   
                                                                    // Par défaut, la mémoire est segmentée par umain
    const get = async key => {                                      // Aller chercher une valeur brute en mémoire
        return await host.get(chemin+key);  
    }
    const set = async (key,value) => {                              // Mémoriser une valeur brute
      await host.set(chemin+key,value);
    }
    const list = async key => {                                     // Aller chercher toutes les versions
        return await host.list(chemin+key)
    }

                                                                    // IO
    const style = `
        <style>
            body {
                font-family: 'Roboto', sans-serif;
                margin:0;
                background-color:#F4F4F4;
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
                box-shadow: 0px 15px 10px -15px #111;
            }
            nav img {
                height:100%;
            }
            nav .stats {
                flex-grow:2;
                text-align:center;
            }
            nav #actions {
                padding:10px;
                position:relative;
            }
            nav #actions div {
                float:right;
            }
            #cards {
                margin-top:17%;
            }
            .card {
                background-color:white;
                margin:3%;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
                display:flex;
                border-radius: 0px;
                flex-direction: column;
                border:0;
            }
            .card .media img, .card .media video {
                width:100%;
            }
            .card .description, .tags, .actions {
                padding-left:5%;
                padding-right:5%;
            }
            .tags {
                display:flex;
                flex-wrap: wrap;
            }
            .tag {
                display:flex;
                justify-content:space-between;
                width:max-content;
                align-items:center;
                background-color:#32064A;
                color:white;
                font-size:100%;
                border-radius:30px;
                padding:2%;
                margin-right:2%;
                margin-bottom:1%;
            }
            .tag .value {
                margin-right:10px;
            }
            .actions {
                padding-bottom:2%;
                display:flex;
                flex-direction:column;
            }
            .actions button, input {
                width:100%;
                border-radius:5px;
                font-size:100%;
                box-shadow:  2px 1px 2px 1px rgba(0,0,0,0.6);
                padding:2%;
                margin-top:2%;
            }
            .actions button {
                color:white;
                border:none;
            }
            .actions input {
                color:black;
            }
        </style>` 
    const upload = `
        onload = () => {
            document.addEventListener('change', async e => {
                if (e.target.className == 'media') {
                    let file = e.target.files[0];
                    let sujet = encodeURIComponent(e.target.id);
                    let upload = await fetch('./'+sujet, {
                        method: 'POST',
                        body: file,
                        headers: new Headers({
                            "Content-Type": file.type
                        })
                    });
                    let carte = await upload.text();
                    //alert(carte);
                    document.getElementById("cards").innerHTML = carte ;
                }
            })
        }
        `
    const media = ({auteur,url}) => `
        <video poster="${auteur}" controls playsinline   style="width:100%" src="${url}">
		</video>`
    const tag = value => `
        <div class='tag'>
            <div class="value">${value}</div>
            <div class='close'>x</div>
        </div>`
   
    const action = ({name,objet,inputs,buttons}) => `
        <form ${ name && (name == 'login') ? `method='POST' action='./login'` : ''}>
            ${objet ? `<input type="hidden" name="o" value="${objet}"/>` : ''}
            ${inputs ? inputs.map(input).join('\n') : ''}
            ${buttons ? buttons.map(button).join('\n') : ''}
        </form>`
    const button = ({texte, couleur, url, target, methode }) => `
        <button 
            style="background-color:${couleur}" 
            ${ methode && (methode != 'login') ? `hx-post="./${encodeURIComponent(url)}" hx-swap="outerHTML" hx-target=${target ? `"${target}"`: "closest .card"} ` : ''}
        >
            ${texte}
        </button>`
    const input = ({type,list,texte,id,name,autocomplete,valeur}) => `
        <input 
            type='${type}' 
            ${list ? `list="${list}"` : ''} 
            placeholder="${texte || ''}" 
            value="${valeur || ''}"
            name="${name || ''}"
            ${ type != 'password' ? `hx-post="./${encodeURIComponent(id)}" hx-swap="outerHTML" hx-target='closest .card'` : ''}
        />
        ${list ? `<datalist>${list.map(item => `<option value=${item}>`).join('\n')}</datalist>` : ''}`
    const carte = ({auteur,media,description,tags,actions}) => `
        <article class = 'card'>
            <section class='media'>${media || ''}</section>
            <section class='description'>${description || ''}</section>
            <section class='tags'>${tags ? tags.map(tag).join('') : ''}</section>
            <section class='actions'>${actions ? actions.map(action).join('') : ''}</section>
        </article>`
    const page = ({owner,cartes}) => `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-title" content="Umanitus">
                <meta name="apple-mobile-web-app-status-bar-style" content="black">
                <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
                <meta http-equiv="Pragma" content="no-cache" />
                <meta http-equiv="Expires" content="0" />
                <link rel="apple-touch-icon" sizes="180x180" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png" type="image/png">
                <link rel="icon" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png">
                ${style}
                <script src="https://unpkg.com/htmx.org@0.3.0"></script>
                <script>${upload}</script>
            </head>
            <body>
                <nav>
                    ${ owner ? 
                     `<img src="${owner.image}"/>
                      <div class="stats">
                        <label>&#128993;</label>
                        <span style="color:yellow">${parseInt(owner.jetons)}</span>
                      </div>
                      <div class="stats">
                        <label><b>&#8593;</b></label>
                        <span>${ owner.niveau.substring(2, owner.niveau.substring(1).indexOf('/')+1)}</span>
                     </div>
                     <div id='actions'>
                        <div style="margin-left:20px">
                           <label for="(@/+:(@#+/:):+.#+/):+.+.">
                              <img src="https://s3.eu-west-3.amazonaws.com/umanitus.com/taster.png"/>
                           </label>
                           <input class="media" style="display:none" id="(@/+:(@#+/:):+.#+/):+.+." accept="video/*" capture type="file" />
                        </div>
                        <div style="margin-top:10px;">
                           <label for="(@#+/:(@/+:):+.#+/):+.+.">
                              <img style='height:70%' src='data:image/png;base64,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'/>
                           </label>
                           <input class="media" style="display:none" id="(@#+/:(@/+:):+.#+/):+.+." type="file" accept='audio/*' capture />
                        </div>
                     </div>` :''}
                </nav>
                <div id="cards">
                    ${ cartes.join('\n')}
                </div>
            </body>
        </html>`
    
    

     

    
    // Raccourcis
    const anU = c => c!="" && (c=="(" || c==")" || c=="+" || c=="-" || c=="#" || c=="/" || c=="." || c=="@" || c==":" || c=="_" || c=="&" || c=="?" || c=="%")
    const aD = c => c!="" && (c=="0" || c=="1" || c=="2" || c=="3" || c=="4" || c=="5" || c=="6" || c=="7" || c=="8" || c=="9")
    const aM = c => c!="" && (c=="A" || c=="B" || c=="C" || c=="D" || c=="E" || c=="F" || c=="G" || c=="H" || c=="I" || c=="J" || c=="K" || c=="L" || c=="M" || c=="N" || c=="O" || c=="P" || c=="Q" || c=="R" || c=="S" || c=="T" || c=="U" || c=="V" || c=="W" || c=="X" || c=="Y" || c=="Z")
    const dec = text => text.charAt(text.length-1)==")" ? text.substring(text.charAt(0)=="("?1:0,text.slice(-1)==")"?text.length-1:text.length) : text
    const pt = text => anU(text.charAt(text.length-1)) ? text : (text+".");
    const now = () => '@+'+new Date().toISOString()+'.';
    const oD = async props => {
        let vs = await Promise.all(Object.values(props).map(async k => f(k+'?')));
        return Object.fromEntries(new Map(Object.keys(props).map((k,i) => [k,vs[i] != '?' ? vs[i] : null])));
    }
    
    const p = t => {                                                // Parser depuis toute langue naturelle
        let parsed = [];
        if (!t)
            return parsed ;
        let l = t.length ;
        if (t.slice(-1) == '?') {    // Question
            parsed = ['','?',t.substring(0,l-1)];
            return parsed;
        }
        let parens = 0 ;
        parsed[2] = '';
        for (let i = 0;i<l;i++) {
            let c = t.charAt(i);
            if (c == '(') {
                parens++
            }
            else if (c == ')') {
                parens--;
            }
            if ((parens == 0) && anU(c)) {
                if (c == ')') {
                    parsed[2]+=c;
                }
                else if (c == "+" || c == '-') {
                    let n = i < l - 1 ? t.charAt(i+1) : "";
                    let p = i > 0 ? t.charAt(i-1) : "";
                    if (n == '.') {
                        if (p == '/') {
                            parsed = ['+','.','('+t.substring(0,i)+').'+t.substring(i+2)];
                            break;
                        }
                        else if (!p) {
                            parsed = ['.','+'];
                        }
                        else if (p != '@') {
                            parsed = ['','.', [c, dec(t.substring(0,i)) , dec(t.substring(i+2))]];
                            break;
                        }
                    }
                    else {
                        if (!parsed[0] )
                            parsed[0] = c;
                        else
                            parsed[2]+=c;
                    }
                }
                else if (c == '@') {
                    if (parsed[0] != '.')
                        parsed[0] = '@';
                    else
                        parsed[2]+=c;
                }
                else if (c== ':') {
                    if (i == l-1) {
                        parsed[1] = c;
                        if (parsed[0] != '@') {
                            parsed[0]='';
                            parsed[2]= pt(dec(t.substring(0,l-1)))
                        }
                        else {
                            parsed[2] = pt(dec(parsed[2]));
                        }
                    }
                    else {
                        if (parsed[0] !='@')
                            parsed = [c, pt(dec(t.substring(0,i)))];
                            parsed[2] ='';
                    }
                }
                else if (c=='.' || c == '&' || c == '?' || c == '_') {
                    if (i == l-1 && parsed[0]!= '.') {
                        parsed[1] = c;
                        parsed[2] = pt(dec(parsed[2]));
                    }
                    else if (i == 0) {
                        parsed[0] = c ;
                    }
                    else if (!anU(t.charAt(i+1))) {
                        parsed[2]+= c;
                    }
                    else if (!parsed[0] || parsed[0] == '+' || parsed[0] == '-' || parsed[0] == '#') {
                        parsed[0] = c;
                        parsed[1] = dec(pt(t.substring(0,i)));
                        parsed[2] = "";
                    }
                    else {
                        parsed[2]+=c;
                    }
                }
                else if (c == '#') {
                    if (!parsed[0]) {
                        parsed[0] = '#';
                    }
                    else {
                        parsed[2]+=c;
                    }
                }
                else if (c == '/') {
                    let n = i < l - 1 ? t.charAt(i+1) : "";
                    let p = i > 0 ? t.charAt(i-1) : "";
                    if (n == '/') {
                        parsed = ['','/', t.substring(0,i+1)]
                        i++;
                    }
                    else if (!p) {
                        parsed[0] = '/';
                    }
                    else if (parsed[0] == '+' || parsed[0] == '#') {
                        parsed[1] = '/';
                        parsed[2] = dec(pt(t.substring(1,i)));
                    }
                    else {
                        parsed[2]+=c;
                    }
                }
                else if (c == '%') {
                    if (i==0) {
                        parsed[0] = '%' ;
                    }
                    else if (i == l-1) {
                        parsed[1] = '%' ;
                    }
                }
            }
            else {
                parsed[2] += c ;
            }
        }
        return parsed ;
    }
    const f = async text => {             
        let parsed = p(text);
        if (parsed[1] == '?') {                         // C'est pour lire
            
            let question = parsed[2];
            let v = await get(question);
            //console.log("à répondre pour "+question)
            if (v) {
                return v ;
            }
            if (question.indexOf("https") !=0) {            // C'est local
                if (question.charAt(0) == '/')
                    question=question.substring(1);
                //console.log(question);
                let q = p(question);
                //console.log(p(q[2]));
                if (q[0] == '.') {
                    let f2 = p(q[2]);
                    if (f2[0] == '@') {                     //
                        let format = f2[2];
                        let c = q[1];
                        if (format == '+html.') {
                            let pour_carte = await oD({
                                poster:'/#image/+.(/+.@+.+.#+/).@+www.',
                                cause:`/#+/+.+:+.${c}`,
                                jetons:`/(/#jeton//+.@(${c}).+.+.).(#//+.)`,
                                video:`(/#video/+.@(${c}).+.+.).@+www.`,
                                points:`/#.//+.@(${c}).+.+.`,
                                suite:`/#carte/+.(${c}):+.+.`
                            });
                            let cause = pour_carte.cause ;
                            let jetons = pour_carte.jetons ? p(pour_carte.jetons)[2] : null ;
                            return {
                                media:media({
                                    auteur:pour_carte.poster,
                                    url:pour_carte.video
                                }),
                                description: '<h1>'+await f(`(${cause}).@+francais.?`)+'</h1>',
                                actions: [{
                                    objet:c,
                                    inputs:[{
                                        id: '(/#jeton///+.@(${c}).+.+.).(#//+.)',
                                        type: cause == '/(@/+:(@#+/:):+.#+/):+.+.' || cause =='/(@#+/:(@/+:):+.#+/):+.+.' ? 'number' : 'text',
                                        texte: cause == '/(@/+:(@#+/:):+.#+/):+.+.' ? "Le minimum que je veux" : '/(@#+/:(@/+:):+.#+/):+.+.' ? "Le maximum que je peux" : "",
                                        valeur: jetons || ''
                                    }],
                                    buttons: cause == '/(@/+:(@#+/:):+.#+/):+.+.' || cause =='/(@#+/:(@/+:):+.#+/):+.+.' 
                                        ? jetons ? [{methode:'lancer',texte:'Lancer la partie', couleur:'green',url:'//+:+:+.+.'}] : [] 
                                        : []
                                }]
                            }
                        }
                        if (format == '+www.') {            // URL à trouver
                            let c2 = await f(c+'?');
                            let j = c2.indexOf('https');
                            return c2.substring(j,c2.length-2);
                        }
                        if (format == '+francais.') {
                            if (c == '/(@/+:(@#+/:):+.#+/):+.+.') {
                                return 'A vendre'
                            }
                            if (c == '/(@#+/:(@/+:):+.#+/):+.+.') {
                                return 'En recherche'
                            }
                        }
                    }
                }
                if (q[0] == '+' && q[1] == '.') {            // C'est un désignation
                    let versions = await list('/'+question); // Y a-t-il une version donnée
                    if (versions.length != 0 ) {
                        return versions[versions.length-1] // On retourne la plus récente
                    }
                    let points = p(q[2]);                // Sinon, il faut creuser
                    if (points[0] == '.') {              // Par un produit de facteurs
                        if (p(points[1])[0] == '#') {    // En partant d'un point commun
                            let options = await list('/'+points[1]);
                            if (options.length != 0) {
                                if (!points[2]) {        // Sans autre point, on renvoie la plus fraiche
                                    return options[options.length-1];
                                }
                            }
                        }
                    }
                }
            }
        }
        else if (parsed[1] == '.') {                    // C'est pour écrire un point
            let point = parsed[2];
            if (point[0] == '+') {
                let kvs = [];                           // A écrire en mémoire
                let sujet = point[1];
                let objet = point[2];
                let en_sujet = p(sujet);
                let en_objet = p(objet);
                let de_sujet = '/'+sujet + '+.+.';
                let de_objet = '(/'+en_sujet[0]+'+'+en_sujet[1]+'+.'+objet+')';
                let nouveau_objet = '('+objet+')';
                if (en_sujet[0] == '@') {              // Au présent ou au futur
                    let anciens_objets = await f(de_sujet+'?');
                    if (anciens_objets != '?' && anciens_objets != nouveau_objet) { 
                        nouveau_objet = nouveau_objet+'&'+anciens_objets;
                    }
                    kvs.push([de_sujet+"."+now(),nouveau_objet]);
                }
                else if (en_sujet[0] == ':') {           // Au passé
                    kvs.push([de_sujet+'.'+now(),nouveau_objet]); // on peut scanner la mémoire par prefixe pour collecter
                }
                let subordonnant = p(en_sujet[2]);
                if (subordonnant[0] == '+') {           // C'est propre
                    let a_moi = pt(en_sujet[2]);
                    let de_moi = await f(a_moi+'?');
                    if (de_moi !='?') {
                        de_objet = de_objet+'.'+de_moi ;
                    }
                    kvs.push([a_moi+"."+now(),de_objet]);
                }
                await Promise.all(kvs.map(async kv => set(kv[0],kv[1])));
            }
        }
        return '?';
    }
    let response = {                                                // Par défaut
        status:200,
        headers: {
            'Content-Type':'text/html'
        }
    };
    if (chemin) {                                                   // Trouvé un chemin
        if (chemin == 'u') {                                        // C'est pour le code lui-même
            if (message == '/tests?') {
                let test_data = await get('/#test//+.') ;
                let tests = JSON.parse(test_data).tests ;
                let cartes = Object.entries(tests).map(([cas,test]) => {
                    let v = p(test.expression);
                    let t = test.value;
                    let success = false;
                    if (typeof v[2] != 'string') {
                        success = t[1] == v[1] && t[0] == v[0] && t[2][1] == v[2][1] && t[2][2] == v[2][2]
                        console.log("I have "+success);
                    }
                    else {
                        success = t[0] == v[0] && t[1] == v[1] && t[2] == v[2]
                    }
                    return { 
                        description : `<h1>${cas}</h1>
                                    <p>Venu du naturel : ${test.expression}</p>
                                    <p>Resultat attendu : ${t}</p>
                                    <p>Resultat obtenu- : ${v}</p>
                                    <p>${ success ? 'OK' : 'KO'}</p>`
                        }
                }).map(carte);
                response.body = page({cartes:cartes})
            }
        }
        else {
            let m = p(message);
            console.log(m);
            let de_la_cle = cle ? await get(`/+${cle}.`) : null ;
            if (!de_la_cle && m[1] == '?') {                        // Pas de lecture sans clé
                let msisdn = chemin.substring(1); // Le MSISDN comme identité
                response.body = page({
                    cartes:[carte({
                                    description:"<h1>Veuillez saisir votre mot de passe pour acc&eacuteder &agrave; votre U sur votre chemin</h1>",
                                    actions: [
                                        {
                                            name: "login",
                                            inputs:[
                                                {
                                                    type:'tel',
                                                    name:'msisdn',
                                                    autocomplete:'tel',
                                                    valeur:msisdn
                                                },
                                                {
                                                    type:'password',
                                                    name:'secret',
                                                    autocomplete:'password',   // Le mot de passe automatique protégé par biométrie comme sécurité
                                                    texte:'mot de passe'
                                                }
                                            ],
                                            buttons: [
                                                {
                                                    couleur:'green',
                                                    texte:"S'authentifier",
                                                    target:"body",
                                                    methode:"login",
                                                    url:""
                                                }
                                            ]
                                        }
                                    ]
                                }
                    )
                    ]
                });
            }
            else if (de_la_cle == "/(/+)#secret/+.") {              // Propriétaire de retour
                const cle = await HOST.hashed(HOST.makeKey()); // Une nouvelle clé d'accès
                await set(`/+${cle}.`, '/(/+)#cle/.');         // A mémoriser
                response.status = "301",                       // Une redirection
                response.headers = {
                    "Cache-Control":'no-cache',                // A ne pas enregistrer
                    "Location":`./`,                           // Vers le chemin du domicile
                    "Set-Cookie":`cle=${cle};Secure;SameSite=Strict;Max-Age=8000;Path=/;`
                }
            }
            else if (de_la_cle == '/(/+)#cle/.') {                  // Le propriétaire à l'ouvrage
                let format = '(@+html.)';
                if (m[1] == '?' && message =='?') {
                    let c = await f('/#carte/+.?');        // La carte la plus récente dans la pile
                    // Le mécanisme Umanitus est d'afficher la carte dont l'espérance de valeur pour moi est la plus grande
                    // Cette valeur pour moi, prend en compte l'intérêt des autres
                    // Je peux voir des cartes de 'clients' donnant leur plafond, corrigé de mon coût à les traiter (travail)
                    // Je peux voir des cartes de 'serveurs' donnant leur plancher, corrigé de mon gain à les traiter (publicité)
                    // Je peux aussi laisser mon U les traiter pour moi, notamment si ces cartes sont à relayer (taste)
                    
                    response.body = page({
                        owner : await oD({
                            image:'/#image/+.(/+.@+.+.#+/).@+www.',
                            jetons:'//+#jeton//+.#//+.',
                            niveau:'/#niveau/+.(@+.+./+.)'
                        }),                   
                        cartes:[carte(await f(`(${c}).@+html.?`))]
                    });
                }
                else if (m[1] == '.') {                             // Le proprio dit quelque chose
                    if (m[2][0] == '+') {
                        let sujet = m[2][1];
                        let objet = m[2][2];
                        if (sujet == '/(@/+:(@#+/:):+.#+/):+.+.') {    // Le proprio veut faire quelque chose pour quelqu'un 
                            let c = `/#carte/+.(@+${new Date().toISOString()}.+.(@/+:+:+.+.))`; // Identifié par la naissance
                            //await f(`@(${c}).+.(${objet})`);
                            //J'ecris a la main depuis un schéma des informations immuables
                            await set(`/#+/+.+:+.${c}`, sujet);
                            await set(`/#video/+.@(${c}).+.+.`, objet);
                            // ``;
                            //await set(c+'.'+now(), `(/@+.+.${objet}).(${sujet})`);
                            response.body =  await f(`(${c}).@+html.?`);
                        }
                        else if (sujet == '/@/+:inviter:+.+.') {    // Le proprio invite un non umain
                            let invitation = await HOST.hashed(HOST.makeKey());
                            let k = '@'+pt(objet)+'/+'+invitation+'.';
                            await HOST.set(k,'/(#+/:inviter:+./+.):+.+.'); // La seule fois où on n'écrit à la racine
                            response.body = button({
                                texte:`<a href="sms:${objet}&body=${encodeURIComponent('https://umanitus.com/?cle='+invitation)}>Inviter par SMS</a>`,
                                couleur:'blue',
                            });
                        }
                    }
                }
            }
        }
    }
    else {                                                          // Perdu sans cheminon
        response.body = page(JSON.parse(await get("#manifeste/+.")));
    }
    return response;
}

/**
 * Respond to the request
 * @param {Request} request
 */
