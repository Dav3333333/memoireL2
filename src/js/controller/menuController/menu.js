
class MenuController {
    #menu;
    constructor() {
        this.#menu = document.querySelector('#sidebar');
    }

    apperenceManageShow(){
        this.#menu.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-link')) {
                const activeItem = this.#menu.querySelector('.menu-link.active');
                if (activeItem) {
                    activeItem.classList.remove('active');
                }   
                activeItem.classList.remove('active');
                e.target.classList.add('active');
            }
        });
    }

    #menuExporter(){
        const model = `
            <nav>
                <ul>
                    <li><a class="menu-link active" id="acceuil" href="#acceuil">Acceuil</a></li>
                    <li><a class="menu-link" id="cooperatives" href="#cooperatives">Coopératives</a></li>
                    <li><a class="menu-link" id="messagerie" href="#messagerie">Messagerie</a></li>
                    <li><a class="menu-link" id="transporteurs" href="#transporteurs">Transporteurs</a></li>
                    <li><a class="menu-link" id="profil" href="#profil">Profil</a></li>
                </ul>
            </nav>
                    `;
        return model;
    }
                
    #menuCooperatives(){
        const model = `
            <nav>
                <ul>
                   <li><a class="menu-link active" id="acceuil" href="#acceuil">Acceuil</a></li>
                    <li><a class="menu-link" id="exportateurs" href="#exportateurs">Exportateurs</a></li>
                    <li><a class="menu-link" id="messagerie" href="#messagerie">Messagerie</a></li>
                    <li><a class="menu-link" id="transporteurs" href="#transporteurs">Transporteurs</a></li>
                    <li><a class="menu-link" id="profil" href="#profil">Profil</a></li>
                </ul>
            </nav>
        `;
        return model;
    }

    render(type_count){
        if(type_count == "--coope"){
            return this.#menuCooperatives();
        }
        if(type_count == "--expo"){
            return this.#menuExporter();
        }
    }

}

export const menuController = new MenuController();
