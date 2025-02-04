class Transaction{
    constructor(id = 0, desc = "", amount = 0.0, date = '2000/10/10', mode="", type ="", category = ""){
        this.id = id;
        this.desc = desc;
        this.amount = amount;
        this.date = date;
        this.mode = mode;
        this.type = type;
        this.isDeleted = false;
        this.newlyAdded = true;
        this.important = false;
        this.category = category
    }
    toggleMark(){
        this.isDeleted = !this.isDeleted;
    }
}
export default Transaction;