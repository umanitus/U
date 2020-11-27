# U  
Un instrument pour jouer le mieux possible à Umanitus.  
  
U est à Umanitus ce que Wordpress est au WWW ou Linux à Unix : une implémentation de référence pour participer au mécanisme.  

## Points fixes  

U est construit sur les unités suivantes :  
* Le _serverless_ comme unité d'**opération** : tout U doit être hébergé en serveur less, aussi bien pour agir comme une fonction que pour se souvenir des informations par des clés ou des medias par du Cloud. Ce modèle permet de couter strictement à l'usage, afin d'éliminer les coûts fixes d'opérations.  
* Le _propriétaire_ comme unité d'**action** : tout U est à 1 seul humain et ne communique directement qu'avec 1 seul humain et avec les Us des autres humains. 
* Le _proxy_ comme unité d'**architecture** : tout U est à la fois client et serveur, donc proxy.  
* Le _MSISDN_ comme unité de **chemin** vers son **domicile** : tout propriétaire est identifié par son numéro de mobile, qui est unique, universellement connu, maintenu par des sociétés installées, portable entre sociétés de maintenanc et suffisamment précieux pour signifier naturellement la familiarité  
* La _carte_ comme unité de **style** : tout U affichage, stocke, traite, envoie et reçoit des cartes plutôt que des pages ou des messages pour organiser l'interaction    
* Le _HTTP_ comme unité de **sens** : tout U comprend un GET comme une question, un POST comme un ajout, un PUT comme un remplacement et un DELETE comme une suppression  
* Le _certificat TLS_ comme **authenticité** : tout U et ses ressources sont hebergés sur un domaine certifié.  
* Le _HTML_ comme unité de **lecture** : tout U répond du HTML soit à son humain, soit aux Us. Le HTML est enrichi à la marge de style en CSS et d'interactions en Javascript  
* L'_URL_ comme unité d'**écriture** : tout U ne reçoit que des URLs relatives à son humains ou aux autres Us, sur leur domaine.  
* La _clé_ comme unité de **mémoire** : tout U lit et écrit de manière immuable dans sa mémoire par des clés.  
* Le _hash_ comme unité de **contrôle** : tout U qui veut faire lire quelque chose ajoute aux autres Us un lien vers sa ressource sur son domaine, suffixée en querystring d'une clé de hash. Le U qui lit cette URL peut contrôler que le message situé sur le domaine certifié n'a pas été modifié. Les médias binaires sont eux-mêmes nommées par leur valeur en SHA256, rendant sûr une ressource.  
* Le _temps_ comme unité de **version** : toute écriture sur une ressource crée une nouvelle version, ordonnée par l'auteur et le temps UTC en ISO-8601    
* Les _Uperateurs_ comme unité de **grammaire** : toute ressource est descriptible depuis les langages naturels en conservant les radicaux mais en encodant la grammaire commune dans un système unique. Les Upérateurs fournissent l'encodage le plus concis sans perte de sens depuis tout language naturel.  
* L'_or_ comme unité d'**échange** : tout échange de valeur à Umanitus se fait en jetons, représentant chacun une quantité d'or fixe. Ces jetons sont ajoutés ou retirés par tout U en représentation des ressources financières mis en jeu par son humain.   


## Fait  
- [x] Etre hébergé sur le Web en serverless sur Cloudflare  
- [x] Scaler sans gérer les opérations (mode server less)  
- [x] Que tout humain puisse avoir son msisdn comme chemin  
- [x] Que tout humain puisse s'authentifier à son U avec un secret dans un son portefeuille biométrique de secrets   
- [x] Que tout humain puisse voir son image, son nombre de jetons et son niveau à la tête de son domicile    
- [x] Que tout humain puisse créer une carte par une vidéo de son smartphone  
- [x] Que toute vidéo créant toute carte puisse être sauvegardée  
- [x] Que tout humain puisse voir la carte créée avec la vidéo  

## Faisant  
- [ ] Que tout humain puisse éditer les points clés de sa carte  
- [ ] Que tout humain puisse éditer le prix minimum de sa carte produit  
- [ ] Que tout humain puisse éditer le prix maximum de sa carte recherche  

## A faire  
- [ ] Que tout humain puisse indiquer qu'il a fini sa carte  
- [ ] Que tout humain puisse éditer les personnes à qui envoyer la carte  
- [ ] Que tout humain puisse inviter des personnes qui n'ont pas encore de domicile chez Umanitus  
- [ ] Que tout humain puisse voir si toutes les personnes ont répondu de la carte  
- [ ] Que tout humain puisse voir quel est le prix à payer ou à recevoir pour le produit de la carte  
- [ ] Que tout humain puisse donner son accord pour ce prix  
- [ ] Que tout humain puisse voir la mise à jour de son nombre de jetons et de son niveau suite à l'accord  
