module.exports = produit => `
    <label for="media-${produit && produit.id ? produit.id : ''}">
            <img for="media-${produit && produit.id ? produit.id : ''}" src="${produit ? produit.image : ''}"/>
        </label>
    <input accept="image/*,video/*" capture="camera" id="media-123" style="display:none" id="files-upload" type="file" multiple>
`