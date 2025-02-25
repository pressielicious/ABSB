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

// 🔹 **Tambahan Baru: Left-click untuk tambah marker**
map.on('click', function (e) {
    let name = prompt("Masukkan nama marker:");
    if (name) {
        let newMarker = {
            id: markerId,
            name: name,
            x: e.latlng.lng,
            y: e.latlng.lat
        };

        let marker = L.marker([newMarker.y, newMarker.x])
            .bindPopup(newMarker.name)
            .addTo(map);

        markers[newMarker.id] = marker;
        newMarkers.push(newMarker);
        markerId++;
    }
});

// 🔹 **Tambahan Baru: Butang "Save Markers"**
var saveButton = document.createElement("button");
saveButton.innerText = "Save Markers";
saveButton.style.position = "absolute";
saveButton.style.top = "10px";
saveButton.style.right = "10px";
saveButton.style.padding = "10px 15px";
saveButton.style.backgroundColor = "#007bff";
saveButton.style.color = "white";
saveButton.style.border = "none";
saveButton.style.borderRadius = "5px";
saveButton.style.cursor = "pointer";

saveButton.addEventListener("click", function () {
    if (newMarkers.length === 0) {
        alert("Tiada marker baru untuk disimpan!");
        return;
    }

    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(newMarkers, null, 4));
    let downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "new_markers.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
});

document.body.appendChild(saveButton);
