import { createMapModal } from './mapModal.js';
import { addDoc, collection , doc, serverTimestamp} from 'firebase/firestore';
import { firestore } from '../../httplibs/firebaseconfig.js';
import { authManager } from '../../httplibs/authApp.js';

import { dashboardController } from '../dashbord/dashbord.js';


class Authcontroller {
    #container;
    #dialog;
    constructor() {
        if(authManager.getUserSession()){
            window.location.href = "home.html";
            return;
        }

        window.location.hash = "#signup";
        
        this.#dialog = document.querySelector("dialog");

        this.#container = document.createElement('div');
        this.#container.classList.add("auth-container");

        this.#container.innerHTML = `
        <div class="auth-left">
            <h1> Bienvenue sur <span>Cacao Connect RDC</span> </h1>
            <p> La plateforme de gestion et d'information sur le cacao </p>

            <!-- dashbord -->
            <div class="container-dashbord">
            </div>

            <div>
                <div class="price mercurial">Prix directeur : <strong><div class="loader"></div></strong><span>$/Kg</span></div>
            </div>
        </div>

        <div class="auth-right">
            ${this.rightSignUpContainer()}
        </div>
        `;
        this.handleLoginSignUpMode();
        this.handleClickEvent();
        this.handleFormSubmit();
        dashboardController.initilizeInComponent(this.#container.querySelector(".container-dashbord"));
        document.querySelector("div").appendChild(this.#container);
    }

    onHashChange(){
        let hash = window.location.hash.slice(1);
        let container = document.querySelector(".auth-container .auth-right"); 
        
        if(hash == "login"){
            container.innerHTML = this.rightLoginContainer(); 
        }else if(hash == "signup"){
            container.innerHTML = this.rightSignUpContainer();
        }
        this.handleFormSubmit();
    }

    handleLoginSignUpMode(){
        window.addEventListener("hashchange", (e)=>{
            this.onHashChange();
        });
    }

    handleFormSubmit() {
        const loader = document.createElement("div");
        loader.classList.add("loader");

        if(window.location.hash == "#signup"){
            const form = this.#container.querySelector(".signup-form");

            // Retirer ancien listener (pour éviter doublons)
            form.replaceWith(form.cloneNode(true)); 
            const newForm = this.#container.querySelector(".signup-form");

            newForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                newForm.querySelector(".btn-sub").appendChild(loader);

                const formData = new FormData(newForm);
                const data = Object.fromEntries(formData.entries());
                const type = newForm.querySelector(".type-count--btn.active").id;

                try {
                    // 1. Création user + envoi email vérification
                    const userCredential = await authManager.signUp(data.email, data.mot_de_passe);
                    const user = userCredential.user;

                    // 2. On remplace le formulaire par un message + bouton vérification email
                    newForm.innerHTML = `
                        <p>Un email de vérification a été envoyé à <b>${data.email}</b>. Merci de vérifier votre boîte mail.</p>
                        <p>Après vérification, cliquez sur le bouton ci-dessous :</p>
                        <button id="btnCheckVerification" type="button">J'ai vérifié mon email</button>
                        <p id="verificationMessage"></p>
                    `;

                    const btnCheck = newForm.querySelector("#btnCheckVerification");
                    const verificationMessage = newForm.querySelector("#verificationMessage");

                    btnCheck.addEventListener("click", async () => {
                        // Reload user to get fresh emailVerified status
                        await user.reload();

                        if (user.emailVerified) {
                            verificationMessage.textContent = "Email vérifié ✅ Enregistrement des données...";

                            const idUser = user.uid;
                            const d = {
                                id: idUser,
                                contact: { mail: data.email, phone: data.phone },
                                nom: data.nom,
                                ville: data.ville,
                                quartier: data.quartier,
                                avenu: data.avenu,
                                numero: data.numero,
                                geo_loc: data.geolocalisation 
                                    ? { lat: parseFloat(data.geolocalisation.split(",")[0].trim()), long: parseFloat(data.geolocalisation.split(",")[1].trim()) }
                                    : { lat: 0, long: 0 },
                                num_impot: data.numero_impots,
                                numero_rccm: data.numero_rccm ? data.numero_rccm : "",
                                id_national: data.id_national ? data.id_national : "",
                                stock_solde: 0,
                                datecreation: serverTimestamp(),
                            };

                            const saved = await this.saveCooperativeCountData(d, type);

                            if (saved) {
                                verificationMessage.textContent = "Coopérative enregistrée avec succès ! Redirection...";
                                window.location.href = "index.html";
                            } else {
                                verificationMessage.textContent = "Erreur lors de l'enregistrement des données.";
                            }
                        } else {
                            verificationMessage.textContent = "Email non encore vérifié. Veuillez cliquer sur le lien dans votre mail.";
                        }
                    });

                } catch (err) {
                    newForm.querySelector(".btn-sub").removeChild(loader);
                    console.error("Erreur création utilisateur :", err);
                }
            });
        } else if(window.location.hash == "#login"){
            const form = document.querySelector("#login-form");
            form.addEventListener("submit",  async (e)=>{
                form.querySelector(".btn-sub").appendChild(loader);
                e.preventDefault();
                // Récupération des données du formulaire
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                console.log(data)

                try {
                    const rep = await authManager.login(data.email, data.password);
                    console.log(rep);
                    window.removeEventListener("hashchange", this.onHashChange)
                    window.location.href = "index.html";
                } catch (error) {
                    form.querySelector(".btn-sub").removeChild(loader)
                    console.error("Erreur de connexion :", error.message);
                }
            });
        }
    }

    handleClickEvent(){
        this.#container.addEventListener("click", (e)=>{
            const target = e.target;
            
            // type count auto selection
            if(target.classList.contains("type-count--btn")){
                const selected = target.closest(".container-btn").querySelector(".type-count--btn.active");
                selected.classList.remove("active"); 
                target.classList.add("active")

                const containerField = target.closest(".signup-form").querySelector(".form-fields");

                if(target.id == "--coope"){
                    containerField.innerHTML = this.renderSignUpCooperative();
                    return;
                }else if(target.id == "--expo"){
                    containerField.innerHTML = this.renderSignUpExporter();
                    return;
                }   
            }

            if (target.id === "geo-loca") {
                const containerField = target.closest(".signup-form").querySelector(".form-fields");
                const content = createMapModal((coords) => {
                    console.log("Coordonnées sélectionnées :", coords); // { lat: "...", lng: "..." }

                    const geolocInput = containerField.querySelector("#geoloc");
                    geolocInput.value = `{lat:${coords.lat}, long${coords.lng}}`; // Format: "latitude, longitude"
                    const span = target.querySelector("span");
                    span.textContent = `Lat: ${coords.lat}, Lng: ${coords.lng}`; // Affiche les coordonnées dans le bouton

                    const data = fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`)
                    .then(response => response.json())
                    .then(data => {
                        containerField.querySelector("#ville").value = data.address.city || data.address.town || data.address.village || "Inconnu";
                        containerField.querySelector("#quartier").value = data.address.suburb || "Inconnu";
                        containerField.querySelector("#avenu").value = data.address.road || "Inconnu";
                        containerField.querySelector("#numero").value = data.address.house_number || "Inconnu";
                        console.log("Adresse récupérée :", data.address);
                    return {"avenu":data.address.road || "Inconnu",
                            "quartier": data.address.suburb || "Inconnu",
                            "ville": data.address.city || data.address.town || data.address.village || "Inconnu",
                            "numero": data.address.house_number || "Inconnu"
                    };
                    })
                    .catch(err => console.error("Erreur Nominatim:", err));
                });

                this.#openDialog(content);
            }
        });
    }

    async #openDialog(content){
      this.#dialog.innerHTML = ""; 
      await this.#dialog.appendChild(content);
      this.#dialog.showModal();
    }

    rightSignUpContainer(){
        const model = `
            <form class="signup-form" action="#" method="POST">
                <h2>Créer un compte</h2>
                <div class="type-count">
                    <h3>Type de compte</h3>
                    <div class="container-btn">
                        <button type="button" class="type-count--btn" id="--expo">Exportateurs</button>
                        <button type="button" class="type-count--btn active"id="--coope">cooperatives</button>
                    </div>
                </div>

                <div class="form-fields">
                ${this.renderSignUpCooperative()}
                </div>
                </br>
                </br>
                </br>
            </form>`;
        return model;
    }

    renderSignUpExporter() {
         const model =`
            <div class="form-group">
                <label for="org-name">Nom de Expotateur</label>
                <input type="text" id="nom" name="nom" placeholder="Nom de l'organisation" required />
            </div>
    
            <div class="form-group">
                <label for="email">Adresse email</label>
                <input type="email" id="email" name="email" placeholder="Adresse email" required />
            </div>
    
            <div class="form-group">
                <label for="tel-principal">Téléphone principal</label>
                <input type="tel" id="phone" name="phone" placeholder="Téléphone principal" required />
            </div>
    
            <div class="form-group">
                <label for="adresse">Adresse physique</label>
                <label for="ville">Ville</label>
                <input type="text" id="ville" name="ville" placeholder="Ville/Territoire" required />
    
                <label for="Quartier">Quartier</label>
                <input type="text" id="quartier" name="quartier" placeholder="Quartier" required />
    
                <label for="Avenue">Avenu</label>
                <input type="text" id="avenu" name="avenu" placeholder="Avenue" required />
    
                <label for="Numéro">Numéro</label>
                <input type="text" id="numero" name="numero" placeholder="Ex: 12" required />
    
            </div>
    
            <div class="form-group">
                <label for="num-impots">Numéro d’impôts</label>
                <input type="text" id="numero_impots" name="numero_impots" placeholder="Numéro d’impôts" required />
            </div>

            <div class="form-group">
                <label for="num-impots">Numéro RCCM</label>
                <input type="text" id="numero_rccm" name="numero_rccm" placeholder="Numéro RCCM" required />
            </div>

            <div class="form-group">
                <label for="num-impots">Numéro d'identification national</label>
                <input type="text" id="id_national" name="id_national" placeholder="Numéro d'identification national" required />
            </div>
    
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="mot_de_passe" name="mot_de_passe" placeholder="Mot de passe" required />
            </div>
    
            <div class="form-group">
                <label for="confirm-password">Confirmer le mot de passe</label>
                <input type="password" id="confirm-password" name="confirmation_mot_de_passe" placeholder="Confirmer le mot de passe" required />
            </div>
    
            <button type="submit" class="btn-sub">Créer un compte</button>
    
            <div class="switch-link">
                Déjà un compte ? <a href="#login">Se connecter</a>
            </div>
            
        `;
        return model;
    }

    saveCooperativeCountData(data, type) {
        return addDoc(collection(firestore, "users"),{data, type})
            .then(() => true)
            .catch((error) => {
            console.error("Erreur lors de l'ajout dans Firestore :", error);
            return false;
            });
    }

    renderSignUpCooperative(){
        const model =`
            <div class="form-group">
                <label for="nom">Nom de la cooperative</label>
                <input type="text" id="nom" name="nom" placeholder="Nom de l'organisation" required />
            </div>
    
            <div class="form-group">
                <label for="email">Adresse email</label>
                <input type="email" id="email" name="email" placeholder="Adresse email" required />
            </div>
    
            <div class="form-group">
                <label for="phone">Téléphone principal</label>
                <input type="tel" id="phone" name="phone" placeholder="Téléphone principal" required />
            </div>
    
            <div class="form-group">
                <input type="hidden" id="ville" name="ville" placeholder="Ville/Territoire" required />
    
                <input type="hidden" id="quartier" name="quartier" placeholder="Quartier" required />
    
                <input type="hidden" id="avenu" name="avenu" placeholder="Avenue" required />
    
                <input type="hidden" id="numero" name="numero" placeholder="Ex: 12" required />
    
            </div>
    
            <div class="form-group">
                <label for="geoloc">Géolocalisation</label>
                <input type="hidden" id="geoloc" name="geolocalisation" placeholder="Géolocalisation" />
                <button type="button" id="geo-loca">📍 <span></span></button>
            </div>
    
            <div class="form-group">
                <label for="numero_impots">Numéro d’impôts</label>
                <input type="text" id="numero_impots" name="numero_impots" placeholder="Numéro d’impôts" required />
            </div>
    
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="mot_de_passe" placeholder="Mot de passe" required />
            </div>
    
            <div class="form-group">
                <label for="confirm-password">Confirmer le mot de passe</label>
                <input type="password" id="confirm-password" name="confirmation_mot_de_passe" placeholder="Confirmer le mot de passe" required />
            </div>
    
            <button type="submit" class="btn-sub">Créer un compte</button>
    
            <div class="switch-link">
                Déjà un compte ? <a href="#login">Se connecter</a>
            </div>
            
        `;
        return model;
    }

    renderLoginAdmin() {
        const model = ``;
    }

    // login code
    rightLoginContainer(){
        const form = document.createElement("form"); 
        form.classList.add("auth-form")
        form.id = "login-form"
        form.innerHTML = `
            <h2>Connexion</h2>
            <input id="email" name="email" type="email" placeholder="Email" required />
            <input id="password"  name="password" type="password" placeholder="Mot de passe" required />
            <button type="submit" class="btn-sub">Se connecter</button>
            <div class="switch-link">
                Pas encore de compte ? <a href="#signup">Créer un compte</a>
            </div>`;

        const model = document.createElement("div")
        model.innerHTML = ""; 
        model.appendChild(form);

        return model.innerHTML;
    }
}

export const authcontroller = new Authcontroller();
authcontroller;