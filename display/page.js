module.exports = (meta,style,header,cards) => 
`<html>
    <head>
        <title>Umanitus</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Umanitus">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        ${meta || ''}
        <link rel="apple-touch-icon" sizes="180x180" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png" type="image/png">
        <link rel="icon" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png">
        <script src="https://unpkg.com/htmx.org@0.0.4"></script>
        <script>
            onload = () => {
                //alert("hello world");
                document.addEventListener('change', async e => {
                    if (e.target.id == 'media') {
                        let file = e.target.files[0];
                        let upload = await fetch('/'+encodeURIComponent('#image/'), {
                            method: 'POST',
                            body: file,
                            headers: new Headers({
                                "Content-Type": file.type
                            })
                        });
                        let carte = await upload.text();
                        //alert(decodeURIComponent(url));
                        e.target.parentNode.parentNode.parentNode.remove();
                        document.getElementById("cards").innerHTML = carte ;
                        
                    }
                })
            }
        </script>
        ${style}
    </head>
    <body>
        ${header || ''}
        <div id="cards">
            ${cards || ''}
        </div>
    </body>
  </html>`