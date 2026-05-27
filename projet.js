const largeur = 800;
const hauteur = 600;
const marges = 25;

//interface bouton + choix des dates 

let input = document.createElement("input")
document.body.appendChild(input)
let bouton = document.createElement("button")
document.body.appendChild(bouton)
bouton.innerHTML="Choisir"
let espace = document.createElement("br")
document.body.appendChild(espace)
input.type = "date"
input.min = "2025-01-01"
input.max = "2025-12-31"
input.label = "Date"





const svg = d3
.select("body")
.append("svg")
.attr("width", largeur)
.attr("height", hauteur)
.style("border", "1px solid black");

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
    dessiner (suisse, canton_ch, date_du_jour)
    console.log("date choisie:", recup_date_choisie);
    console.log("données trouvées:", date_du_jour);
    
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
    .attr("strike-width","1.5")

    //carte canton
    

    const canton =svg.append("g")

    canton
    .selectAll("path")
    .data(cantons.features)
    .join("path")
    .attr("d",pathGenerator)
    .attr("fill",(d) =>{
        const temp = tavgCanton[d.properties.NAME]
        return temp!==undefined? colorScale(temp) : "#cccccc"
    })

    
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
    .attr("r",5)
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

    
}







