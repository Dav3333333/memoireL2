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

    // unsubscribe listener firestore
    this.unsubscribe = null;
  }

  initRealtimeListener() {
    try {
      const colRef = collection(firestore, "users");

      // Si un ancien listener existe → on l’arrête
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      this.unsubscribe = onSnapshot(colRef, (snapshot) => {
        // Reset les tableaux à chaque update
        this.cooperatives = [];
        this.quantites = [];
        this.demandes = [];

        snapshot.forEach((doc) => {
          const data = doc.data();

          if (data.type === "--coope") {
            this.cooperatives.push(data.data.nom || "Sans nom");
            this.quantites.push(data.data.stock_solde || 0);
            this.demandes.push(data.data.demande || 0);
          }
        });

        // Mettre à jour les graphiques
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
        this.barChart.data.labels = this.cooperatives;
        this.barChart.data.datasets[0].data = this.quantites;
        this.barChart.update();
      } else {
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
            maintainAspectRatio: false,
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
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }
  }

async render() {
    const coopCanvas = document.getElementById(this.barCanvasId);
    const demandCanvas = document.getElementById(this.doughnutCanvasId);

    if (!coopCanvas || !demandCanvas) {
        console.warn("Les canvas ne sont pas encore prêts !");
        return;
    }

    // Nettoyer d’éventuels anciens graphiques/listeners
    this.destroy();

    // Lancer l'écoute temps réel et initialiser les graphiques
    this.initRealtimeListener();
}


  // Détruire les anciens graphiques (utile si tu quittes le dashboard)
  destroy() {
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
      this.doughnutChart = null;
    }
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

export const dynamicChart = new DashboardChart("coopChart", "demandChart");
