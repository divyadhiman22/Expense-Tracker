export function getCategory(type){
    const categories = {
         "income" : ["Salary", "Rent"],
         "expense" : ["Shopping", "Food", "Movie"]
    }
    return categories[type] || [];
}