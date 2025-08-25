import { authManager } from "../../httplibs/authApp";


class CheckAuth {
    constructor() {
    }

    check() {
        return authManager.getUserSession();
    }

    deconect(){
        localStorage.removeItem("userSession");
        window.location.href = "login.html"; // Redirect to login page
    }

    async isAuthenticated() {
    
    }
}


export const checkAuth = new CheckAuth();