'use stricl'


class ExpotateurController{
    #customers;
    constructor() {
        this.#customers = [];
    }

    async init(){
        const colRef = collection(firestore, "users");
        const q = query(colRef, where("type", "==", "--coope"));
        onSnapshot(q, (data)=>{
            data.forEach((d)=>{
                console.log(d)
            });
        });
    }

    addCustomer(customer) {
        this.customers.push(customer);
    }

    getCustomers() {
        return this.customers;
    }

    findCustomerById(id) {
        return this.customers.find(customer => customer.id === id);
    }

    removeCustomer(id) {
        this.customers = this.customers.filter(customer => customer.id !== id);
    }
}

export const expotateurController = new ExpotateurController(); 
