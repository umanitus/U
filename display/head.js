module.exports = (domain,produit,style) => `
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Umanitus">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <link rel="apple-touch-icon" sizes="180x180" href="https://s3.eu-west-3.amazonaws.com/umanitus.com/apple-icon.png" type="image/png">
    
    <!-- Open Graph meta pour Facebook -->
    <meta property="og:title" content="Jouez à Umanitus - Vente" />
    <meta property="og:url" content="${ produit && produit.id ? 'https://'+domain+'/'+produit.id:''}" />
    <meta property="og:image" content="${produit && produit.image || ''}" />
    <meta property="og:description" content="${produit && produit.description || ''}" />
    <meta property="og:site_name" content="${domain}" />
    <meta property="og:type" content="article" />
    <script src="https://unpkg.com/htmx.org@0.0.4"></script>
    ${style}
  </head>`