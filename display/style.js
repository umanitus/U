module.exports =  () => `
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
    .tags input {
        background-color:white;
        color:black;
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
        flex-direction:column;
    }
    .valoriser .edition {
        display:flex;
    }
    .valoriser .monnaie {
        font-style: italic;
    }
    .valoriser input {
        flex:1;
        font-size:150%;
        width:40%;
    }
    .valoriser button {
        flex:1;
        font-size:150%;
        width:40%;
        background-color:green;
        margin-left:5%;
    }
    .actions button {
        width:100%;
        font-size: 150%;
        border-radius:30px;
        box-shadow:  2px 1px 2px 1px rgba(0,0,0,0.6);
        color:white;
        border:none;
        padding:3%;
        margin-bottom:3%;
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
    button.miser {
        background-color: cornflowerblue;
    }
    button.procurer {
        margin-top:2%;
        background-color: cadetblue;
    }
  </style>`