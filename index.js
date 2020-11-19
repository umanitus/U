addEventListener('fetch', event => {                    // Un Service sans Serveurs à opérer
  event.respondWith(HOST.handleRequest(event.request))   
})

// Hôte
const HOST = {
    name:"CLOUDFLARE_WORKERS",                             // Au-delà des VMs de x86 et des conteneurs de Linux, les Isolates de V8 : plus léger et réactif
    handleRequest: async (request) => {
        let {status, headers, body} = await U(HOST,request); // HTTP comme réponse
            return new Response(body, {
                status,
                headers
        })
    },
    fromHTTP: async req => {
        let response = {};
        let link = new URL(req.url);
        let parts = link.pathname.split("/");
      
        response.chemin = parts[1];                         // Un chemin pour chaque umain
      
        let cle = link.searchParams.get("cle");             // Une clé pour la lecture par un U
      
        if (!cle) {
            let cookie_string = req.headers.get("cookie");   // Une clé pour l'action quotidienne par un propriétaire
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
        if (req.method == 'GET') {                         // Un GET est une question
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
                    if (s[0] == "secret") {
                        response.cle = await HOST.hashed(new TextEncoder().encode(SALT+s[1])); // Une clé pour ouvrir le domicile
                    }
                }
                objet = params[0] ? decodeURIComponent(params[0].split("=")[1]) : '';  // Une URL comme objet
            }
            else {                                                                // Un Blob à traiter
                let content = contentType.split("/");
                let myBlob = await req.arrayBuffer();
                let hash = await HOST.hashed(myBlob);                                       // Un hash comme identité
                let url = await HOST.save(hash,myBlob,contentType);                         // Une URL comme sauvegarde
                objet = `/#${content}/+.(+.(@+sha256.)+.+${hash}.).(+.(@+www.)+.(${url}))` // Un objet comme le 'contenu représenté en SHA256 et dont l'URL est URL
            }
            if (req.method == "POST") {                    // Un POST est un ajout
                response.message = `(${sujet})+.(${objet})`   
            }
            else if (req.method == "PUT") {
                response.message = `(#(${objet})/+.)+.(${objet})` // Un PUT est une définition
            }
            else if (req.method == "DELETE") {
                response.message = `(${sujet})-.(${objet})` // Un DELETE est un retrait
            }
        }
        return response;
    },
    save: async (id, blob, type) => {                     // Sur AWS S3
        const encoder = new TextEncoder('utf-8');
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
    get: async key => {
        return await MY_KV.get(key);
    },
    set: async (key,value) => {
        return await MY_KV.put(key,value);
    },
    list: async key => {
        return await MY_KV.list(key);
    },
    hashed: async (bytes) => {
        const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },
    makeKey: () => crypto.getRandomValues(new Uint8Array(40))
}
// U
const U = async (host, request) => {
    let {chemin, cle, message} = await host.fromHTTP(request);
   
    // Mémoire
    const get = async key => {              // Aller chercher une valeur brute en mémoire
        return await host.get(chemin+key);  
    }
    const set = async (key,value) => {      // Mémoriser une valeur brute
      await host.set(chemin+key,value);
    }
    const list = async key => {             // Aller chercher toutes les versions
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
                margin:2%;
                box-shadow:  2px 1px 2px 1px #A9A9A9;
                display:flex;
                border-radius: 15px;
                flex-direction: column;
                border:1px solid #e2e8f0;
            }
            .card .media img, .card .media video {
                width:100%;
                border-top-left-radius:15px;
                border-top-right-radius:15px;
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
                border:none;
                padding:2%;
                margin-top:2%;
            }
            .actions button {
                color:white;
            }
            .actions input {
                color:black;
            }
        </style>` 
    const upload = `
        onload = () => {
            //alert("hello world");
            document.addEventListener('change', async e => {
                if (e.target.className == 'media') {
                    let file = e.target.files[0];
                    let upload = await fetch('./'+encodeURIComponent('(/+):+.+.'), {
                        method: 'POST',
                        body: file,
                        headers: new Headers({
                            "Content-Type": file.type
                        })
                    });
                    let carte = await upload.text();
                    //alert(carte);
                    e.target.parentNode.parentNode.parentNode.remove();
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
            ${ methode && (methode != 'login') ? `hx-post="${url}" hx-swap="outerHTML" hx-target=${target ? `"${target}"`: "closest .card"} ` : ''}
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
            ${ type != 'password' ? `hx-post="./${id}" hx-swap="outerHTML" hx-target='closest .card'` : ''}
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
                           <label for="video">
                              <img src="https://s3.eu-west-3.amazonaws.com/umanitus.com/taster.png"/>
                           </label>
                           <input class="media" style="display:none" id="video" accept="video/*" capture type="file" />
                        </div>
                        <div style="margin-top:10px;">
                           <label for="audio">
                              <img style='height:70%' src='data:image/png;base64,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'/>
                           </label>
                           <input class="media" style="display:none" id="audio" type="file" accept='audio/*' capture />
                        </div>
                     </div>` :''}
                </nav>
                <div id="cards">
                    ${ cartes.map(carte).join('')}
                </div>
            </body>
        </html>`
    
    

     

    
    // Raccourcis
    const anU = c => c!="" && (c=="(" || c==")" || c=="+" || c=="-" || c=="#" || c=="/" || c=="." || c=="@" || c==":" || c=="_" || c=="&" || c=="?" || c=="%")
    const aD = c => c!="" && (c=="0" || c=="1" || c=="2" || c=="3" || c=="4" || c=="5" || c=="6" || c=="7" || c=="8" || c=="9")
    const aM = c => c!="" && (c=="A" || c=="B" || c=="C" || c=="D" || c=="E" || c=="F" || c=="G" || c=="H" || c=="I" || c=="J" || c=="K" || c=="L" || c=="M" || c=="N" || c=="O" || c=="P" || c=="Q" || c=="R" || c=="S" || c=="T" || c=="U" || c=="V" || c=="W" || c=="X" || c=="Y" || c=="Z")
    const dec = text => text.charAt(text.length-1)==")" ? text.substring(text.charAt(0)=="("?1:0,text.slice(-1)==")"?text.length-1:text.length) : text
    const pt = text => anU(text.charAt(text.length-1)) ? text : (text+".");
    
    const p = t => {                                    // Parser depuis toute langue naturelle
        let parsed = [];
        if (!t)
            return parsed ;
        let l = t.length ;
        if (t.slice(-1) == '?') {    // Question
            parsed = ['','?',t.substring(0,l-1)];
            return parsed;
        }
        let parens = 0 ;
        let filler = 2 ;
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
                if (c == "+" || c == '-') {
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
                        else if (p!=')' && p != '@') {
                            parsed = ['','.', [c, dec(t.substring(0,i)) , dec(t.substring(i+2))]];
                            break;
                        }
                    }
                    else {
                        if (!parsed[0] )
                            parsed[0] = c;
                        else
                            parsed[filler]+=c;
                    }
                }
                else if (c == '@') {
                    if (parsed[0] != '.')
                        parsed[0] = '@';
                    else
                        parsed[filler]+=c;
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
                    else if (!anU(t.charAt(i+1))) {
                        parsed[filler]+= c;
                    }
                    else if (!parsed[0] || parsed[0] == '+' || parsed[0] == '-' || parsed[0] == '#') {
                        parsed[0] = c;
                        parsed[1] = pt(t.substring(0,i));
                        parsed[2] = "";
                    }
                    else {
                        parsed[filler]+=c;
                    }
                }
                else if (c == '#') {
                    if (!parsed[0]) {
                        parsed[0] = '#';
                    }
                    else {
                        parsed[filler]+=c;
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
                    else if (parsed[0] == '+' && parsed[0] == '#') {
                        parsed[1] = '/';
                    }
                    else {
                        parsed[filler]+=c;
                    }
                }
            }
            else {
                parsed[filler] += c ;
            }
        }
        return parsed ;
    }
    const f = async text => {                
        let parsed = p(text);
        if (parsed[1] == '?') {
            let question = parsed[2];
            let v = await get(question);
            if (v) {
                return v ;
            }
            if (question.indexOf("https") !=0) {
                if (question.indexOf("/") == 0) {
                    question = question.substring(1);
                }
            let objet = p(question);
            if (objet[0] == '.') {
               let last = p(objet[objet.length-1]);
               let format = last[0] == '@.' ? last[1] : null ;
               if (format == "+html") {
                  //let sujet = await f(objet[1]+'?')
                  if (objet[1].indexOf("/#carte/") == 0) {
                     let c = "("+objet[1]+")";
                     let keys = [
                        `/#(+.)/+.(@+:+.#(@+.+.${c})/)`,
                        `/#video/+.(@+.+.${c})`,
                        `/#texte/+.(@+.+.${c})`,
                        `/#tag//+.(@+.+.${c})`
                     ]
                     let values = await Promise.all(keys.map(async k => get(k)));
                     //console.log(values);
                     return carte({description:"Ceci est une carte"})
                  }
               }
            }
         }
      }
      return '?'
    }
    let response = {                                    // Par défaut
        status:200,
        headers: {
            'Content-Type':'text/html'
        }
    } ;
    if (chemin) {                                       // Trouvé son chemin
        if (chemin == 'u') {                            // C'est pour le code lui-même
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
                });
                response.body = page({cartes:cartes})
            }
        }
        else {
            let m = p(message);
            let de_la_cle = cle ? await get(`/+${cle}.`) : null ;
            if (!de_la_cle && m[1] == '?') {           // Pas de lecture sans clé
                let msisdn = await get('/(/+)#msisdn/+.'); // Le MSISDN comme identité
                response.body = page({
                    cartes:[
                        {
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
                    ]
                });
            }
            else if (de_la_cle == "/(/+)#secret/+.") { // Propriétaire de retour
                const cle = await HOST.hashed(HOST.makeKey()); // Une nouvelle clé d'accès
                await set(`/+${cle}.`, '/(/+)#cle/.');         // A mémoriser
                response.status = "301",                       // Une redirection
                response.headers = {
                    "Cache-Control":'no-cache',                // A ne pas enregistrer
                    "Location":`./`,                           // Vers le chemin du domicile
                    "Set-Cookie":`cle=${cle};Secure;SameSite=Strict;Max-Age=8000;Path=/;`
                }
            }
            else if (de_la_cle == '/(/+)#cle/.') {     // Le propriétaire à l'ouvrage
                let format = '(@+html.)';
                if (m[1] == '?' && message =='?') {            // Le chemin du domicile 
                    let keys = [
                        '/#image/+.((/+).@+.+.#+/).(@+www.)',   //L'image sur le Web me représentant 
                        '/((/+)#jeton//+.).(#//+.)',            //Le nombre de mes jetons
                        '/#niveau/+.(@+.+.(/+).)'               //Le niveau auquel je suis
                    ]
                    console.log("Je viens chercher mes valeurs")
                    let values = await Promise.all(keys.map(k => f(k+'?'))); // Un détail pour les valeurs en même temps
                    //let carte = await f('/#carte/+.(@bien.+.+_-.).(@(/+):+.+.).(@+html.)?';  // La carte qui est la meilleure pour moi
                    // Le mécanisme Umanitus est d'afficher la carte dont l'espérance de valeur pour moi est la plus grande
                    // Cette valeur pour moi, prend en compte l'intérêt des autres
                    // Je peux voir des cartes de 'clients' donnant leur plafond, corrigé de mon coût à les traiter (travail)
                    // Je peux voir des cartes de 'serveurs' donnant leur plancher, corrigé de mon gain à les traiter (publicité)
                    // Je peux aussi laisser mon U les traiter pour moi, notamment si ces cartes sont à relayer (taste)
                    response.body = page({
                        owner: {
                            image:values[0], 
                            jetons:values[1],
                            niveau:values[2]
                        },
                        cartes:[]
                    });
                }
            }
        }
    }
    else {                                              // Perdu sans cheminon
        let manifeste = await get("#manifeste/+.");     // On renvoie le manifeste
        response.body = page(JSON.parse(manifeste));
    }
    return response;
}

/**
 * Respond to the request
 * @param {Request} request
 */
