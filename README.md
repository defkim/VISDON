# Données météorologiques 2025

## Description du processus d'obtention des données
Dans un premier temps les données furent récupérés par l'intermédiaire de ce site [météo]. Chaque canton est représenté par une station météorologique et se télécharge en un fichier csv. Il y a un fichier par canton. Pourtant, il a été constaté que si les données initiales établissaient une station par chef-lieux, au moment où il a été question d'y ajouter les latitudes et longitudes, le site [météo suisse](https://www.meteosuisse.admin.ch/services-et-publications/applications/valeurs-mesurees.html#param=messwerte-lufttemperatur-10min&station=DAV&table=false) ne trouvait pas les-dites stations. Il a donc fallu prendre de nouvelles stations des cantons en question.

## Présentation des données
Les données finales se présentent sous forme de tableau dans un fichier csv : "canton_meteo.csv". Ce fichier de 9490 lignes est le produit de l'assemblage des 26 fichiers cantonaux. Il contient 16 colonnes :

* canton -- nom du canton
* ville -- nom de la ville
* abb_station -- diminutif de la station
* latitude
* longitude
* date -- année-mois-jour heure
* tavg -- température moyenne
* tmin -- température minimale
* tmax -- température maximale
* prcp -- taux de précipitation en mm
* snow -- taux de neige
* wdir -- direction du vent
* wspd -- vitesse du vent en moyenne en km/h
* wpgt -- pic de rafale de vent en km/h
* pres -- pression atmosphérique en hPa
* tsun -- temps d'ensoleillement en min

Dans les 16, 5 colonnes furent rajoutées après le téléchargement des fichiers : *canton*, *ville*, *abb_station* (qui fait référence à l'abbrévation de la station), *latitude* et *longitude*. Ces ajouts ont un objectif de précision pour pouvoir distinguer les stations entre elles, et avoir une meilleure visualisation. Les cantons sont mentionnés par leur diminutif. La nécessité de mettre l'abbréviation de la station est un moyen de permettre d'être plus informé sur la provenance de ces valeurs, comme il est possible que certaines villes/régions possèdent plusieurs stations météorologiques, ayant différents objectifs. 

En ce qui concerne les données, il arrive que certaines colonnes manquent de données. Bien que nous n'ayons pas d'explications précises à ce sujet, plusieurs hypothèses peuvent être émises : la station mentionnée délèguent ce genre de données à une autre staiton de la même ville/région, ou alors a choisi de négliger ces données pour une raison externe.

La constance des données sélectionnées réside dans la datation. Chaque canton possède 365 lignes, chacune correspondant à un jour de l'année. Et toutes furent enregistrées à la même heure, soit *00:00:00*.

## Étapes de pré-traitement des données
Le pré-traitement des données se résume par l'ajout de colonnes mentionné précédemment, ainsi que le changement effectué pour certaines stations, ne trouvant les coordonnées des stations de chef-lieux.

## Expliquer les visualisations produites
Une spider-chart fut créée, dans le but de visualiser les moyennes de *wspd*, *wpgt*, *pres* et *tsun*, du canton sélectionné au préalable, ainsi que le mois choisi. Lorsque l'utilisateur percoit la chart, il se retrouve avec deux axes, qui indiquent quatre mesures différentes. Les noms inscrits à côté de leurs extrémités correspondantes diffèrent du nom de colonnes originales, pour une meilleure compréhension des données. L'image [image_axes] présente les valeurs de *wspd* sous *Vent*; *wpgt* sous *Rafale de Vent*; *pres* sous *Pression*; *tsun* sous *Ensoleillement*.

Les 4 cercles de la spider-chart représente une échelle représentant, du plus petit au plus grand cercle, 25, 50, 75 et 100%. Si cette échelle s'applique pour les quatres mesures, leurs données très disparatre d'une colonne à une autre impliquèrent l'utilisation d'une échelle pour chaque mesure. Le 100% représente la valeur maximale d'une colonne. Si initialement, le principe était d'utiliser la valeure minimale comme point de départ dans la visualisation, il s'avère que cela créait des problèmes, puisque cela ne prenait pas en compte les cases sans données, cf.[image_problème]. Ainsi la valeur minimale fut établie à 0.

Cela peut expliquer les différences dans le dessin du graphique, où, par exemple, la courbe de la pression atteint plus rapidement la courbe des 75% et 100%, étant donné que ces valeurs minimales et maximales tournent autour de 945 et 1041, contrairement au vent, où les valeurs vont de 0 à 64. Les moyennes de chaque mesure diffèrent donc de manière drastique dans la visualisation. Il arrive aussi que certaines mesures n'aient pas de courbes à certains mois, par le manque total de mesures, comme expliqué auparavant, cf. [image_sanscourbe].

Pour expliciter la visualisation des données, une étiquette *tooltip* visible par un mouseover fut ajoutée (cf.[image_étiquette]), indiquant la moyenne calculée, avec l'unité correspondante à la mesure. C'est pour cette raison que furent ajoutés des points aux extrémités des courbes. L'image, étant un screenshot, n'indique pas la position du curseur, celui était placé sur le point de la courbe mesure le *vent*.

Pour aller plus en profondeur, il aurait été envisageable d'indiquer les mesures minimales et maximales mensuelles de chaque mesure, ou encore d'ajouter le dessin d'un polygone annuel représentant le canton sélectionné. 

![image_axes](spider_image_axe.png)
![image_problème](spider_problèmedonnées.png)
![image_sanscourbe](spider_sanscourbe.png)
![image_étiquette](spider_tooltip.png)


## Utilisation des IA génératives
L'usage des IA génératives est explicitée dans le code. 
Dans le code de la spider-chart, l'usage de l'IA servait à résoudre des problèmes dans l'apparition des résultats, ou dans le but de prélever des informations spécifiques, comme la ligne permettant de relever le mois dans la colonne *date*.

Pour ce qui est de la structure de la spider-chart, ou encore du *tooltip*, des sources internet sont à l'origine de ce code. 

[site_spider_chart](https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart)
[site_tooltip](https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
[site_mouseover](https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2)
