'use strict';

import { collection, query, where, onSnapshot, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../httplibs/firebaseconfig";
import { messagesController } from "./chat/messages";
import { authManager } from "../../httplibs/authApp";
import { profileController } from "./profil/profile";


class ExpotateurController {
    #principalContainer;
    #mainContainer;

    #user;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");

        window.location.hash = "cooperative"; // Set default hash to cooperative

        this.#user = null;

        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>`;

        this.#handleHashChangeEvent();
    }

    #handleHashChangeEvent() {
        window.addEventListener("hashchange", async (e) => {
            const hash = window.location.hash.replace("#", "");

            if (hash == "cooperatives") {
                this.#initCooperatives();
                return;
            }

            if (hash == "messagerie") {
                if(!this.#user){
                    return
                }
                messagesController.init(this.#user.data.data.id, this.#user.data.type);
                return;
            }

            if (hash == "profil") {
                if (!this.#user) return;
                this.#principalContainer.innerHTML = "<p>Chargement du profil...</p>";
                await profileController.init(this.#user.data.data.id, this.#user.data.type);
            }
        });
    }

    async #handleClickMainContainer() {
        this.#mainContainer.addEventListener("click", (e) => {
            const target = e.target;
            const coop = (c, lat , lng)=>{ return {
                    nom: c.getAttribute("nom"),
                    ville: c.getAttribute("ville"),
                    quartier: c.getAttribute("quartier"),
                    avenu: c.getAttribute("avenu"),
                    numero: c.getAttribute("num"),
                    email: c.getAttribute("email"),
                    phone : c.getAttribute("phone"),
                    stockCacao : c.getAttribute("stockcacao"),
                    lat: lat,
                    lng: lng, 
                    datecreation : c.getAttribute("datecreation"),
                }};
            if (target.classList.contains("cooperative-card")) {
                const lat = parseFloat(target.getAttribute("lat"));
                const lng = parseFloat(target.getAttribute("log"));
                const c = target;

                this.#afficherCooperativeAvecOnglets(coop(c, lat, lng));
                return;
            }

            if (target.classList.contains("cooperative-info__title") || target.classList.contains("cooperative-info__adress") || target.classList.contains("cooperative-info")) {
                const c = target.closest(".cooperative-card");
                const lat = parseFloat(c.getAttribute("lat"));
                const lng = parseFloat(c.getAttribute("log"));
                
                this.#afficherCooperativeAvecOnglets(coop(c, lat, lng));
                return;
            }

            if (target.classList.contains("back-coope")) {
                this.init();
            }

        });
    }

    async init() {
        try {
            this.#user = await authManager.getUserFirestore();
            this.#initCooperatives();
            this.#handleClickMainContainer();
        } catch (error) {
            console.error("Error initializing customers:", error);
        }
    }

    #initCooperatives() {
        this.#initCustomers();
        this.#principalContainer.innerHTML = ``;
        this.#principalContainer.appendChild(this.#mainContainer);
    }

    #initCustomers() {
        try {
            const colRef = collection(firestore, "users");
            const q = query(colRef, where("type", "==", "--coope"));

            onSnapshot(q, (snapshot) => {
                const customers = [];
                snapshot.forEach((doc) => {
                    customers.push({ id: doc.id, ...doc.data() });
                });
                this.#renderCustomersFromSnapshot(customers);
            });
        } catch (error) {
            console.error("Error initializing customers:", error);
        }
    }

    #renderCustomersFromSnapshot(customers) {
        this.#mainContainer.innerHTML = "";
        const container = document.createElement('div');
        container.innerHTML = "<h4>Coopératives</h4>";
        container.classList.add("cooperative-list");

        customers.forEach(customer => {
            const nom = customer.data.nom ?? "";
            const ville = customer.data.ville == "Inconnu" ? "" : customer.data.ville;
            const numero = customer.data.numero == "Inconnu" ? "" : customer.data.numero;
            const quartier = customer.data.quartier ?? "";
            const avenu = customer.data.avenu ?? "";
            const geo_loc = customer.data.geo_loc ?? { lat: 0, long: 0 };
            const email = customer.data.contact.mail;
            const phone = customer.data.contact.phone;
            const stockCacao = customer.data.stock_solde;
            const datecreation = customer.data.datecreation ? customer.data.datecreation.toDate().toLocaleDateString() : "Non spécifié";

            const card = `
                <div class="cooperative-card" id="${customer.id}" lat="${geo_loc.lat}" log="${geo_loc.long}" email="${email}" phone="${phone}" nom="${nom}" ville="${ville}" quartier="${quartier}" avenu="${avenu}"  num="${numero}" stockcacao="${stockCacao}" datecreation="${datecreation}">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">${nom}</h3>
                        <p class="cooperative-info__adress">${ville}, ${quartier}, ${avenu},${numero}</p>
                    </div>
                    <div class="cooperative-stock">
                        <strong>Stock :</strong>
                        <span>${stockCacao} kg</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

        this.#mainContainer.appendChild(container);
    }

    #afficherCooperativeAvecOnglets(coop) {
        this.#mainContainer.innerHTML = `
            <div class="coop-view-container">
                <div class="coop-view-header">
                <button class="coop-tab-btn back-coope" >Retour</button>
                    <div style="margin-left:auto;">
                        <button class="coop-tab-btn coop-tab-btn--active" id="btn-detail">Détails</button>
                        <button class="coop-tab-btn" id="btn-map">Localisation</button>
                    </div>
                </div>
                <div class="coop-view-content" id="coop-view-content"></div>
            </div>
        `;

        this.#chargerDetailView(coop);

        document.getElementById("btn-detail").addEventListener("click", () => {
            this.#chargerDetailView(coop);
            this.#activerOnglet("btn-detail");
        });

        document.getElementById("btn-map").addEventListener("click", () => {
            this.#chargerMapView(coop);
            this.#activerOnglet("btn-map");
        });

        document.querySelector(".back-coope").addEventListener("click", () => this.init());
    }

    #chargerDetailView(coop) {
        const content = document.getElementById("coop-view-content");
        content.innerHTML = `
                <h2>Détails - Coopérative Cacao Kivu</h2>

                <div class="dashboard-grid">
                    
                    <div class="dashboard-section dashboard-stock-list">
                    <h3>Produits en stock</h3>
                    <div class="stock-card-container">
                        <!-- Les cartes des produits seront injectées ici -->
                        <div class="stock-card">
                        <h4 class="stock-card-title">Cacao Forastero</h4>
                        <p class="stock-card-quantite">1.2 tonnes disponibles</p>
                        </div>

                        <div class="stock-card">
                        <h4 class="stock-card-title">Cacao Criollo</h4>
                        <p class="stock-card-quantite">0.8 tonnes disponibles</p>
                        </div>
                    </div>
                    </div>
                    <div class="dashboard-section dashboard-coop-details">
                        <h3>Informations sur la coopérative</h3>
                        <p><strong>Nom :</strong> <span class="coop-nom">${coop.nom}</span></p>
                        <p><strong>E-mail :</strong> <span class="coop-nom">${coop.email ?? "Non spécifié"}</span></p>
                        <p><strong>Contact :</strong> <span class="coop-contact">${coop.phone ?? "Non spécifié"}</span></p>
                        <p><strong>Responsable :</strong> <span class="coop-responsable">${coop.nom}</span></p>
                        <p><strong>Date d'enregistrement :</strong> <span class="coop-date">${coop.datecreation}</span></p>
                        <p><strong>Adresse :</strong> <span class="coop-adresse">${coop.ville}, ${coop.quartier}, ${coop.avenu} ${coop.numero}</span></p>
                    </div>
                </div>
        `;
    }

    #chargerMapView(coop) {
        const content = document.getElementById("coop-view-content");
        content.innerHTML = `<div id="map" style="height: 400px;"></div>`;

        const map = L.map("map").setView([coop.lat, coop.lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([coop.lat, coop.lng])
            .addTo(map)
            .bindPopup(coop.nom)
            .openPopup();
    }

    #activerOnglet(activeId) {
        document.querySelectorAll(".coop-tab-btn").forEach(btn => {
            btn.classList.remove("coop-tab-btn--active");
        });
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add("coop-tab-btn--active");
        }
    }

}

export const expotateurController = new ExpotateurController();
