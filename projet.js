const largeur = 800;
const hauteur = 600;
const marges = 25 

const svg = d3
.select("body")
.append("svg")
.attr("width", largeur)
.attr("height", hauteur)
.style("border", "1px solid black");

//importation des données
d3.json("swiss_general_map.json").then((suisse)=>{
    d3.json("swiss_Kanton_map.json").then((canton_ch)=>{d3.csv("canton_meteo.csv").then((d_station)=>{
dessiner(suisse,canton_ch,d_station);
});
});
})

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
    .attr("fill","none")
    .attr("stroke","black")
    .attr("stroke-width", "2")
    .attr("stroke-opacity","0.5")
    .style("border", "5px solid black")

    d_station.forEach(d => {
        d.latitude=+d.latitude;
        d.longitude=+d.longitude;
        
    });

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

    
}
