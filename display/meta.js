module.exports = (domain,produit) => `
    <!-- Open Graph meta pour Facebook -->
    <meta property="og:title" content="Jouez à Umanitus ${produit && produit.but ? '- '+produit.but :''}" />
    <meta property="og:url" content="${ produit && produit.id ? 'https://'+domain+'/'+produit.id:''}" />
    <meta property="og:image" content="${produit && produit.image ? produit.image : ''}" />
    <meta property="og:description" content="${produit && produit.description ? produit.description : ''}" />
    <meta property="og:site_name" content="${domain}" />
    <meta property="og:type" content="article" />
`