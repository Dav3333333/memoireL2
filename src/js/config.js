

class Config{
    constructor(){

        this.handleDialogClickEvents();
    }

    // for all the dialog handle the close fonction
    handleDialogClickEvents(){
        const dialog = document.querySelector("dialog"); 
        dialog.addEventListener("click", (e)=>{
            if(e.target.id == "close-dialog" || e.target.id == "cancel"){
                dialog.close();
            }
        })
    }
}

new Config();
