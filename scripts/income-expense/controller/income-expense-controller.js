// glue between view and model
// Controller - DOM (View I/O)
import { getCategory } from "../../category/controller/category-controller.js";
import transactionOperations from "../../income-expense/services/income-expense-crud.js";
import { initCount } from "../../shared/auto-increment.js";
import Transaction from "../models/transaction.js";

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    bindEvents();
    loadCategory();
    transactionOperations.loadFromStorage();
    printAllTransactions(transactionOperations.getAllTransactions());
    printCountTransaction();
    calculateTotals();
}

// Validation Patterns
const patterns = {
    description: /^.{3,50}$/,  // 3-50 characters
    amount: /^\d+(\.\d{1,2})?$/,  // Positive numbers with optional 2 decimal places
    date: /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD format
    category: /^.{2,30}$/  // 2-30 characters for category
};

// Show Error Message
function showError(input, message) {
    let errorSpan = input.nextElementSibling;
    if (!errorSpan || !errorSpan.classList.contains("error-message")) {
        errorSpan = document.createElement("span");
        errorSpan.classList.add("error-message", "text-red-500", "text-sm", "mt-1");
        input.parentNode.appendChild(errorSpan);
    }
    errorSpan.textContent = message;
}

// Clear Error Message
function clearError(input) {
    let errorSpan = input.nextElementSibling;
    if (errorSpan && errorSpan.classList.contains("error-message")) {
        errorSpan.remove();
    }
}

// Validate Input Fields
function validateField(input, pattern, errorMessage) {
    if (!pattern.test(input.value.trim())) {
        showError(input, errorMessage);
        return false;
    } else {
        clearError(input);
        return true;
    }
}

// Validate Transaction Type
function validateTransactionType() {
    const incomeBtn = document.querySelector("#isincome");
    const expenseBtn = document.querySelector("#isexpense");
    const typeErrorContainer = document.querySelector("#type-error");
    
    if (!incomeBtn.classList.contains('active') && !expenseBtn.classList.contains('active')) {
        if (!typeErrorContainer) {
            const errorSpan = document.createElement("span");
            errorSpan.id = "type-error";
            errorSpan.classList.add("error-message", "text-red-500", "text-sm", "mt-1", "block");
            errorSpan.textContent = "Please select transaction type (Income or Expense)";
            
            // Insert after the type selection buttons
            const buttonContainer = expenseBtn.parentNode;
            buttonContainer.parentNode.insertBefore(errorSpan, buttonContainer.nextSibling);
        }
        return false;
    } else {
        if (typeErrorContainer) {
            typeErrorContainer.remove();
        }
        return true;
    }
}

// Validate Transaction Form
function validateTransactionForm() {
    let isValid = true;
    
    // Get form elements
    const description = document.querySelector('#desc');
    const amount = document.querySelector('#amount');
    const date = document.querySelector('#date');
    const category = document.querySelector('#category');
    
    // Validate each field
    if (!validateField(description, patterns.description, "Description must be 3-50 characters")) isValid = false;
    if (!validateField(amount, patterns.amount, "Amount must be a valid number")) isValid = false;
    if (!validateField(date, patterns.date, "Date must be in YYYY-MM-DD format")) isValid = false;
    if (!validateField(category, patterns.category, "Category must be 2-30 characters")) isValid = false;
    
    // Validate transaction type
    if (!validateTransactionType()) isValid = false;
    
    return isValid;
}

// Alert Modal Setup
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("alert-modal");
    const title = document.getElementById("alert-title");
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
    closeBtn?.addEventListener("click", hideModal);

    // Close modal on OK button click
    okBtn?.addEventListener("click", hideModal);

    // Expose function to global scope for easy access
    window.showAlert = showModal;
});

function bindEvents() {
    document.querySelector('#add')?.addEventListener('click', addTransaction);
    
    // Fix event listeners for income/expense selection
    document.querySelector('#isincome')?.addEventListener('click', function() {
        updateCategoryOptions('income');
        validateTransactionType(); // Validate type selection on change
        
        this.classList.add("active");
        document.querySelector("#isexpense")?.classList.remove("active");
    });
    
    document.querySelector('#isexpense')?.addEventListener('click', function() {
        updateCategoryOptions('expense');
        validateTransactionType(); // Validate type selection on change
        
        this.classList.add("active");
        document.querySelector("#isincome")?.classList.remove("active");
    });
    
    // Delete button setup
    const deleteBtn = document.querySelector('#delete');
    if (deleteBtn) {
        deleteBtn.disabled = true; // Initially disable the delete button
        deleteBtn.addEventListener('click', deleteForever);
    }
    
    // Other buttons
    document.querySelector('#save')?.addEventListener('click', saveTransactions);
    document.querySelector('#update')?.addEventListener('click', updateTransactions);
    document.querySelector('#sort-description')?.addEventListener('click', doSortDescription);
    document.querySelector('#sort-amount')?.addEventListener('click', doSortAmount);
    document.querySelector('#sort-date')?.addEventListener('click', doSortDate);
    
    // Add real-time validation
    document.querySelector('#desc')?.addEventListener('input', function() {
        validateField(this, patterns.description, "Description must be 3-50 characters");
    });
    
    document.querySelector('#amount')?.addEventListener('input', function() {
        validateField(this, patterns.amount, "Amount must be a valid number");
    });
    
    document.querySelector('#date')?.addEventListener('input', function() {
        validateField(this, patterns.date, "Date must be in YYYY-MM-DD format");
    });
    
    document.querySelector('#category')?.addEventListener('input', function() {
        validateField(this, patterns.category, "Category must be 2-30 characters");
    });
}

function calculateTotals() {
    console.log("Calculating totals...");
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

function updateCategoryOptions(type) {
    const categoryInput = document.getElementById('category');
    const categoryLabel = document.getElementById('category-type');
    
    if (!categoryInput || !categoryLabel) return;
    
    if (type === 'income') {
        categoryLabel.textContent = "Income "; // Set label to Income
        categoryInput.value = ''; // Clear the input field
        categoryInput.placeholder = 'Salary, Business, Investments'; // Example categories for income
    } else if (type === 'expense') {
        categoryLabel.textContent = "Expense "; // Set label to Expense
        categoryInput.value = ''; // Clear the input field
        categoryInput.placeholder = 'Food, Rent, Utilities'; // Example categories for expense
    }
    
    // Validate the category field after changing type
    if (categoryInput.value) {
        validateField(categoryInput, patterns.category, "Category must be 2-30 characters");
    }
}

// Transaction editing variables
let transactionObjectForEdit;

// Update transaction function
function updateTransactions() {
    if (!transactionObjectForEdit) {
        showAlert("No transaction selected for editing");
        return;
    }
    
    // Validate form before proceeding
    if (!validateTransactionForm()) {
        return;
    }
    
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    for (let field of fields) {
        const element = document.querySelector(`#${field}`);
        if (!element) continue;
        
        if (field === 'amount') {
            transactionObjectForEdit[field] = parseFloat(element.value);
            continue;
        }
        transactionObjectForEdit[field] = element.value;
    }
    
    // Set transaction type based on active button
    const incomeBtn = document.querySelector("#isincome");
    if (incomeBtn?.classList.contains('active')) {
        transactionObjectForEdit.type = 'income';
    } else {
        transactionObjectForEdit.type = 'expense';
    }
    
    // Update UI
    printAllTransactions(transactionOperations.getAllTransactions());
    printCountTransaction();
    calculateTotals();
    
    // Clear form
    clearForm();
    showAlert("Transaction updated successfully");
}

function loadCategory() {
    const isChecked = document.querySelector('#isexpense')?.checked;
    const categoryType = isChecked ? 'expense' : 'income';
    const category = getCategory(categoryType);
    const select = document.querySelector('#category');
    
    if (!select) return;
    
    select.innerHTML = '';
    category.forEach(c => {
        const optionTag = document.createElement('option');
        optionTag.innerText = c;
        select.appendChild(optionTag);
    });
}

// Generate unique IDs for transactions
const generateId = initCount();

function addTransaction() {
    console.log("Adding new transaction...");
    
    // Validate form before proceeding
    if (!validateTransactionForm()) {
        return;
    }
    
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    const transactionObject = {};
    
    // Generate unique ID
    transactionObject.id = generateId(); 
    
    // Determine transaction type
    const incomeButton = document.querySelector('#isincome');
    if (incomeButton?.classList.contains('active')) {
        transactionObject.type = 'income';
    } else {
        transactionObject.type = 'expense';
    }
    
    // Collect form data
    for (let field of fields) {
        const element = document.getElementById(field);
        if (!element) continue;
        
        if (field === 'amount') {
            transactionObject[field] = parseFloat(element.value);
            continue;
        }
        transactionObject[field] = element.value;
    }
    
    
    try {
        // Add transaction using operations service but don't save to storage yet
        const transaction = transactionOperations.addWithoutSaving(transactionObject);
        
        // Update UI
        printTransaction(transaction);
        printCountTransaction();
        calculateTotals();
        clearForm();
        showAlert("Transaction added Successfully...");
    } catch (error) {
        showAlert("Error adding transaction");
    }
}

function clearForm() {
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) element.value = '';
    });

    // Remove active class from buttons
    const incomeBtn = document.querySelector("#isincome");
    const expenseBtn = document.querySelector("#isexpense");
    if (incomeBtn) incomeBtn.classList.remove("active");
    if (expenseBtn) expenseBtn.classList.remove("active");
    
    // Clear any error messages
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) clearError(element);
    });
    
    // Clear transaction type error if exists
    const typeError = document.querySelector("#type-error");
    if (typeError) typeError.remove();
}

function printTransaction(transaction) {
    if (!transaction) return;
    
    const tbody = document.querySelector("#transactions-rows");
    if (!tbody) return;
    
    const tr = tbody.insertRow();
    tr.classList.add("h-16"); 
    
    for (let key in transaction) {
        if (key === 'isDeleted' || key === 'newlyAdded' || key === 'important' || key === 'type' || key === 'id') {
            continue;
        }
        
        const td = tr.insertCell();
        td.classList.add("p-4");

        if (key === 'mode') {
            const modes = ["", "Cash", "Credit", "UPI"];
            td.innerText = modes[transaction[key]] || transaction[key];
        } else if (key === 'amount') {
            td.innerText = formatCurrency(transaction[key]);
            td.classList.add(transaction.type === 'income' ? 'text-green-500' : 'text-red-500');
        } else {
            td.innerText = transaction[key];
        }

        td.classList.add("text-left", "text-sm", "font-semibold", "text-white");
    }

    const td = tr.insertCell();
    td.classList.add("p-4", "text-center"); 
    td.appendChild(createIcon('fa-solid fa-pen-to-square me-2 hand', edit, transaction.id));
    td.appendChild(createIcon('fa-solid fa-trash hand', toggleMarkDelete, transaction.id));
}

function toggleMarkDelete() {
    const trashIcon = this;
    const transId = trashIcon.getAttribute('transaction-id');
    
    transactionOperations.toggleMark(transId);
    
    const tr = trashIcon.parentNode.parentNode;
    tr.classList.toggle("bg-red-500");
    
    printCountTransaction();
    enableDisable();
    calculateTotals();
}

function enableDisable() {
    const deleteButton = document.querySelector('#delete');
    if (deleteButton) {
        deleteButton.disabled = transactionOperations.countMarked() === 0;
    }
}

function edit() {
    const fields = ['category', 'desc', 'amount', 'mode', 'date'];
    const id = this.getAttribute('transaction-id');
    
    transactionObjectForEdit = transactionOperations.search(id);
    if (!transactionObjectForEdit) {
        showAlert("Transaction not found");
        return;
    }
    
    for (let field of fields) {
        const element = document.querySelector(`#${field}`);
        if (element) element.value = transactionObjectForEdit[field];
    }
    
    // Set the active class on the correct transaction type button
    const incomeBtn = document.querySelector("#isincome");
    const expenseBtn = document.querySelector("#isexpense");
    
    if (transactionObjectForEdit.type === 'income') {
        incomeBtn?.classList.add("active");
        expenseBtn?.classList.remove("active");
    } else {
        expenseBtn?.classList.add("active");
        incomeBtn?.classList.remove("active");
    }
    
    // Clear any error messages
    fields.forEach(field => {
        const element = document.querySelector(`#${field}`);
        if (element) clearError(element);
    });
    
    // Clear transaction type error if exists
    const typeError = document.querySelector("#type-error");
    if (typeError) typeError.remove();
}

function deleteForever() {
    console.log("Calling deleteForever...");
    if (transactionOperations.countMarked() === 0) {
        showAlert("No transactions marked for deletion");
        return;
    }
    
    const updatedTransactions = transactionOperations.remove();
    
    printAllTransactions(updatedTransactions);
    printCountTransaction();
    enableDisable();
    calculateTotals();
    
    showAlert("Selected transactions deleted. Click 'Save' to permanently save changes.");
}

function printAllTransactions(transactions) {
    const tbody = document.querySelector('#transactions-rows');
    if (!tbody) return;
    
    tbody.innerHTML = "";
    
    if (!transactions || transactions.length === 0) {// Show  message if there are no transactions
        const tr = tbody.insertRow();
        const td = tr.insertCell();
        td.colSpan = 6;
        td.classList.add("text-center", "p-4", "text-white");
        td.innerText = "No transactions found";
        return;
    }
    
    transactions.forEach(printTransaction);
}

function saveTransactions() {
    transactionOperations.saveToStorage();
    transactionOperations.initializeCharts(); // Update charts with saved data
    showAlert("Data saved successfully.");
}

function printCountTransaction() {
    const countElement = document.querySelector('#count-transaction');
    if (countElement) {
        countElement.innerText = transactionOperations.getTransactionCount();
    }
}

function createIcon(className, fn, id) {
    const icon = document.createElement('i');
    icon.className = className;
    icon.setAttribute('transaction-id', id);
    icon.addEventListener('click', fn);
    icon.style.cursor = 'pointer'; 
    return icon;
}