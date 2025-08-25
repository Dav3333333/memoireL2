'use strict';

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../httplibs/firebaseconfig";


class ExpotateurController{
    #principalContainer;
    #mainContainer;
    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div"); 
        window.location.hash = "cooperative"; // Set default hash to cooperative

        this.#handleHashChangeEvent();
    }

    #handleHashChangeEvent(){
        window.addEventListener("hashchange", async (e) => {
            const hash = window.location.hash.replace("#", "");
            
            if(hash == "cooperatives"){
                this.#initCooperatives();
                return;
            }

            if(hash == "messagerie"){
                return;
            }

            if(hash == "profil"){
                return;
            }

            console.log("Hash changed form exporter type count to:", hash);

        });
    }



    async #handleClickMainContainer() {
        this.#mainContainer.addEventListener("click", (e)=>{
            const target = e.target
            if (target.classList.contains("cooperative-card")) {
                const lat = parseFloat(target.getAttribute("lat"));
                const lng = parseFloat(target.getAttribute("log"));
                // Here you can add logic to handle the click event, like showing customer details
                this.#openCooperativeOnMap(lat, lng, "coope nom");
                return;
            }

            if(target.classList.contains("cooperative-info__title") || target.classList.contains("cooperative-info__adress")){
                const c = target.closest(".cooperative-card");

                const lat = parseFloat(c.getAttribute("lat"));
                const lng = parseFloat(c.getAttribute("log"));

                this.#openCooperativeOnMap(lat, lng, "coope nom"); 
                return;
            }
            
            if(target.classList.contains("back-coope")){
                this.init();
            }

            console.log("Clicked on cooperative card or text:", e);
        });
    }
    
    async init(){
        try {
            this.#initCooperatives();
            this.#handleClickMainContainer();
        } catch (error) {
            console.error("Error initializing customers:", error);
        }
    }

    // init of components

    #initCooperatives(){
        this.#initCustomers();
        this.#principalContainer.innerHTML = "";
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
        container.classList.add("cooperative-list");

        customers.forEach(customer => {
            const nom = customer.data.nom?customer.data.nom : "" ;
            const ville = customer.data.ville == "Inconnu" || ""? "" : customer.data.ville ;
            const numero = customer.data.numero == "Inconnu" || ""? "": customer.data.numero;
            const quartier = customer.data.quartier? customer.data.quartier: "";
            const avenu = customer.data.avenu? customer.data.avenu: "";
            const geo_loc = customer.data.geo_loc? customer.data.geo_loc: "";

            const card = `
                <div class="cooperative-card" id="${customer.id}" lat="${geo_loc.lat}" log="${geo_loc.long}">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">${nom}</h3>
                        <p class="cooperative-info__adress">${ville}, ${quartier} ${avenu} ${numero}</p>
                    </div>
                    <!--<div class="cooperative-stock">
                        <strong>Stock :</strong>
                        <span>1200 kg</span>
                    </div>-->
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

        this.#mainContainer.appendChild(container);
    }

    // open coopertative's on map
    async #openCooperativeOnMap(lat, lng, nom, ville = "ville Beni (exemple)") {
        if (!lat || !lng) {
            console.error("Coordonnées manquantes pour cette coopérative !");
            return;
        }

        this.#mainContainer.innerHTML = `
            <div id="map-container">
                <div class="back-coope">Retour</div>
                <h3>Localisation de la Coopérative : ${nom}</h3>
                <div id="map"></div>
            </div>
        `;

        const map = L.map("map").setView([lat, lng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`<strong>${nom}</strong><br>${ville}`).openPopup();
    }


    addCustomer(customer) {
        this.customers.push(customer);
    }

    getCustomers() {
        return this.customers;
    }

    findCustomerById(id) {
        return this.customers.find(customer => customer.id === id);
    }

    removeCustomer(id) {
        this.customers = this.customers.filter(customer => customer.id !== id);
    }
}

export const expotateurController = new ExpotateurController(); 
