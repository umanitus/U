module.exports = produit => `
    <label for="media">
            <img for="media" src="${produit ? produit.image : ''}"/>
        </label>
    <input accept="image/*,video/*" capture="camera" id="media-123" style="display:none" id="files-upload" type="file" multiple>
`