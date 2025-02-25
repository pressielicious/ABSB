const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "map.jpeg";  // Tukar kepada fail peta GTA V
const imageBounds = [[-8192, -12888], [8192, 12888]];

L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.setMaxBounds(imageBounds);

const markers = {};
let hiddenMarkers = [];
let lastHiddenMarker = null;

const markerData = [  
    { id: "marker1", lat: 100, lng: 200 },  
    { id: "marker2", lat: -300, lng: 150 },  
    { id: "marker3", lat: 400, lng: -250 }
];

function loadMarkers() {
    markerData.forEach(data => {
        const marker = L.marker([data.lat, data.lng]).addTo(map)
            .on("contextmenu", () => hideMarker(data.id));

        markers[data.id] = marker;
    });

    database.ref("hiddenMarkers").on("value", snapshot => {
        hiddenMarkers = snapshot.val() || [];
        updateMarkers();
    });
}

function hideMarker(id) {
    if (!hiddenMarkers.includes(id)) {
        hiddenMarkers.push(id);
        lastHiddenMarker = id;
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
