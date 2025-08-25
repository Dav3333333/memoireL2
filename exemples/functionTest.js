// open coopertative's on map
    async #openCooperativeOnMap(cooperativeId) {
        const docRef = collection(firestore, "users");
        const q = query(docRef, where("type", "==", `${cooperativeId}`));

        onSnapshot(q, (snapshot) => {
            

            const lat = cooperative.data.geo_loc.lat;
            const lng = cooperative.data.geo_loc.long;

            if (!lat || !lng) {
                console.error("Coordonnées manquantes pour cette coopérative !");
                return;
            }

            // Nettoyer le contenu principal
            this.#mainContainer.innerHTML = `
                <div id="map-container">
                    <div class="back-coope">Retour</div>
                    <h3>Localisation de la Coopérative : ${cooperative.nom}</h3>
                    <div id="map"></div>
                </div>
            `;

            // Initialiser la carte Leaflet
            const map = L.map("map").setView([lat, lng], 13);

            // Ajouter une couche OpenStreetMap
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            // Ajouter un marker avec popup
            const marker = L.marker([lat, lng]).addTo(map);
            marker.bindPopup(`<strong>${cooperative.nom}</strong><br>${cooperative.ville || ""}`).openPopup();
        });
    }