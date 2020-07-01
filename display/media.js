module.exports = produit => `
    <form>
    <!--
        <video controls src='https://s3.eu-west-3.amazonaws.com/umanitus.com/%40%2Bjboyreau._%23octet__%2B.(%2B.%40%2Bsha256..%40%2Bbase64.%2B._726d9455a629af55b3419fc626c90a46644134698de708aa7d14aa49e4edd3d1.).mov'>
        </video>
    -->
    
    <label id="label_image" for="media">
            <img id='image' for="media" src="${produit ? produit.image : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAb1BMVEX///8AAAA+Pj7i4uLd3d1ISEhWVlb19fXIyMhra2vv7+/6+vrLy8sqKionJyfq6upbW1uXl5fR0dGnp6dwcHB8fHxQUFCIiIi0tLQgICAJCQmQkJBiYmIZGRm6urqUlJQ4ODijo6MVFRUxMTGCgoJHxlCNAAADT0lEQVR4nO3d4XaaQBBAYRQUlSiKiUk1SZuk7/+MPWhbJeywCCndGe/9a/f0fMmeWoUdooiIiIiIiIiIiIiIiIiIiEhP8XIcfqs+wmSkIYQIww8hwvBDiDD8ECIMv68TjvM4kDoJN7tppUlcE076/LC+tA7CdF373SeRJeGdY3ebEn53AC0JFzsX0JBw5vQZEj4KQCvCfCIBjQhfRZ8NYfbQALQgjH80AQ0Inxp9BoT3HqB2YfLNB/QK0/X8sgFc5/zCrdfXQtjiB/mv8v3V2bwFULMw2btJm+q7v17hm9u3n0U2hOmzG7hbRDaExbsbeChftCDcuH374viqfuFi6gauF6fX1Qtnwg7d/PkD2oXCR9334u863cJ87AY+p+d1qoWvwrv89nKdZqHwUfelqKzTK8yFj7rzrLruOmE2qzQcL6oJpY+628/rrhP+z6oQ4d/Qj6S2TqvQ3X1WX2dK+ORaZ0g4ru/QMjvCB8cOLTMjfJXWGREer167syF8bFhnQiju0DIDwsmicZ1+4cGzTr3Q+59j5cJd8w4t0y307dAyzcKXuzbrFAunqX9RpFm48S85plW4LPwrTmkVCh8kHGkVtl+HEOFwIZRCiHC4EEohRDhcCKUQIhwuhFIIEQ4XQimECIcLoRRChMOFUAohwuGqCu1fP1yZvwZs/zr+6AbuxbiB+2lG9u+JGt3AfW0jU/cmJsJJvKY7oMv0CMWzambuEY7k0TpG7vMui4XxSDbu1T8lnFkzcd7id1fvVHXCKHePmjNw7uncwU1Uf3btImmgnvLzh5elwk7VfYa0mrBTl5rPAX9q1mbaQJlaobhT+53HDythLk2vmQqBVQjz2XrMxQgtxyjkY91nm4TXm5u47zqfJsCKpdvYccZQiEmz9rrNiQozaV5il1lfgRav3MQO89pCLRPmlu5yK0Jx9uzVcxMDLhbe/a+cfRl0jTOgTQi9U5L1C6P4w7qwxU5VL2ycOG9D2PTUACPCKPppXih+2WhHKH4tbkcoftloSOh8EpItoTRA2ZBQ+LLRlFDdM7s61Oq5a+E8O6+S+1JhvRbPzgu1Pr9ahGGEEGH4IUQYfggRhh/CpuLlOPxWfYRERERERERERERERERERERa+gVTL0cqJsc+sQAAAABJRU5ErkJggg=='}"/>
    </label>
        <input accept="image/*" capture="camera" id="media" style="display:none" id="files-upload" type="file">

    </form>
`