// Konfigurasi peta Leaflet
var map = L.map('map', {
    minZoom: -2,
    maxZoom: 2,
    crs: L.CRS.Simple,
    maxBounds: [[0, 0], [12888, 8192]], // Had peta
    maxBoundsViscosity: 1.0 // Paksa peta kekal dalam had
});

var bounds = [[0, 0], [12888, 8192]];
var image = L.imageOverlay('map.jpeg', bounds).addTo(map);
map.fitBounds(bounds);

// Simpan semua marker dan yang tersembunyi
var markers = {};
var hiddenMarkers = new Set();

// Ambil marker tersembunyi dari Google Sheets sebelum load marker
fetch("https://script.google.com/macros/s/AKfycby3hmmexpvbrzZJJdgOKEFHo4HlMMKOA7OxoUAgMYJ1lMWSHWs5Bxpa45onG6K4BfUqjQ/exec?action=getHidden")
    .then(response => response.json())
    .then(hiddenIds => {
        hiddenMarkers = new Set(hiddenIds);

        // Ambil data marker dari coordinates.json
        fetch("coordinates.json")
            .then(response => response.json())
            .then(data => {
                data.forEach(markerData => {
                    let marker = L.marker([markerData.y, markerData.x])
                        .bindPopup(markerData.name)
                        .addTo(map)
                        .on('contextmenu', function () {
                            hideMarker(marker, markerData.id);
                        });

                    markers[markerData.id] = marker;

                    if (hiddenMarkers.has(markerData.id.toString())) {
                        marker.remove();
                    }
                });
            });
    });

// Sembunyikan marker & sync ke Google Sheets
function hideMarker(marker, id) {
    marker.remove();
    hiddenMarkers.add(id.toString());

    fetch(`https://script.google.com/macros/s/AKfycby3hmmexpvbrzZJJdgOKEFHo4HlMMKOA7OxoUAgMYJ1lMWSHWs5Bxpa45onG6K4BfUqjQ/exec?action=hide&id=${id}`)
        .then(() => console.log("Marker hidden:", id));
}

// Undo hide marker terakhir
document.getElementById("undoButton").addEventListener("click", function () {
    if (hiddenMarkers.size > 0) {
        let id = [...hiddenMarkers].pop();
        let marker = markers[id];

        if (marker) {
            marker.addTo(map);
            hiddenMarkers.delete(id);

            fetch(`https://script.google.com/macros/s/AKfycby3hmmexpvbrzZJJdgOKEFHo4HlMMKOA7OxoUAgMYJ1lMWSHWs5Bxpa45onG6K4BfUqjQ/exec?action=show&id=${id}`)
                .then(() => console.log("Marker restored:", id));
        }
    }
});

// Reset semua marker dengan password "rm40"
document.getElementById("tsunamiButton").addEventListener("click", function () {
    let pass = prompt("Masukkan password:");
    if (pass === "rm40") {
        fetch(`https://script.google.com/macros/s/AKfycby3hmmexpvbrzZJJdgOKEFHo4HlMMKOA7OxoUAgMYJ1lMWSHWs5Bxpa45onG6K4BfUqjQ/exec?action=reset`)
            .then(() => {
                console.log("Tsunami triggered!");
                location.reload();
            });
    } else {
        alert("Password salah!");
    }
});

// Simpan marker sebagai fail JSON
document.getElementById("saveButton").addEventListener("click", function () {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(addedMarkers, null, 2));
    let downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "markers.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
});
