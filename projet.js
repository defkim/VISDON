const largeur = 800;
const hauteur = 700;
const marges = 25;

//mise en page générale 
let titre = document.createElement("h1")
document.body.appendChild(titre)
titre.innerHTML="Données météorologiques 2025"
titre.style.textAlign="center"
titre.style.fontFamily = "arial"
let espace = document.createElement("br")
document.body.appendChild(espace)

//HEAT MAP


//interface, bouton + choix des dates 

let titre_heatMap = document.createElement("h2")
document.body.appendChild(titre_heatMap)
titre_heatMap.innerHTML="HEAT MAP"
titre_heatMap.style.fontFamily = "arial"

let input = document.createElement("input")
document.body.appendChild(input)
let bouton = document.createElement("button")
document.body.appendChild(bouton)
bouton.innerHTML="Choisir une date"
let espace_1 = document.createElement("br")
document.body.appendChild(espace_1)
input.type = "date"
input.min = "2025-01-01"
input.max = "2025-12-31"
input.label = "Date"
input.value="2025-01-01"





const svg = d3
.select("body")
.append("svg")
.attr("width", largeur)
.attr("height", hauteur)

const svg_2 = d3
.select("body")
.append("svg")
.attr("width", largeur)
.attr("height", hauteur)
.style("border", "1px solid black");
//.style("border", "1px solid black");

let données_suisse, données_cantons, données_stations

//importation des données
d3.json("swiss_general_map.json").then((suisse)=>{
    d3.json("swiss_kanton_map.json").then((canton_ch)=>{d3.csv("canton_meteo.csv").then((d_station)=>{
dessinerCarte(suisse,canton_ch,d_station);
//Choix de la date 
bouton.addEventListener("click", () =>{
    const recup_date_choisie = input.value
    const date_du_jour = d_station.filter (d => d.date.startsWith(recup_date_choisie))
    svg.selectAll("*").remove()
    svg_2.selectAll("*").remove()
    dessinerCarte (suisse, canton_ch, date_du_jour)
    
})
});
});
})


//Création d'un tableau pour convertir données des différents fichier 

const conversion = {
    "AG": "Aargau",
    "AI": "Appenzell Innerrhoden",
    "AR": "Appenzell Ausserrhoden",
    "BE": "Bern",
    "BL": "Basel-Landschaft",
    "BS": "Basel-Stadt",
    "FR": "Fribourg",
    "GE": "Genève",
    "GL": "Glarus",
    "GR": "Graubünden",
    "JU": "Jura",
    "LU": "Luzern",
    "NE": "Neuchâtel",
    "NW": "Nidwalden",
    "OW": "Obwalden",
    "SG": "St. Gallen",
    "SH": "Schaffhausen",
    "SO": "Solothurn",
    "SZ": "Schwyz",
    "TG": "Thurgau",
    "TI": "Ticino",
    "UR": "Uri",
    "VD": "Vaud",
    "VS": "Valais",
    "ZG": "Zug",
    "ZH": "Zürich",
    "GR":"Graubünden",
}

// tooltip avec info température max.,min. et moyenne

var tooltipCarte = d3
.select("body")
.append("div")
.style("opacity", 0)
.style("background-color", "white")
.style("border", "solid")
.style ("position", "absolute")

function dessinerCarte(suisse,cantons,d_station){

    const projection = d3
    .geoMercator()
    .fitExtent(
        [
            [marges, marges],
            [largeur-marges,
                hauteur-marges
            ]
        ],
        suisse
    )
    const pathGenerator = d3.geoPath().projection(projection);
     d_station.forEach(d => {
        d.latitude=+d.latitude;
        d.longitude=+d.longitude;
        d.tmin =+d.tmin;
        d.tmax =+d.tmax;
        d.tavg =+d.tavg;
        d.prcp = d.prcp?+d.prcp:0;// conversion des précipitations

    
        
    });
    

    //Création d'un tableau avec données tmoyenne pour ColorScale 

const tavgCanton = {};
d_station.forEach(d=>{
    //conversin des données entre les fichiers 
    const conv = conversion[d.canton];
    if (conv) tavgCanton[conv] = d.tavg
})

    


//couleur des cantons en fonction de la température moyenne du jour choisi 

const colorScale=d3.scaleLinear()
    .domain([d3.min(d_station , d =>d.tmin), d3.max(d_station, d => d.tmax)])
    .range(["#00cfff", "#ff0000"])

    //carte suisse

    const pays = svg.append("g")

    pays
    .selectAll("path")
    .data(suisse.features)
    .join("path")
    .attr("d",pathGenerator)
    .attr("fill","none")
    .attr("stroke","black")
    .attr("stroke-width","1.5")

    //carte canton
    

    const canton =svg.append("g")

    canton
    .selectAll("path")
    .data(cantons.features)
    .join("path")
    .attr("d",pathGenerator)
    .attr("fill",(d) =>{
        const temp = tavgCanton[d.properties.NAME];
    return temp!==undefined? colorScale(temp): "#cccccc"})
    .attr("stroke","black")
    .attr("stroke-width", "2")
    .attr("stroke-opacity","0.5")
    .style("border", "5px solid black")
    


    //position des stations

    const station =svg.append("g")
    
    station
    .selectAll("circle")
    .data(d_station)
    .join("circle")
    .attr("cx", d=>projection([d.longitude, d.latitude])[0])
    .attr("cy", d=>projection([d.longitude,d.latitude])[1])
    .attr("r",7)
    .attr("fill", "blue")
    .on("mouseover", function (e,d){
        tooltipCarte.html(
            "<b>Canton</b>:" + d.canton +
            "<br><b>Station</b> :" + d.ville +
            "<br><b>T.max</b> :" + d.tmax + "C°" +
            "<br><b>T.min</b> :" + d.tmin + "C°" +
            "<br><b>T.moyenne</b> :" + d.tavg + "C°"
    
        )
        .style ("left", (e.pageX + 15) +"px")
        .style ("top", (e.pageY + 15) +"px")
        .style("stroke", "black")
        .style("stroke-width", "1")
        .style ("stroke-opacity","2")
        .style("opacity", 0.7)
        .style("border-radius", "10px")
        .style("padding", "8px")

    })
    .on("mouseout", function (){
        tooltipCarte.style ("opacity", 0)
    })



    


//HISTOGRAMME

//interface générale 
//let titre_histogramme = document.createElement("h2")
//document.body.appendChild(titre_histogramme)
//titre_histogramme.innerHTML="HISTOGRAMME DES PRECIPITATIONS"
//titre_histogramme.style.fontFamily = "arial"

//projet 2

const temp = svg_2.append("g")
const cant = svg_2.append("g")

d_station.sort((a,b) => a.canton.localeCompare(b.canton))

const espacement = 28;
const marge_gauche = 40;

temp
.selectAll("rect")
.data(d_station)
.enter()
.append("rect")
.attr("x",(d,i)=> i*espacement+marge_gauche)
.attr("y",(d)=>500-(d.prcp*10))
.attr("width",18)
.attr("height", (d)=>(d.prcp*10))
.attr("fill","aquamarine")


cant
.selectAll("text")
.data(d_station)
.join("text")
.text((d)=>d.canton)
.attr("x",(d,i)=> i*espacement+marge_gauche+9)
.attr("y", 520)
.attr("font-family", "arial")
.attr("font-size", "12px")
.attr("text-anchor", "middle")
.attr("fill","black")

}


//SPIDER-CHART

let titre_SpiderChart = document.createElement("h2")
document.body.appendChild(titre_SpiderChart)
titre_SpiderChart.innerHTML="Spider-Chart"
titre_SpiderChart.style.fontFamily = "arial"

//mettre les selects pour sélectionner le canton et le mois ainsi que les labels des selects pour clarifier

const labelCanton = document.createElement("span");
labelCanton.innerHTML = "Canton : ";
document.body.appendChild(labelCanton);

const selectC = document.createElement("select");
selectC.id = "cantonselect";
selectC.style.marginRight = "10px";
document.body.appendChild(selectC);

const labelMois = document.createElement("span");
labelMois.innerHTML = "Mois : ";
document.body.appendChild(labelMois);

const selectM = document.createElement("select");
selectM.id = "moisselect";
selectM.style.marginBottom = "20px";
document.body.appendChild(selectM);

let espace_3 = document.createElement("br")
document.body.appendChild(espace_3);

const svg_3 = d3
    .select("body")
    .append("svg")
    .attr("width", largeur)
    .attr("height", hauteur)
    .style("border", "1px solid black");

const canton = svg_3.append("g");
d3.csv("canton_meteo.csv").then(dessinerSpider);

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

svg_3.selectAll("circle")
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
svg_3.selectAll("line")
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
svg_3.selectAll(".axislabel")
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
    const tooltipSpider = d3
            .select("body")
            .append("div")
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

function dessinerSpider (data){
    const coords = getCoordinates(data);

    // rassembler les points pour former des polygones et y définir les couleurs
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    let colors = ["green"]; //il n'y a qu'une seule couleur parce que pour l'instant il s'agit de faire un polygone faisant une moyenne du mois, mais il aurait été possible d'en faire un autre servant de rappel annuel.

    // supprime l'ancien polygone
    svg_3.selectAll("path").remove();
    svg_3.selectAll(".point").remove();

    //recrée le polygone quand de nouvelles sélections sont faites
    svg_3.selectAll("path")
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
    svg_3.selectAll(".point")
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
                tooltipSpider
                .style("visibility", "visible")
                .style("opacity", 1)
                .html(`Moyenne : ${d.value.toFixed(2)} ${unites[d.feature]}`); //généré par l'IA prcq rien ne s'affichait
            })
            .on("mousemove", (event) => {
                tooltipSpider
                .style("left", `${event.pageX+10}px `)
                .style("top", `${event.pageY+10}px `); 
            })
            .on("mouseout", () => {
                 tooltipSpider.style ("visibility", "hidden")
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
    dessinerSpider(moyenne);
    }

    //donner un event aux selects
    selectC.addEventListener("change", afficher);
    selectM.addEventListener("change", afficher);

});
