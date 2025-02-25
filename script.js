<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GTA V Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://unpkg.com/@supabase/supabase-js"></script>
    <style>
        #map { height: 100vh; width: 100vw; }
    </style>
</head>
<body>
    <div id="map"></div>

    <script>
        // 1. Setup Supabase
        const supabaseUrl = "https://YOUR_SUPABASE_URL.supabase.co";
        const supabaseKey = "YOUR_ANON_KEY";
        const supabase = supabase.createClient(supabaseUrl, supabaseKey);

        // 2. Inisialisasi Peta Leaflet
        const map = L.map("map", {
            minZoom: -2, // Supaya boleh zoom out banyak
            maxZoom: 2, 
            crs: L.CRS.Simple // Sesuai untuk peta gambar
        });

        const bounds = [[0, 0], [12888, 8192]]; // Resolusi peta (ikut projek ABSB kau)
        const imageOverlay = L.imageOverlay("map.jpeg", bounds).addTo(map);
        map.fitBounds(bounds);

        // 3. Senarai marker
        const markers = [
            { id: "marker1", lat: 2000, lng: 3000 },
            { id: "marker2", lat: 5000, lng: 7000 }
        ];

        const markerLayers = {};

        async function loadHiddenMarkers() {
            let { data, error } = await supabase.from("hidden_markers").select("*");
            if (error) console.error("Error loading markers:", error);

            const hiddenMarkers = new Set(data.map(m => m.id));

            // 4. Tambah marker ke peta
            markers.forEach(({ id, lat, lng }) => {
                if (!hiddenMarkers.has(id)) {
                    markerLayers[id] = L.marker([lat, lng])
                        .addTo(map)
                        .on("contextmenu", async function () {
                            this.remove(); 
                            await supabase.from("hidden_markers").upsert([{ id }]);
                        });
                }
            });
        }

        loadHiddenMarkers();
    </script>
</body>
</html>
