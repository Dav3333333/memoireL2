

class DashboardController {
    #principalContainer;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#principalContainer.innerHTML = `
            <h3>Bienvenue sur la plateforme de gestion des exportations agricoles</h3>
            <p>Utilisez le menu pour naviguer à travers les différentes sections.</p>
        `;
        
    }

    init() {
        this.#principalContainer.innerHTML = `
            <div class="dashboard">
                <h2>Tableau de Bord</h2>

                <div class="dashboard-grid">

                    <!-- Section Coopératives -->
                    <div class="dashboard-section">
                    <h3>Quantités Disponibles (Coopératives)</h3>
                    <div class="stock-card-container">
                        <div class="stock-card">
                        <p class="stock-card-title">Coopérative A</p>
                        <p class="stock-card-quantite">Cacao disponible : 500 kg</p>
                        </div>
                        <div class="stock-card">
                        <p class="stock-card-title">Coopérative B</p>
                        <p class="stock-card-quantite">Cacao disponible : 350 kg</p>
                        </div>
                        <div class="stock-card">
                        <p class="stock-card-title">Coopérative C</p>
                        <p class="stock-card-quantite">Cacao disponible : 720 kg</p>
                        </div>
                    </div>
                    </div>

                    <!-- Section Demande Totale -->
                    <div class="dashboard-section">
                    <h3>Total de la Demande (Exportateurs)</h3>
                    <p><strong>Demande totale :</strong> 1 800 kg</p>
                    <p class="dashboard-coop-details">
                        Dernière mise à jour : <strong>25/08/2025</strong>
                    </p>
                    </div>

                    <!-- Section Demandes Exportateurs -->
                    <div class="dashboard-section">
                    <h3>Demandes des Exportateurs</h3>
                    <ul>
                        <li><strong>Exportateur X</strong> → 600 kg</li>
                        <li><strong>Exportateur Y</strong> → 800 kg</li>
                        <li><strong>Exportateur Z</strong> → 400 kg</li>
                    </ul>
                    </div>

                </div>
            </div>

        `;
    }
}

export const dashboardController = new DashboardController();
