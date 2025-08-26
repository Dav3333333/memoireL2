import { firestore } from '../../httplibs/firebaseconfig';
import { collection, onSnapshot } from 'firebase/firestore';

// IMPORT CHARTJS
import {
  Chart,
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Legend,
  Tooltip
} from 'chart.js';

// REGISTER
Chart.register(
  BarController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Legend,
  Tooltip
);

class DashboardChart {
  constructor(barCanvasId, doughnutCanvasId) {
    this.barCanvasId = barCanvasId;
    this.doughnutCanvasId = doughnutCanvasId;

    // Données
    this.cooperatives = [];
    this.quantites = [];
    this.demandes = [];

    // Charts
    this.barChart = null;
    this.doughnutChart = null;
  }

  initRealtimeListener() {
    try {
      const colRef = collection(firestore, "users");

      onSnapshot(colRef, (snapshot) => {
        // Reset les tableaux pour éviter les doublons
        this.cooperatives = [];
        this.quantites = [];
        this.demandes = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.type === "--coope") {
            this.cooperatives.push(data.data.nom || "Sans nom");
            this.quantites.push(data.data.stock_solde);
          }


          if (data.data.demande) {
            this.demandes.push(data.data.demande);
          }
        });

        // Une fois les données récupérées → mettre à jour les graphiques
        this.updateCharts();
      });
    } catch (error) {
      console.error("Error initializing customers:", error);
    }
  }

  updateCharts() {
    const totalDispo = this.quantites.reduce((a, b) => a + b, 0);
    const totalDemande = this.demandes.reduce((a, b) => a + b, 0);

    // === Bar chart ===
    const barCtx = document.getElementById(this.barCanvasId);
    if (barCtx) {
      if (this.barChart) {
        // Update
        this.barChart.data.labels = this.cooperatives;
        this.barChart.data.datasets[0].data = this.quantites;
        this.barChart.update();
      } else {
        // Create
        this.barChart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: this.cooperatives,
            datasets: [{
              label: "Quantité dispo (kg)",
              data: this.quantites,
              backgroundColor: "#4caf50"
            }]
          },
          options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
          }
        });
      }
    }

    // === Doughnut chart ===
    const doughnutCtx = document.getElementById(this.doughnutCanvasId);
    if (doughnutCtx) {
      if (this.doughnutChart) {
        this.doughnutChart.data.datasets[0].data = [totalDispo, totalDemande];
        this.doughnutChart.update();
      } else {
        this.doughnutChart = new Chart(doughnutCtx, {
          type: "doughnut",
          data: {
            labels: ["Disponibilité", "Demande"],
            datasets: [{
              data: [totalDispo, totalDemande],
              backgroundColor: ["#2196f3", "#ff5722"]
            }]
          },
          options: { responsive: true }
        });
      }
    }
  }

  render() {
    this.initRealtimeListener();
  }
}

let dynamicChart = null;

window.addEventListener("DOMContentLoaded", () => {
  dynamicChart = new DashboardChart("coopChart", "demandChart");
  dynamicChart.render();
});

export { dynamicChart };
