const largeur = 750;
const hauteur = 750;
const marge = 25;

const svg = d3
    .select("body")
    .append("svg")
    .attr("width", largeur)
    .attr("height", hauteur)
    .style("border", "1px solid black");
    
const canton = svg.append("g");
d3.csv("canton_meteo.csv").then(dessiner);

//échelle pour la grille
let radialScale = d3.scaleLinear()
    .domain([0,10])
    .range([0,250]);

//échelle pour chaque variable prcq données trop disparatres les unes des autres, au lieu de mettre les valeurs maximales, que j'ai laissé en commentaire, j'ai essayé de mettre des domaines allant jusqu'à un certains points, en espérant que cela corresponde plus ou moins à une moyenne maximale faisable, afin d'agrandir les polygones qui restaient assez minimes autrement.
let scales = {
    tsun : d3.scaleLinear()
        .domain([0,852])
        .range([0,250]),
    wspd : d3.scaleLinear()
        .domain([0,64])
        .range([0,250]),
    wpgt : d3.scaleLinear()
        .domain([0,149])
        .range([0,250]),
    pres : d3.scaleLinear()
        .domain([0,1041])
        .range([0,250])
};

//comme on place les points en pourcent, il faut marquer en mode 2.5, c'est pour les rayons du cercle et que cela corresponde à la norme du domain qui va jusuq'à 10. Si on met en mode 0.25, cercle bien plus petit.
let ticks = [2.5, 5, 7.5, 10];

svg.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", largeur / 2)
            .attr("cy", hauteur / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d))
    );

//ensuite, il faut mettre les axes, ou on peut aussi noter les cercles pour mettre les données genre pourcent mais à voir à la fin si c'est utile ou pas.
// On définit une variable contenant les noms des axes, qu'on reprendra ensuite
const noms = {
    tsun : "Ensoleillement",
    wspd : "Vent",
    wpgt : "Rafale de Vent",
    pres : "Pression"
};

//faire pareil mais avec des unités de mesure
const unites = {
    tsun : "min",
    wspd : "km/h",
    wpgt : "km/h",
    pres : "hPa"
};

//mtn on doit représenter les angles comme axes de coordinations
function angleToCoord(angle, r){
    let x = Math.cos(angle) * r;
    let y = Math.sin(angle) * r;
    return {
        "x" : largeur / 2 + x,
        "y" : hauteur / 2 - y
    };
}

const attributes = Object.keys(noms);
//La formule Math.PI/2 permet de décaler l'angle initial de 90°, le faisant commencer en haut au lieu de à droite. Le reste de la formule lui indique de se diviser à parts égales.
let recupAngles = attributes.map((variable, i) => {
    let angle = (Math.PI / 2) + (2* Math.PI * i / attributes.length);
    return {
        "noms" : variable,
        "angle" : angle,
        "ligne" : angleToCoord(angle, 250),
        "label" : angleToCoord(angle, 290) //ainsi le texte est claire et disposé plus loin de l'axe pour éviter que les deux ne s'entremêlent

    };
});

//dessiner les axes
svg.selectAll("line")
    .data(recupAngles)
    .join(
        enter => enter.append("line")
            .attr("x1", largeur / 2)
            .attr("y1", hauteur / 2)
            .attr("x2", d => d.ligne.x)
            .attr("y2", d => d.ligne.y)
            .attr("stroke", "black")
    );

// mettre le nom des axes
svg.selectAll(".axislabel")
    .data(recupAngles)
    .join(
        enter => enter.append("text")
            .attr("x", d => d.label.x)
            .attr("y", d => d.label.y)
            .text (d => noms[d.noms]) //obligé de mettre noms[d.noms] prcq sinon met les noms initiaux tsun, etc.
    );

// on doit faire une fonction qui va permettre de faire une moyenne des données, pour avoir un polygone qui représente le mois sélectionné du canton choisi. Sinon, on pourrait faire jour par jour mais en sachant que certains résultats sont null ou équivalent à 0, c'est moins intéressant.
function calamoyenne (données, canton, mois){
    let selection = données.filter (d =>
        d.canton == canton &&
        new Date(d.date).getMonth()+1 == +mois //ligne avec formule new Date générée par IA prcq d'autres formules trouvées sur internet ne marchaient pas
    ); //ajouter plus un, sinon janvier est compté comme 0
    return {
        tsun : d3.mean(selection, d => +d.tsun), 
        wspd : d3.mean(selection, d => +d.wspd),
        wpgt : d3.mean(selection, d => +d.wpgt),
        pres : d3.mean(selection, d => +d.pres)
    };
    //on convertit les données qui sont en format texte en nombre, avec la formule +d
}
  //créer tooltip qui permet d'afficher les données min ,max et la moyenne pour permettre une meilleure visualisation à l'utilisateur
    const tooltip = d3
        .select("#tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background-color", "lightyellow")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "4px");

//conversion des données en coordonnées
function getCoordinates (données){
    let coordinates = [];
    for (var i = 0; i < attributes.length; i++){
        let variable = attributes[i];
        let angle = (Math.PI / 2) + (2* Math.PI * i / attributes.length);

        let r = scales[variable] (données[variable]) //cela permet de reprendre l'échelle émise plus haut dans le code, pour éviter d'avoir des incohérences au niveau des données et de la spider chart. C'est comme une conversion.
        coordinates.push(angleToCoord(angle, r));

    }
    return coordinates

};

function dessiner (data){
    const coords = getCoordinates(data);

    // rassembler les points pour former des polygones et y définir les couleurs
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    let colors = ["green"]; //il n'y a qu'une seule couleur parce que pour l'instant il s'agit de faire un polygone faisant une moyenne du mois, mais il aurait été possible d'en faire un autre servant de rappel annuel.

    // supprime l'ancien polygone
    svg.selectAll("path").remove();
    svg.selectAll(".point").remove();

    //recrée le polygone quand de nouvelles sélections sont faites
    svg.selectAll("path")
        .data([data])
        .join(
            enter => enter.append("path")
                .datum(d => getCoordinates(d))
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", (_, i) => colors[i])
                .attr("fill", (_, i) => colors[i])
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5)
        );
  
    const Coordsdata = attributes.map((attr, i) =>({
        feature : attr,
        value : data[attr],
        coords : coords[i]
    })); // généré par l'IA, pour pouvoir utiliser ensuite "d.coords.x", prcq cela ne marchait pas sans
    //créer extrémités du polygone en points
    svg.selectAll(".point")
        .data(Coordsdata)
        .join(
            enter => enter.append("circle")
            .attr("class", "point")
            .attr("cx", d => d.coords.x)
            .attr("cy", d => d.coords.y)
            .attr("r", 6)
            .attr("fill", "green")
            .attr("stroke", "darkgreen")
            .attr("stroke-width", 2)
            .on("mouseover", (event, d) => {
                tooltip
                .style("visibility", "visible")
                .style("opacity", 1)
                .html(`Moyenne : ${d.value.toFixed(2)} ${unites[d.feature]}`); //généré par l'IA prcq rien ne s'affichait
            })
            .on("mousemove", (event) => {
                tooltip
                .style("left", `${event.pageX+10}px `)
                .style("top", `${event.pageY+10}px `); 
            })
            .on("mouseout", () => {
                 tooltip.style ("visibility", "hidden")
            })
        );
};

//lier les selects aux cantons et aux mois pour permettre de les sélectionner, pour les mois, il va falloir rajouter une liaison entre noms des mois et les numéros, puisque dans le csv, c'est inscrit en chiffre, et dans le résultat final, c'est moins esthétique.
d3.csv("canton_meteo.csv").then(donnees =>{
    const selectC = document.getElementById("cantonselect");
    const selectM = document.getElementById("moisselect");

    const cantons =[];
    donnees.forEach(d => {
        if (!cantons.includes(d.canton)){
            cantons.push(d.canton);
        }
    });
    cantons.sort();

    cantons.forEach(c =>{
        const opt = document.createElement("option");
        opt.value = c;
        opt.innerText = c;
        selectC.appendChild(opt);
    })

    const moisnoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    moisnoms.forEach((m, i) => {
        const opt =document.createElement("option");
        opt.value = i + 1;
        opt.innerText = m;
        selectM.appendChild(opt);
    });
    
    //lier les selects à la fonction dessiner sinon rien ne s"affiche.
    function afficher (){
    const canton = selectC.value;
    const mois = selectM.value;

    const moyenne = calamoyenne(donnees, canton, mois);
    dessiner(moyenne);
    }

    //donner un event aux selects
    selectC.addEventListener("change", afficher);
    selectM.addEventListener("change", afficher);

});
