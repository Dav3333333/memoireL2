import { checkAuth } from "./controller/authentification/checkauth";
import { authManager } from "./httplibs/auth";
import { collection, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { firestore } from "./httplibs/firebaseconfig";

import { menuController } from "./controller/menuController/menu";
import { customersController } from "./controller/customers/customers";

class App {
    #dialog; 
    #user;
    #aside;
    #content;

    constructor(){
        this.#dialog = document.querySelector("dialog");
        this.#aside = document.querySelector("#sidebar");
        this.#content = document.querySelector("#main-content .content")

        window.location.hash = "cooperative"; // Set default hash to cooperative
        
        // this.#content.innerHTML = "";
        this.handleDialogClickEvents();
    } 

    async init(){
        // chekc if on line
        const online = await authManager.isOnline();
        
        if(!online){
            this.openDialog("<div>check your internet </div>")
            return;
        }

        this.checkAuth();

        document.querySelector(".btn-deconnect").addEventListener("click", () => {
            checkAuth.deconect();
        });

        this.#user = await authManager.getUserFirestore();

        // this.#getMercurial();

        this.#aside.querySelector("div").innerHTML = `<div class="loader"></div>`;

        this.#aside.querySelector("div").innerHTML = menuController.render(this.#user.data.type);

        menuController.apperenceManageShow();

        // initialize controllers
        await customersController.init(this.#user.data.type);

    }


    handleDialogClickEvents(){
        const dialog = document.querySelector("dialog"); 
        dialog.addEventListener("click", (e)=>{
            if(e.target.id == "close-dialog" || e.target.id == "cancel"){
                dialog.close();
            }
        })
    }

    async #getMercurial(){
        // const API_KEY = "YOUR_API_KEY";  // 🔁 Remplace avec ta vraie clé
        // const API_URL = `https://commodities-api.com/api/latest?base=USD&symbols=COCOA`;

        // try {
        //     const response = await fetch(API_URL, {
        //     headers: {
        //         Authorization: `Bearer ${API_KEY}`,
        //     },
        //     });

        //     if (!response.ok) {
        //         throw new Error(`Erreur API : ${response.status}`);
        //     }

        //     const data = await response.json();

        //     if (data && data.data && data.data.rates && data.data.rates.COCOA) {
        //         const cocoaPrice = data.data.rates.COCOA;
        //         console.log(`💰 Prix du cacao : $${cocoaPrice} USD/tonne`);
        //     } else {
        //         console.log("❌ Données cacao non disponibles.");
        //     }

        // } catch (error) {
        //     console.error("⚠️ Erreur lors de la récupération du prix du cacao :", error.message);
        // }

        const mercurialRef = collection(firestore, "prix_mercurial");
        onSnapshot(mercurialRef, (snapshot) => {
            snapshot.forEach((doc) => {
                document.querySelector(".header-right .price strong").textContent =  doc.data().prix_dollars
                return;
            });
        });
    }

    checkAuth() {
        const userSession = checkAuth.check();
        console.log(userSession);
        console.log(userSession.uid)
        if (userSession.uid) {
            console.log("User is authenticated:", userSession);
            // Redirect to dashboard or main page
        } else {
            console.log("User is not authenticated.", userSession);
            // Redirect to login page
            // window.location.href = "login.html"; // Change to your login page
        }
    }

    openDialog(content){
        this.#dialog.innerHTML = content;
        this.#dialog.showModal();
    }

}

const app = new App();
app.init()