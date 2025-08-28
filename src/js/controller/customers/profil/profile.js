"use strict";
import { firestore } from "../../../httplibs/firebaseconfig";
import {
    collection,
    onSnapshot,
    query,
    where,
    addDoc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";

import { authManager } from "../../../httplibs/authApp";

import { checkAuth } from "../../authentification/checkauth";

class ProfileController {
    #idCurrentUser;
    #typeUser;
    #mainContainer;
    #principalContainer;

    constructor() {
        this.#idCurrentUser = null;
        this.#typeUser = null;
        
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");
        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>`;
        this.#principalContainer.appendChild(this.#mainContainer);
    }

    async init(idCurrentUser, typeUser) {
        this.#idCurrentUser = idCurrentUser;
        this.#typeUser = typeUser;
        const user = await authManager.getUserFirestore();
        
        if (!user) return;
        this.#renderProfile(user);

        document.querySelector(".btn-deconnect").addEventListener("click", () => {
            checkAuth.deconect();
        });
    }

    async #loadDiscussions() {
        if (!this.#typeUser) return;

        const searchedType = this.#typeUser === "--coope" ? "--expo"
            : this.#typeUser === "--expo" ? "--coope"
            : null;
        if (!searchedType) return;

        try {
            const usersRef = collection(firestore, "users");
            const q = query(usersRef, where("type", "==", searchedType));
            onSnapshot(q, (snapshot) => {
                const users = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log(users);
                this.#renderProfile(users);
            });
        } catch (error) {
            console.error("Erreur lors du chargement des discussions :", error);
        }
    }

    #renderProfile(user) {
        const customer = user.data;

        const id = customer.id;
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
        const type = customer.type == "--coope" ? "Coopérative":  customer.type == "--expo" ? "Exportateur" : "Inconnu";

        console.log("le custommer type ", customer.type);


        const model = `
            <div id="user-profile" class="user-profile-card" idUser="${id}">
                <div class="user-header">
                    <h2>Profil utilisateur</h2>
                    <p>Détails du compte</p>
                </div>
                <div class="user-info">
                    <div class="info-row">
                        <span class="label">Nom :</span>
                        <span class="value" id="user-nom">${nom}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Type de compte :</span>
                        <span class="value" id="user-type">${type}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Téléphone :</span>
                        <span class="value" id="user-telephone">${phone}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Email :</span>
                        <span class="value" id="user-email">${email}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Ville :</span>
                        <span class="value" id="user-ville">${ville}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Quartier :</span>
                        <span class="value" id="user-quartier">${quartier}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Avenue :</span>
                        <span class="value" id="user-avenu">${avenu}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Numéro :</span>
                        <span class="value" id="user-numero">${numero}</span>
                    </div>
                </div>

                <div class="stock-section" id="cooperative-stock-section" style="display: none;">
                <h3>Stock de cacao</h3>
                    <div class="stock-row">
                        <span class="label">Stock actuel :</span>
                        <span class="value" id="user-stock">Chargement...</span>
                    </div>
                    <button id="btn-modifier-stock" class="btn-primary">Modifier le stock</button>
                </div>

                <div class="actions">
                    <!--<button id="btn-modifier-profil" class="btn btn-secondary">Modifier le profil</button>-->
                    <button id="btn-deconnexion" class="btn btn-login btn-deconnect">Déconnexion</button>
                    <button id="btn-update-${customer.type == "--coope"?"quant-dispo": "demande"}" class="btn btn-login btn-deconnect">Modifier ${customer.type == "--coope" ? "La quantie dispobile": "La demande" }</button>
                </div>
            </div>
        `;

        this.#principalContainer.innerHTML = model;

    }

}

export const profileController = new ProfileController();