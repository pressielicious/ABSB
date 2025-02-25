// Inisialisasi peta
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2
});

var mapBounds = [[0, 0], [12888, 8192]]; // Saiz peta
var image = L.imageOverlay('map.jpeg', mapBounds).addTo(map);
map.fitBounds(mapBounds);
map.setMaxBounds(mapBounds);

var markers = {};
var hiddenMarkers = [];

// Fungsi untuk load marker dari coordinates.json
async function loadMarkers() {
    let response = await fetch('coordinates.json');
    let data = await response.json();

    data.forEach(coord => {
        let marker = L.marker([coord.y, coord.x]).addTo(map)
            .bindPopup(coord.name);

        marker.on('contextmenu', function () {
            map.removeLayer(marker);
            hiddenMarkers.push(coord);
            syncToGoogleSheets();
        });

        markers[coord.id] = marker;
    });
}

// Sync ke Google Sheets
function syncToGoogleSheets() {
    let hiddenData = hiddenMarkers.map(m => `${m.id},${m.x},${m.y}`).join("\n");
    let url = "https://script.google.com/macros/s/AKfycbzyHJh3UraXvawXsoDTyCutZ559RLc7XBs6byPNpdwkj_7hiDEoyn-QXh3lf8ar2nHUrg/exec";
    fetch(url, {
        method: "POST",
        body: JSON.stringify({ hidden: hiddenData })
    });
}

// Undo fungsi
document.getElementById('undoButton').addEventListener('click', function () {
    if (hiddenMarkers.length > 0) {
        let lastHidden = hiddenMarkers.pop();
        let marker = L.marker([lastHidden.y, lastHidden.x]).addTo(map)
            .bindPopup(lastHidden.name);
        markers[lastHidden.id] = marker;
    }
});

// Load markers
loadMarkers();
