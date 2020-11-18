# U  
Un instrument pour jouer à Umanitus.  
  
U est à Umanitus ce que Wordpress est au WWW ou Linux à Unix : une implémentation de référence pour participer au mécanisme.  

U est construit sur les unités suivantes :  
* Le serverless comme unité d'opération : tout U doit être hébergé en serveur less, aussi bien pour agir comme une fonction que pour se souvenir des informations par des clés ou des medias par du Cloud. Ce modèle permet de couter strictement à l'usage, afin d'éliminer les coûts fixes d'opérations.  
* Le propriétaire comme unité d'action : tout U est à 1 seul humain et ne communique directement qu'avec 1 seul humain et avec les Us des autres humains.  
* La carte comme unité d'interaction : tout U affichage, stocke, traite, envoie et reçoit des cartes plutôt que des pages ou des messages pour organiser l'interaction    
* Le HTTP comme unité de sens : tout U comprend un GET comme une question, un POST comme un ajout, un PUT comme un remplacement et un DELETE comme une suppression  
* Le HTML comme unité de lecture : tout U répond du HTML soit à son humain, soit aux Us. Le HTML est enrichi à la marge de style en CSS et d'interactions en Javascript  
* L'URL comme unité d'écriture : tout U ne reçoit que des URLs relatives à son humains ou aux autres Us, sur leur domaine.  
* Le certificat HTTPS comme authenticité : tout U et ses ressources sont hebergés sur un domaine certifié.  
* Le SHA256 comme unité de contrôle : tout U qui veut faire lire quelque chose ajoute aux autres Us un lien vers sa ressource sur son domaine, suffixée en querystring d'une clé de hash. Le U qui GET cette URL peut contrôler que le message situé sur le domaine certifié n'a pas été modifié. Les médias binaires sont elles-mêmes nommées par leur valeur en SHA256, rendant sûr une ressource.  
* Le Temps comme unité de version : toute écriture sur une ressource crée une nouvelle version, ordonnée par l'auteur et le temps UTC en ISO-8601    
* Les Uperateurs comme unité de grammaire : toute ressource est descriptible depuis les langages naturelles en conservant les radicaux mais en encodant la grammaire commune dans un système unique. Les Upérateurs fournissent l'encodage le plus concis sans perte de sens depuis tout language naturel.  
* L'or comme unité d'échange : tout échange de valeurs à Umanitus se fait en jetons, représentant chacun une quantité d'or fixe. Ces jetons sont ajoutés ou retirés par tout U en représentation des ressources financières mis en jeu par son humain.  




## Fait  
- [x] Etre hébergé sur le Web
- [x] Scaler sans gérer les opérations (mode server less)
- [x] Que chaque personne ait son domaine
- [x] Afficher une image sur laquelle se trouve la personne à qui est le domaine
- [x] Afficher le score de la personne à qui est le domaine
- [x] Afficher un bouton pour créer une carte
- [x] Afficher une nouvelle carte à éditer

## Faisant  
- [x] Choisir d'où vient le média

## A faire  
- [ ] Afficher le média dans la carte
- [ ] Faire éditer le titre de la carte
- [ ] Faire ajouter des tags à la carte
- [ ] Pour un produit à vendre, faire éditer le plancher
- [ ] Pour un produit à acheter, faire éditer le plafond
- [ ] Afficher les points dans la monnaie du pays dans lequel est l'Umain
- [ ] Faire servir la carte aux connaissances de l'Umain
