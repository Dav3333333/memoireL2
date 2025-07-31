'use strict';

// import { firestore } from "../../httplibs/firebaseconfig";
// import { collection, onSnapshot , query, where} from "firebase/firestore";
// import { authManager } from "../../httplibs/auth";

import { collection, query, where, onSnapshot, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../httplibs/firebaseconfig";
import { messagesController } from "./chat/messages";
import { authManager } from "../../httplibs/auth";


/** * CooperativeController
 * This controller manages a list of customers in a cooperative.
 * It allows adding, retrieving, finding by ID, and removing customers.
 */

class CooperativeController {
    #principalContainer;
    #mainContainer;

    #user;

    constructor() {
        window.location.hash = "exportateur"; // Set default hash to cooperative

        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");

        this.#user = null;

        this.#principalContainer.innerHTML = "";
        this.#principalContainer.appendChild(this.#mainContainer);
    }
    
    async init(){
        try {
            this.#user = await authManager.getUserFirestore();
            this.#initCustomers();
            this.#handleHashChangeEvent();
        } catch (error) {
            console.error("Error initializing customers:", error);
        }
    }

    #handleHashChangeEvent(){
        window.addEventListener("hashchange", async (e) => {
            const hash = window.location.hash.replace("#", "");

            console.log("Hash changed form cooperative type to:", hash);

            if (hash == "messagerie") {
                if(!this.#user){
                    return
                }
                messagesController.init(this.#user.data.data.id, this.#user.data.type);
                return;
            }
            
        });
    }

    #initCustomers() {
        try {
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

            const card = `
                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3>${nom}</h3>
                        <p>${ville}, ${quartier}, ${avenu}, ${numero}</p>
                    </div>
                    <div class="cooperative-stock">
                        <strong>Stock :</strong>
                        <span>1200 kg</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', card);
        });

        this.#mainContainer.appendChild(container);
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

export const cooperativeController = new CooperativeController(); 