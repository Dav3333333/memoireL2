'use strict';

// import { firestore } from "../../httplibs/firebaseconfig";
// import { collection, onSnapshot , query, where} from "firebase/firestore";
// import { authManager } from "../../httplibs/auth";

import { collection, query, where, onSnapshot, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../httplibs/firebaseconfig";
import { messagesController } from "./chat/messages";
import { authManager } from "../../httplibs/authApp";
import { profileController } from "./profil/profile";
import { transporters } from "../transporter/transporter";


/** * CooperativeController
 * This controller manages a list of customers in a cooperative.
 * It allows adding, retrieving, finding by ID, and removing customers.
 */

class CooperativeController {
    #principalContainer;
    #mainContainer;
    #user;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");
        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>`;
        this.#principalContainer.appendChild(this.#mainContainer);
        this.#user = null;
    }

    async init() {
        try {
            // Force un hash par défaut si absent
            window.location.hash = "exportateurs";

            this.#user = await authManager.getUserFirestore();
            this.#handleHashChangeEvent(); // Écouteur
            this.#navigateByHash();        // Navigation initiale
        } catch (error) {
            console.error("Error initializing:", error);
        }
    }


    //  Cette méthode gère ce qu’il faut afficher en fonction du hash
    async #navigateByHash() {
        const hash = window.location.hash.replace("#", "");
        console.log("Navigating to:", hash);

        // Réinitialise tout
        this.#principalContainer.innerHTML = ``;
        this.#mainContainer = document.createElement("div");
        this.#principalContainer.appendChild(this.#mainContainer);

        if (hash === "messagerie") {
            if (!this.#user) return;
            this.#mainContainer.innerHTML = ``;
            messagesController.init(this.#user.data.data.id, this.#user.data.type);
            return;
        } 
        if (hash === "exportateurs" || hash === "") {
            this.#initCustomers(); // Charge les exportateurs
            return;
        }

        if (hash === "profil") {
            if (!this.#user) return;
            this.#mainContainer.innerHTML = `<span><div class="loader-green"></div></span><p>Chargement du profil...</p>`;
            await profileController.init(this.#user.data.data.id, this.#user.data.type);
        }

        if (hash == "transporteurs"){
            transporters.init();
            return;
        }
    }

    // 🔁 Ajoute l’écoute de hashchange
    #handleHashChangeEvent() {
        window.addEventListener("hashchange", () => {
            this.#navigateByHash();
        });
    }

    #initCustomers() {
        try {
            this.#mainContainer.innerHTML = "<p>Chargement des exportateurs...</p>";
            const colRef = collection(firestore, "users");
            const q = query(colRef, where("type", "==", "--expo"));

            onSnapshot(q, (snapshot) => {
                const customers = [];
                snapshot.forEach((doc) => {
                    customers.push({ id: doc.id, ...doc.data() });
                });
                this.#renderCustomersFromSnapshot(customers);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des exportateurs:", error);
        }
    }

    #renderCustomersFromSnapshot(customers) {
        this.#mainContainer.innerHTML = "<h4>Exportateurs</h4>";
        const container = document.createElement('div');
        container.classList.add("cooperative-list");

        customers.forEach(customer => {
            const nom = customer.data.nom || "";
            const ville = customer.data.ville && customer.data.ville !== "Inconnu" ? customer.data.ville : "";
            const numero = customer.data.numero && customer.data.numero !== "Inconnu" ? customer.data.numero : "";
            const quartier = customer.data.quartier || "";
            const avenu = customer.data.avenu || "";

            const card = `
                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3>${nom}</h3>
                        <p>${ville}, ${quartier}, ${avenu}, ${numero}</p>
                    </div>
                    <div class="cooperative-stock">
                        <!--<strong>Degree de solvabilite :</strong>
                        <span>1 semaine</span>-->
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

        this.#mainContainer.appendChild(container);
    }
}


export const cooperativeController = new CooperativeController(); 