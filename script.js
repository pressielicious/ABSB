// Konfigurasi peta Leaflet
var map = L.map('map', {
    minZoom: -2,
    maxZoom: 2,
    crs: L.CRS.Simple
});

var bounds = [[0, 0], [12888, 8192]];
var image = L.imageOverlay('map.jpeg', bounds).addTo(map);
map.fitBounds(bounds);

// Menyimpan marker yang tersembunyi untuk undo
var hiddenMarkers = [];

// Ambil data marker dari coordinates.json
fetch("coordinates.json")
    .then(response => response.json())
    .then(data => {
        data.forEach(markerData => {
            let marker = L.marker([markerData.y, markerData.x]).addTo(map)
                .bindPopup(markerData.name)
                .on('contextmenu', function () {
                    hideMarker(marker, markerData.id);
                });
        });
    });

// Sembunyikan marker & sync ke Google Sheets
function hideMarker(marker, id) {
    marker.remove();
    hiddenMarkers.push({ marker, id });

    fetch(`https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec?action=hide&id=${id}`)
        .then(res => console.log("Marker hidden:", id));
}

// Undo hide marker terakhir
document.getElementById("undoButton").addEventListener("click", function () {
    if (hiddenMarkers.length > 0) {
        let { marker, id } = hiddenMarkers.pop();
        marker.addTo(map);

        fetch(`https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec?action=show&id=${id}`)
            .then(res => console.log("Marker restored:", id));
    }
});

// Reset semua marker dengan password "rm40"
document.getElementById("tsunamiButton").addEventListener("click", function () {
    let pass = prompt("Masukkan password:");
    if (pass === "rm40") {
        fetch(`https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec?action=reset`)
            .then(res => console.log("Tsunami triggered!"));
        location.reload();
    } else {
        alert("Password salah!");
    }
});
