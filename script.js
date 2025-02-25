// Konfigurasi peta Leaflet
var map = L.map('map', {
    minZoom: -2,
    maxZoom: 2,
    crs: L.CRS.Simple
});

var bounds = [[0, 0], [12888, 8192]];
var image = L.imageOverlay('map.jpeg', bounds).addTo(map);
map.fitBounds(bounds);

// Simpan marker dan yang tersembunyi
var markers = {};
var hiddenMarkers = [];

// Ambil data marker dari coordinates.json & sync dengan Google Sheets
fetch("coordinates.json")
    .then(response => response.json())
    .then(data => {
        fetch("https://script.google.com/macros/s/AKfycbyDqzPpAzZxPtpgHvnwuYE04hhZ29u4JHYd4WF3PzQmH-N2e65CYmsYjahLyS-dv204/exec?action=getHidden")
            .then(response => response.json())
            .then(hiddenIds => {
                data.forEach(markerData => {
                    let marker = L.marker([markerData.y, markerData.x])
                        .bindPopup(markerData.name)
                        .addTo(map)
                        .on('contextmenu', function () {
                            hideMarker(marker, markerData.id);
                        });

                    markers[markerData.id] = marker;

                    if (hiddenIds.includes(markerData.id.toString())) {
                        marker.remove();
                    }
                });
            });
    });

// Sembunyikan marker & sync ke Google Sheets
function hideMarker(marker, id) {
    marker.remove();
    hiddenMarkers.push({ marker, id });

    fetch(`https://script.google.com/macros/s/AKfycbyDqzPpAzZxPtpgHvnwuYE04hhZ29u4JHYd4WF3PzQmH-N2e65CYmsYjahLyS-dv204/exec?action=hide&id=${id}`)
        .then(() => console.log("Marker hidden:", id));
}

// Undo hide marker terakhir
document.getElementById("undoButton").addEventListener("click", function () {
    if (hiddenMarkers.length > 0) {
        let { marker, id } = hiddenMarkers.pop();
        marker.addTo(map);

        fetch(`https://script.google.com/macros/s/AKfycbyDqzPpAzZxPtpgHvnwuYE04hhZ29u4JHYd4WF3PzQmH-N2e65CYmsYjahLyS-dv204/exec?action=show&id=${id}`)
            .then(() => console.log("Marker restored:", id));
    }
});

// Reset semua marker dengan password "rm40"
document.getElementById("tsunamiButton").addEventListener("click", function () {
    let pass = prompt("Masukkan password:");
    if (pass === "rm40") {
        fetch(`https://script.google.com/macros/s/AKfycbyDqzPpAzZxPtpgHvnwuYE04hhZ29u4JHYd4WF3PzQmH-N2e65CYmsYjahLyS-dv204/exec?action=reset`)
            .then(() => {
                console.log("Tsunami triggered!");
                location.reload();
            });
    } else {
        alert("Password salah!");
    }
});
