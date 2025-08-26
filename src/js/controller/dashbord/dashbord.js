import { dynamicChart } from "./dynamicChart";

class DashboardController {
    #principalContainer;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>
        `;
        
    }

    init() {
        this.render();
        dynamicChart.render();
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
