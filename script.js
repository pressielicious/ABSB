// Tetapan peta dan image overlay
var map = L.map('map', {
    minZoom: -2,
    maxZoom: 2,
    crs: L.CRS.Simple
}).setView([0, 0], 0);

var w = 8192, h = 12888;
var southWest = map.unproject([0, h], map.getMaxZoom());
var northEast = map.unproject([w, 0], map.getMaxZoom());
var bounds = new L.LatLngBounds(southWest, northEast);

L.imageOverlay("map.jpeg", bounds).addTo(map);
map.setMaxBounds(bounds);

// Senarai marker
var markers = {};
var hiddenMarkers = [];
var sheetURL = "https://script.google.com/macros/s/AKfycbxEb8S7Pqv8od1DaT52VPELjoM7Q_pbINotd_gk8g_eW9_I5WBoEdcfd1Yfy5lTtcZLqw/exec";

// Muatkan marker dari marker.json
fetch('marker.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(m => {
            var marker = L.marker(map.unproject([m.latlng.lng, m.latlng.lat], map.getMaxZoom()))
                .addTo(map)
                .on('contextmenu', function () {
                    hideMarker(m.id);
                });
            markers[m.id] = marker;
        });

        // Muatkan marker yang tersembunyi dari Google Sheets
        fetch(sheetURL + "?action=get")
            .then(response => response.json())
            .then(hiddenIds => {
                hiddenIds.forEach(id => {
                    if (markers[id]) {
                        markers[id].remove();
                    }
                });
            });
    });

// Fungsi untuk sembunyikan marker
function hideMarker(id) {
    if (markers[id]) {
        hiddenMarkers.push(id);
        markers[id].remove();
        updateSheet(id, "hide");
    }
}

// Fungsi untuk undo marker terakhir yang di-hide
document.getElementById("undoBtn").addEventListener("click", function () {
    if (hiddenMarkers.length > 0) {
        var id = hiddenMarkers.pop();
        if (markers[id]) {
            markers[id].addTo(map);
            updateSheet(id, "undo");
        }
    }
});

// Fungsi untuk tsunami (reset semua marker)
document.getElementById("tsunamiBtn").addEventListener("click", function () {
    var password = prompt("Masukkan password:");
    if (password === "rm40") {
        hiddenMarkers = [];
        Object.keys(markers).forEach(id => markers[id].addTo(map));
        updateSheet(null, "reset");
    } else {
        alert("Password salah!");
    }
});

// Fungsi update Google Sheets
function updateSheet(id, action) {
    fetch(sheetURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action, id: id })
    });
}
