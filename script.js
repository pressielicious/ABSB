const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "map.jpeg";  // Tukar kepada fail peta GTA V
const imageBounds = [[-12888, -8192], [12888, 8192]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.setMaxBounds(imageBounds);

const markers = {};
let hiddenMarkers = [];
let lastHiddenMarker = null;

const markerData = [  
    { id: "marker1", lat: -10983.25982027493, lng: 4824.444598954271 },  
    { id: "marker2", lat: -11085.266298500734, lng:4839.724688681809 },  
    { id: "marker3", lat: -11096.517698715572, lng:4907.714981914154 }
];

function loadMarkers() {
    database.ref("hiddenMarkers").on("value", snapshot => {
        hiddenMarkers = snapshot.val() || [];
        updateMarkers();
    });

    markerData.forEach(data => {
        const marker = L.marker([data.lat, data.lng]).addTo(map)
            .on("contextmenu", (e) => hideMarker(data.id, marker));

        markers[data.id] = marker;
    });
}

function hideMarker(id, marker) {
    if (!hiddenMarkers.includes(id)) {
        hiddenMarkers.push(id);
        lastHiddenMarker = id;

        map.removeLayer(marker);
        updateDatabase();
    }
}

function updateMarkers() {
    Object.keys(markers).forEach(id => {
        if (hiddenMarkers.includes(id)) {
            map.removeLayer(markers[id]);
        } else {
            markers[id].addTo(map);
        }
    });
}

function updateDatabase() {
    database.ref("hiddenMarkers").set(hiddenMarkers);
}

document.getElementById("undoBtn").addEventListener("click", () => {
    if (lastHiddenMarker) {
        hiddenMarkers = hiddenMarkers.filter(id => id !== lastHiddenMarker);
        lastHiddenMarker = null;
        updateDatabase();
    }
});

loadMarkers();
