const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "map.jpeg";
const imageBounds = [[-12888, -8192], [12888, 8192]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.setMaxBounds(imageBounds);

const markers = {};
let hiddenMarkers = [];
let lastHiddenMarker = null;
let longPressTimer = null;

// Data marker statik
const markerData = [
    { id: "marker1", lat: 100, lng: 200 },
    { id: "marker2", lat: -300, lng: 150 },
    { id: "marker3", lat: 400, lng: -250 }
];

function loadMarkers() {
    markerData.forEach(data => {
        const marker = L.marker([data.lat, data.lng]).addTo(map);

        // **PC: Right-Click untuk hide**
        marker.on("contextmenu", (event) => {
            event.preventDefault();
            hideMarker(data.id);
        });

        // **Phone: Tekan Lama (Long Press) untuk hide**
        marker.on("mousedown touchstart", () => {
            longPressTimer = setTimeout(() => hideMarker(data.id), 1500); // 1.5 saat
        });

        marker.on("mouseup touchend", () => {
            clearTimeout(longPressTimer); // Hentikan jika user lepaskan sebelum 1.5s
        });

        markers[data.id] = marker;
    });

    // **Sync hidden markers dari Firebase**
    database.ref("hiddenMarkers").on("value", snapshot => {
        hiddenMarkers = snapshot.val() || [];
        updateMarkers();
    });
}

// **Fungsi untuk Hide Marker & Sync ke Firebase**
function hideMarker(id) {
    if (!hiddenMarkers.includes(id)) {
        hiddenMarkers.push(id);
        lastHiddenMarker = id;
        updateDatabase();
    }
}

// **Update marker visibility berdasarkan Firebase**
function updateMarkers() {
    Object.keys(markers).forEach(id => {
        if (hiddenMarkers.includes(id)) {
            if (map.hasLayer(markers[id])) {
                map.removeLayer(markers[id]);
            }
        } else {
            if (!map.hasLayer(markers[id])) {
                markers[id].addTo(map);
            }
        }
    });
}

// **Simpan hiddenMarkers ke Firebase**
function updateDatabase() {
    database.ref("hiddenMarkers").set(hiddenMarkers);
}

// **Undo - Buang marker terakhir dari senarai tersembunyi**
document.getElementById("undoBtn").addEventListener("click", () => {
    if (lastHiddenMarker) {
        hiddenMarkers = hiddenMarkers.filter(id => id !== lastHiddenMarker);
        lastHiddenMarker = null;
        updateDatabase();
    }
});

// **Muatkan marker bila web dibuka**
loadMarkers();
