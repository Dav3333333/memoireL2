import { checkAuth } from "./controller/authentification/checkauth";
import { authManager } from "./httplibs/auth";
import { collection, getDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "./httplibs/firebaseconfig";


import { menuController } from "./controller/menuController/menu";
import { expotateurController } from "./controller/customers/exportateur";
import { cooperativeController } from "./controller/customers/cooperative";

class App {
    #dialog; 
    #user;
    #aside;
    #content;

    constructor(){
        this.#dialog = document.querySelector("dialog");
        this.#aside = document.querySelector("#sidebar");
        this.#content = document.querySelector("#main-content .content")
        
        this.#content.innerHTML = "";
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

        this.#getMercurial();

        this.#aside.querySelector("div").innerHTML = `<div class="loader"></div>`;

        this.#aside.querySelector("div").innerHTML = menuController.render(this.#user.data.type);

        menuController.apperenceManageShow();

        await cooperativeController.init()

        this.handleHashChangeEvent(); 
    }

    handleHashChangeEvent(){
    window.addEventListener("hashchange", async (e) => {
        const hash = window.location.hash.replace("#", "");

        // Ex : #home => affiche home page
        if(hash === "cooperative"){
            this.#content.innerHTML = await cooperativeController.render();
        } else if(hash === "exportateur"){
            this.#content.innerHTML = await expotateurController.render();
        }
    });
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