let leafletMap = null;
let leafletMarker = null;

export function createMapModal(onSelect) {
  const container = document.createElement("div");
  container.innerHTML = `
    <style>
      #mapContainer {
        width: 80vw;
        height: 80vh;
      }
    </style>
    <div>
      <h3>Choisissez un point sur la carte</h3>
      <div id="mapContainer"></div>
      <p id="coords">Cliquez sur la carte pour obtenir la position</p>
    </div>
  `;

  setTimeout(() => {
    if (!leafletMap || leafletMap) {
      leafletMap = L.map("mapContainer").setView([0.491942, 29.472851], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMap);

      leafletMap.on("click", (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById("coords").textContent = `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;

        // Appel de la fonction callback
        if (typeof onSelect === "function") {
          onSelect({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        }

        // Afficher aussi dans l'input s'il existe
        const input = document.querySelector("#geoloc");
        if (input) input.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        if (leafletMarker) {
          leafletMarker.setLatLng([lat, lng]);
        } else {
          leafletMarker = L.marker([lat, lng]).addTo(leafletMap);
        }
      });
    }
    leafletMap.invalidateSize();
  }, 200);

  return container;
}
