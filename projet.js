const largeur = 800;
const hauteur = 600;
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
dessiner(suisse,canton_ch,d_station);
//Choix de la date 
bouton.addEventListener("click", () =>{
    const recup_date_choisie = input.value
    const date_du_jour = d_station.filter (d => d.date.startsWith(recup_date_choisie))
    svg.selectAll("*").remove()
    svg_2.selectAll("*").remove()
    dessiner (suisse, canton_ch, date_du_jour)
    
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

var tooltip = d3
.select("body")
.append("div")
.style("opacity", 0)
.style("background-color", "white")
.style("border", "solid")
.style ("position", "absolute")

function dessiner(suisse,cantons,d_station){

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
        tooltip.html(
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
        tooltip.style ("opacity", 0)
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










