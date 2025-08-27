import { dynamicChart } from "./dynamicChart";

class DashboardController {
    #principalContainer;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
    }

    async init() {
        // Affichage loader
        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>`;

        // Render dashboard
        this.render();

        // 🔑 attendre le prochain cycle de rendu du navigateur
        requestAnimationFrame(async () => {
            await dynamicChart.render();
        });
    }

    async initilizeInComponent(htmlElement) {
        htmlElement.innerHTML = `
        <div class="dashboard">
            <div class="card">
                <h3 color="green">Quantités disponibles (par coopérative)</h3>
                <canvas id="coopChart"></canvas>
            </div>

            <div class="card">
                <h3 class="text">Total Demande vs Disponibilité</h3>
                <canvas id="demandChart"></canvas>
            </div>
        </div>
        `;
        requestAnimationFrame(async () => {
            await dynamicChart.render();
        });
    }

    render() {
        this.#principalContainer.innerHTML = `
        <div class="dashboard">
            <div class="card">
                <h3>Quantités disponibles (par coopérative)</h3>
                <canvas id="coopChart"></canvas>
            </div>

            <div class="card">
                <h3>Total Demande vs Disponibilité</h3>
                <canvas id="demandChart"></canvas>
            </div>
        </div>
        `;
    }
}

export const dashboardController = new DashboardController();
