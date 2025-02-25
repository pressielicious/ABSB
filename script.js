// 1. Setup Supabase
const supabaseUrl = "https://hlktlsxfjnxjqnpzyymx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsa3Rsc3hmam54anFucHp5eW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0OTE1MTUsImV4cCI6MjA1NjA2NzUxNX0.bU99XgpP56L6LPmCYQRqx-zT2kwiXxEg4uKAP9kWBhk";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Inisialisasi Peta Leaflet
const map = L.map("map", {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "map.jpeg";
const imageBounds = [[-12888, -8192], [12888, 8192]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.setMaxBounds(imageBounds);

// 3. Senarai marker
const markers = {};
let hiddenMarkers = [];
let lastHiddenMarker = null;

// Data marker statik
const markerData = [
    { id: "marker1", lat: 100, lng: 200 },
    { id: "marker2", lat: -300, lng: 150 },
    { id: "marker3", lat: 400, lng: -250 }
];

// 4. Load hidden markers dari Supabase
async function loadHiddenMarkers() {
    let { data, error } = await supabase.from("hidden_markers").select("id");
    if (error) console.error("Error loading markers:", error);

    hiddenMarkers = data ? data.map(m => m.id) : [];

    // 5. Tambah marker ke peta
    markerData.forEach(({ id, lat, lng }) => {
        if (!hiddenMarkers.includes(id)) {
            const marker = L.marker([lat, lng]).addTo(map)
                .on("contextmenu", async function (event) {
                    event.preventDefault(); 
                    this.remove();
                    hideMarker(id);
                })
                .on("mousedown", function (event) {
                    if (event.originalEvent.touches) {
                        longPressTimeout = setTimeout(() => hideMarker(id), 500);
                    }
                })
                .on("mouseup", function () {
                    clearTimeout(longPressTimeout);
                })
                .on("mouseleave", function () {
                    clearTimeout(longPressTimeout);
                });

            markers[id] = marker;
        }
    });
}

// 6. Hide marker dan sync ke Supabase
async function hideMarker(id) {
    if (!hiddenMarkers.includes(id)) {
        hiddenMarkers.push(id);
        lastHiddenMarker = id;
        await supabase.from("hidden_markers").upsert([{ id }]);
    }
}

// 7. Undo last hide
document.getElementById("undoBtn").addEventListener("click", async () => {
    if (lastHiddenMarker) {
        hiddenMarkers = hiddenMarkers.filter(id => id !== lastHiddenMarker);
        await supabase.from("hidden_markers").delete().eq("id", lastHiddenMarker);
        lastHiddenMarker = null;
        location.reload();
    }
});

// 8. Load markers bila page dibuka
loadHiddenMarkers();
