import { authManager } from "./httplibs/authApp";
import { collection, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { firestore } from "./httplibs/firebaseconfig";

import { menuController } from "./controller/menuController/menu";
import { customersController } from "./controller/customers/customers";

import { checkAuth } from "./controller/authentification/checkauth";

class App {
    #dialog; 
    #user;
    #aside;
    #content;

    constructor(){
        this.#dialog = document.querySelector("dialog");
        this.#aside = document.querySelector("#sidebar");
        this.#content = document.querySelector("#main-content .content")
        
        // this.#content.innerHTML = "";
        this.handleDialogClickEvents();
    } 

    async init(){
        // chekc if on line
        const online = await authManager.isOnline();
        
        if(!online){
            this.openDialog("<div>check your internet  And reload </div>")
            return;
        }

        this.checkAuth();

        this.#user = await authManager.getUserFirestore();

        this.#getMercurial();

        this.#aside.querySelector("div").innerHTML = `<div class="loader"></div>`;

        this.#aside.querySelector("div").innerHTML = menuController.render(this.#user.data.type);

        menuController.apperenceManageShow();

        this.#toggleMenu();

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

        const mercurialRef = collection(firestore, "prix_mercurial");
        onSnapshot(mercurialRef, (snapshot) => {
            snapshot.forEach((doc) => {
                document.querySelector(".header-right .price strong").textContent =  doc.data().vari.from + " $ a " + doc.data().vari.to;
                return;
            });
        });
    }

    checkAuth() {
        const userSession = checkAuth.check();
        if (userSession != null) {
            if(userSession.uid){
            }
        } else {
            console.log("User is not authenticated.", userSession);
            // Redirect to login page
            window.location.href = "login.html"; // Change to your login page
        }
    }

    openDialog(content){
        this.#dialog.innerHTML = content;
        this.#dialog.showModal();
    }

    #toggleMenu(){
        const sidebar = document.getElementById("sidebar");
        const toggleBtn = document.querySelector(".toggle-menu");

        // show the button too the screen
        const handleResize = () => {
            if (window.innerWidth <= 768) {
            toggleBtn.style.display = "block";
            } else {
            toggleBtn.style.display = "none";
            sidebar.classList.remove("active");
            }
        };

        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });

        document.addEventListener("click", (e) => {
            if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains("active") &&
            !sidebar.contains(e.target) &&
            !toggleBtn.contains(e.target)
            ) {
            sidebar.classList.remove("active");
            }
        });

        window.addEventListener("resize", handleResize);

        handleResize();
    }

}

const app = new App();
app.init()