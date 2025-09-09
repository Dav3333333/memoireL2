"use strict";
import { firestore } from "../../../httplibs/firebaseconfig";
import {
    collection,
    onSnapshot,
    query,
    where, 
    doc, 
    getDocs, 
    updateDoc
} from "firebase/firestore";


import { authManager } from "../../../httplibs/authApp";

import { checkAuth } from "../../authentification/checkauth";

class ProfileController {
    #idCurrentUser;
    #typeUser;
    #mainContainer;
    #principalContainer;
    #dialog;

    constructor() {
        this.#idCurrentUser = null;
        this.#typeUser = null;
        
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#mainContainer = document.createElement("div");
        this.#principalContainer.innerHTML = `<span><div class="loader-green"></div></span>`;
        this.#principalContainer.appendChild(this.#mainContainer);

        this.#dialog = document.querySelector("dialog");
    }

    async init(idCurrentUser, typeUser) {
        this.#idCurrentUser = idCurrentUser;
        this.#typeUser = typeUser;
        const user = await authManager.getUserFirestore();
        
        if (!user) return;
        this.#renderProfile(user);

        this.handleClickEvent();
    }

    async updatdeQuantieDispoDemande(newValue) {
        const collRef = collection(firestore, "users");
        const q = query(collRef, where("data.id", "==", this.#idCurrentUser));

        let data = null;
        if (this.#typeUser === "--coope") {
            data = { "data.stock_solde": newValue };
        } else {
            data = { "data.demande": newValue };
        }

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (document) => {
                const docRef = doc(firestore, "users", document.id);
                await updateDoc(docRef, data);
                console.log("Document successfully updated!");
            });
        } else {
            console.log("Aucun document trouvé pour cet id utilisateur");
        }
    }

    onpenDialogFormSetQuanditeDispoDemande (){
        if (!this.#dialog) return;

        const type = this.#typeUser === "--coope" ? "quantité disponible" : "demande";
        const label = this.#typeUser === "--coope" ? "Quantité disponible (en kg)" : "Demande (en kg)";

        const model = `
            
                <form method="dialog" class="form dialog-form signup-form">
                    <h3>Modifier la ${type} de cacao</h3>
                    <label for="input-${type.replace(" ", "-")}">${label}:</label>
                    <input type="number" id="input-${type.replace(" ", "-")}" name="input-${type.replace(" ", "-")}" required min="0" step="0.01">
                    <div class="dialog-actions form-group">
                        <button type="submit" class="btn btn-primary btn-success">Enregistrer</button>
                        <button type="button" class="btn btn-danger">Annuler</button>
                    </div>
                </form>
        `;

        this.#dialog.innerHTML = model;
        this.#dialog.showModal();

        const form = this.#dialog.querySelector("form");
        const btnCancel = this.#dialog.querySelector(".btn-danger");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const inputValue = parseFloat(form[`input-${type.replace(" ", "-")}`].value);
            if (isNaN(inputValue) || inputValue < 0) {
                alert("Veuillez entrer une valeur valide.");
                return;
            }
            await this.updatdeQuantieDispoDemande(inputValue);
            this.#dialog.close();
        });

        btnCancel.addEventListener("click", () => {
            this.#dialog.close();
        });
    }

    updateMercurialPrice(newMinPrice, newMaxPrice) {
        const collRef = collection(firestore, "prix_mercurial");
        const q = query(collRef);

        getDocs(q).then(async (querySnapshot) => {
            if (!querySnapshot.empty) {
                // Only update the first document (the one with date, vari, min, max)
                const firstDoc = querySnapshot.docs[0];
                const docRef = doc(firestore, "prix_mercurial", firstDoc.id);
                await updateDoc(docRef, {
                    vari:{min: newMinPrice,
                    max: newMaxPrice}
                });
                console.log("Prix mercurial mis à jour !");
            } else {
                console.log("Aucun document trouvé pour prix_mercurial");
            }
        })
    }

    openDiaglogModifPrixMercurial(){
        if (!this.#dialog) return;
        const model = `
            <form method="dialog" class="form dialog-form signup-form">
                <h3>Modifier le prix mercurial du cacao</h3>
                <label for="input-prix-mercurial-min">Prix mercurial minime ($):</label>
                <input type="number" id="input-prix-mercurial-min" name="input-prix-mercurial-min" required min="0" step="0.01">

                <label for="input-prix-mercurial-max">Prix mercurial Max ($):</label>
                <input type="number" id="input-prix-mercurial-max" name="input-prix-mercurial-max" required min="0" step="0.01">
                <div class="dialog-actions form-group">
                    <button type="submit" class="btn btn-primary btn-success">Enregistrer</button>
                    <button type="button" class="btn btn-danger">Annuler</button>
                </div>
            </form>
        `;

        this.#dialog.innerHTML = model;
        this.#dialog.showModal();

        const form = this.#dialog.querySelector("form");
        const btnCancel = this.#dialog.querySelector(".btn-danger");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const minValue = parseFloat(form["input-prix-mercurial-min"].value);
            const maxValue = parseFloat(form["input-prix-mercurial-max"].value);
            if (isNaN(minValue) || minValue < 0 || isNaN(maxValue) || maxValue < 0 || minValue > maxValue) {
                alert("Veuillez entrer des prix valides (min ≤ max, tous ≥ 0).");
                return;
            }
            // await this.updateMercurialPrice(minValue, maxValue);
            this.updateMercurialPrice(minValue, maxValue);
            this.#dialog.close();
        });

        btnCancel.addEventListener("click", () => {
            this.#dialog.close();
        });
    }

    handleClickEvent (){
        const divUser = document.querySelector("#user-profile");
        
        if (!divUser) return;

        divUser.addEventListener("click", (e) => {
            const target = e.target;

            if (target.id === "btn-update-quant-dispo" || target.id === "btn-update-demande") {
                this.onpenDialogFormSetQuanditeDispoDemande();
                return;
            }

            if (target.classList.contains("btn-deconnect")) {
                checkAuth.deconect();
                return;
            }

            if (target.id === "btn-admin-prix-mercurial") {
                this.openDiaglogModifPrixMercurial();
                return;
            }
        });

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
        const isAdmin = customer.data.isAdmin;

        console.log("le custommer type ", customer);


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
                    <button id="btn-deconnexion" class="btn btn-deconnect btn-danger">Déconnexion</button>
                    <button id="btn-update-${customer.type == "--coope"?"quant-dispo": "demande"}" class="btn btn-success">Modifier ${customer.type == "--coope" ? "La quantie dispobile": "La demande" } du Cacao</button>
                    ${isAdmin ? `<button id="btn-admin-prix-mercurial" class="btn btn-primary">Modifier Le prix mercurial</button>` : ""}
                </div>
            </div>
        `;

        this.#principalContainer.innerHTML = model;

    }

}

export const profileController = new ProfileController();