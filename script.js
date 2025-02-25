const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "map.jpeg";  // Tukar kepada fail peta GTA V
const imageBounds = [[-8192, -6444], [8192, 6444]];
