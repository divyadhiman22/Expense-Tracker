// glue between view and model
// Controller - DOM (View I/O)
import { getCategory } from "../../category/controller/category-controller.js";
import transactionOperations from "../../income-expense/services/income-expense-crud.js"
import { initCount } from "../../shared/auto-increment.js";
import Transaction from "../models/transaction.js";


window.addEventListener('load', init);

function init() {
    bindEvents();
    loadCategory();
    loadAllTransactions();
    printCountTransaction();
    transactionOperations.loadFromStorage();
}


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("alert-modal");
    const title = document.getElementById("alert-title");
    // const message = document.getElementById("alert-message");
    const closeBtn = document.getElementById("alert-close-btn");
    const okBtn = document.getElementById("alert-ok-btn");

    // Function to show modal
    function showModal(alertTitle) {
        title.innerText = alertTitle;

        modal.classList.remove("hidden");
        modal.querySelector("div").classList.add("scale-100", "opacity-100");
    }

    // Function to hide modal
    function hideModal() {
        modal.classList.add("hidden");
        modal.querySelector("div").classList.remove("scale-100", "opacity-100");
    }

    // Close modal on close button click
    closeBtn.addEventListener("click", hideModal);

    // Close modal on OK button click
    okBtn.addEventListener("click", hideModal);

    // Expose function to global scope for easy access
    window.showAlert = showModal;
});

// Example usage:
// showAlert("Warning", "This is an alert message!");



function bindEvents() {
    document.querySelector('#add').addEventListener('click', addTransaction);
    document.querySelector('#isincome').addEventListener('click', updateCategoryOptions('income'));
    document.querySelector('#isexpense').addEventListener('click', updateCategoryOptions('expense'));
    document.querySelector('#delete').disabled = true; // Initially disable the delete button
    document.querySelector('#delete').addEventListener('click', deleteForever);
    document.querySelector('#save').addEventListener('click', saveTransactions);
    document.querySelector('#update').addEventListener('click', updateTransactions);
    document.querySelector('#sort-description').addEventListener('click', doSortDescription);
    document.querySelector('#sort-amount').addEventListener('click', doSortAmount);
    document.querySelector('#sort-date').addEventListener('click', doSortDate);
}

function calculateTotals() {
    const transactions = transactionOperations.getAllTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (!transaction.isDeleted) {  // Only consider non-deleted transactions
            const amount = parseFloat(transaction.amount) || 0;

            if (transaction.type === 'income') {
                totalIncome += amount;
            } else if (transaction.type === 'expense') {
                totalExpense += amount;
            }
        }
    });

    const balance = totalIncome - totalExpense;
    
    // Print the totals to their respective elements
    printTotalIncome(totalIncome);
    printTotalExpense(totalExpense);
    printBalance(balance);
}


function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function printTotalIncome(amount) {
    const incomeElement = document.querySelector('#total-income');
    if (incomeElement) {
        incomeElement.innerHTML = `
            <span class="text-green-500 text-2xl font-bold">${formatCurrency(amount)}</span>
        `;
    }
}

function printTotalExpense(amount) {
    const expenseElement = document.querySelector('#total-expense');
    if (expenseElement) {
        expenseElement.innerHTML = `
            <span class="text-red-500 text-2xl font-bold">${formatCurrency(amount)}</span>
        `;
    }
}

function printBalance(amount) {
    const balanceElement = document.querySelector('#total-balance');
    if (balanceElement) {
        balanceElement.innerHTML = `
            <span class="text-2xl font-bold ${amount >= 0 ? 'text-green-500' : 'text-red-500'}">${formatCurrency(amount)}</span>
        `;
    }
}


function doSortDescription() {
    const transactions = transactionOperations.sort('desc');
    printAllTransactions(transactions);
    printCountTransaction();
}
function doSortAmount() {
    const transactions = transactionOperations.sort('amount');
    printAllTransactions(transactions);
    printCountTransaction();
}
function doSortDate() {
    const transactions = transactionOperations.sort('date');
    printAllTransactions(transactions);
    printCountTransaction();
}



document.getElementById('isincome').addEventListener('click', function() {
    updateCategoryOptions('income');
});

document.getElementById('isexpense').addEventListener('click', function() {
    updateCategoryOptions('expense');
});

function updateCategoryOptions(type) {
    const categoryInput = document.getElementById('category');
    const categoryLabel = document.getElementById('category-type');  
    if (type === 'income') {
        categoryLabel.textContent = "Income "; // Set label to Income
        categoryInput.value = ''; // Clear the input field
        categoryInput.placeholder = 'Salary, Business, Investments'; // Example categories for income
    } else if (type === 'expense') {
        categoryLabel.textContent = "Expense "; // Set label to Expense
        categoryInput.value = ''; // Clear the input field
        categoryInput.placeholder = 'Food, Rent, Utilities'; // Example categories for expense
    }
}




// ************ UPDATING TRANSACTION FUNCTION ***************************
function updateTransactions() {
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    for (let field of fields) {
        if (field === 'amount') {
            transactionObjectForEdit[field] = parseInt(document.querySelector(`#${field}`).value);
            continue;
        }
        transactionObjectForEdit[field] = document.querySelector(`#${field}`).value;
    }
    printAllTransactions(transactionOperations.getAllTransactions());
    printCountTransaction();
    calculateTotals();
}
// ************ LOADING TRANSACTION FUNCTION ***************************
function loadAllTransactions(){
    if(localStorage){
        if(localStorage.transactions){
            const obj = JSON.parse(localStorage.transactions);
            const transactionsArray = obj['transactions-data'];
            const transactions = transactionsArray.map(transactionObj=>{
                const transaction =  new Transaction();
                transaction.id = transactionObj.id;
                transaction.desc = transactionObj.desc;
                transaction.date = transactionObj.date;
                transaction.amount = transactionObj.amount;
                transaction.isDeleted = transactionObj.isDeleted;
                transaction.mode = transactionObj.mode;
                transaction.important= transactionObj.important;
                transaction.newlyAdded= transactionObj.newlyAdded;
                transaction.type= transactionObj.type;
                transaction.category= transactionObj.category;
                return transaction
            });
            transactionOperations.transactions = transactions;
            printAllTransactions(transactions);
            printCountTransaction();
            calculateTotals();

        }  
    }
    
}

// ************ SAVE TRANSACTION FUNCTION ***************************
function saveTransactions() {
    const obj = { "transactions-data": transactionOperations.getAllTransactions() }; // We have the data in an array, so we need to convert it into a JSON object
    const json = JSON.stringify(obj);
    if (localStorage) {
        localStorage.transactions = json; 
        showAlert("Data saved");
    } else {
        showAlert("Outdated browser");
    }
}

// ************ DELETE TRANSACTION FUNCTION ***************************
function deleteForever() {
    console.log("Calling deleteForever...");
    const updatedTransactions = transactionOperations.remove();
    console.log("Transactions after removal:", updatedTransactions);
    printAllTransactions(updatedTransactions);
    printCountTransaction();
    enableDisable();
    calculateTotals();
}

// ************ PRINTING ALL TRANSACTIONS AFTER DELETION FUNCTION ***********
function printAllTransactions(transactions) {
    const tbody = document.querySelector('#transactions-rows');
    tbody.innerHTML = "";
    transactions.forEach(printTransaction);
}

function loadCategory() {
    const isChecked = document.querySelector('#isexpense').checked;
    const category = getCategory(isChecked ? 'expense' : 'income');
    const select = document.querySelector('#category');
    select.innerHTML = '';
    category.forEach(c => {
        const optionTag = document.createElement('option');
        optionTag.innerText = c;
        select.appendChild(optionTag);
    });
}

// ************ ADD TRANSACTION FUNCTION ***************************
document.querySelector("#isincome").addEventListener("click", function () {
    this.classList.add("active");
    document.querySelector("#isexpense").classList.remove("active");
});

document.querySelector("#isexpense").addEventListener("click", function () {
    this.classList.add("active");
    document.querySelector("#isincome").classList.remove("active");
});
const generateId = initCount();
function addTransaction() {
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    const transactionObject = {};
    
    // Generate unique ID
    transactionObject.id = generateId(); 
    
    // Determine transaction type
    const incomeButton = document.querySelector('#isincome');
    const expenseButton = document.querySelector('#isexpense');
    
    if (incomeButton.classList.contains('active')) {
        transactionObject.type = 'income';
    } else if (expenseButton.classList.contains('active')) {
        transactionObject.type = 'expense';
    } else {
        // Default to income if no button is active
        transactionObject.type = 'income';
    }
    
    // Collect form data
    for (let field of fields) {
        if (field == 'amount') {
            transactionObject[field] = parseInt(document.getElementById(field).value);
            continue;
        }
        transactionObject[field] = document.getElementById(field).value;
    }
    
    // Add transaction using operations service
    const transaction = transactionOperations.add(transactionObject);
    
    // Update UI
    printTransaction(transaction);
    printCountTransaction();
    calculateTotals();
}


// ************ PRINT TRANSACTION FUNCTION ***************************
function printTransaction(transaction) {
    const tbody = document.querySelector("#transactions-rows");
    const tr = tbody.insertRow();
    tr.classList.add("h-16"); 
    for (let key in transaction) {
        if (key == 'isDeleted' || key == 'newlyAdded' || key == 'important' || key == 'type' || key == 'id') {
            continue;
        }
        
        const td = tr.insertCell();
        td.classList.add("p-4");

        if (key == 'mode') {
            td.innerText = modes()[transaction[key]];
        } else {
            td.innerText = transaction[key];
        }

        td.classList.add("text-left", "text-sm", "font-semibold", "text-white");
    }

    const td = tr.insertCell();
    td.classList.add("p-4");
    td.classList.add("text-center"); 
    td.appendChild(createIcon('fa-solid fa-pen-to-square me-2 hand', edit, transaction.id));
    td.appendChild(createIcon('fa-solid fa-trash hand', toggleMarkDelete, transaction.id));
}

// ************ TOGGLE MARKING THE TRANSACTION FUNCTION ***************************
function toggleMarkDelete() {
    const trashIcon = this;
    const transId = trashIcon.getAttribute('transaction-id')
    console.log('toggleMarkDelete', transId);
    transactionOperations.toggleMark(transId);
    const tr = trashIcon.parentNode.parentNode;
    tr.classList.toggle("bg-red-500");
    printCountTransaction();
    enableDisable();
}

// ************ DISABLING THE DELETE BUTTON UNTIL THE TRANSACTION FOR DELETION IS SELECTED FUNCTION ***************************
function enableDisable() {
    document.querySelector('#delete').disabled = transactionOperations.countMarked() == 0;
}

// ************ EDIT TRANSACTION FUNCTION ***************************
let transactionObjectForEdit;
function edit() {
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    const id = this.getAttribute('transaction-id');
    transactionObjectForEdit = transactionOperations.search(id);
    for (let field of fields) {
        document.querySelector(`#${field}`).value = transactionObjectForEdit[field];
    }
}

function modes() {
    const mode = ["", "Cash", "Credit", "UPI"];
    return mode;
}

function printCountTransaction() {
    document.querySelector('#count-transaction').innerText = transactionOperations.getTransactionCount();

}

function createIcon(className, fn, id) {
    const icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('transaction-id', id);
    icon.addEventListener('click', fn)
    return icon;
}