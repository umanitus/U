module.exports = (head,header,cards) => 
`<html>
    ${head || ''}
    <body>
        ${header || ''}
        <div id="cards">
            ${cards || ''}
        </div>
    </body>
  </html>`