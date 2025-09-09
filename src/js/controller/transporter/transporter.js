class Transporters {
    #principalContainer;

    constructor() {
        this.#principalContainer = document.querySelector("#main-content .content");
        this.#principalContainer.innerHTML = "";
    }

    init() {
        this.#principalContainer.innerHTML = `
            <h3>Transporteurs</h3>
            <div class="cooperative-list">
                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">TMK</h3>
                    </div>
                    <div class="cooperative-stock">
                        <span class="text-small text-thin ">Contacts: +243 81 83 01 (tmk@tmkcongo.com)</span>
                    </div>
                </div>
                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">BOLLORE TRANSPORT ET LOGISTIQUE</h3>
                    </div>
                    <div class="cooperative-stock">
                        <span class="text-small text-thin">-</span>
                    </div>
                </div>

                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">Bleu Blan Logistique</h3>
                    </div>
                    <div class="cooperative-stock">
                        <span class="text-small text-thin">+243 976 767 652 (etsbblm@bleublanclogistiquerdc.org)</span>
                    </div>
                </div>

                <div class="cooperative-card">
                    <div class="cooperative-info">
                        <h3 class="cooperative-info__title">GTM</h3>
                    </div>
                    <div class="cooperative-stock">
                        <span class="text-small text-thin">+243 991 002 538 / +243 828 024 167 (secretariatgtm@gtmdrc.com) </span>
                    </div>
                </div>
            </div>
        `;
        this.#handleClickEvent();
    }

    #handleClickEvent(){
        this.#principalContainer.addEventListener("click", (e)=>{
            console.log(e);
        });
    }
}

export const transporters = new Transporters();