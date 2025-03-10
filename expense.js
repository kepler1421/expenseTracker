document.addEventListener("DOMContentLoaded", function () {
    const expenseForm = document.getElementById("expense-form");
    const expenseList = document.getElementById("expense-list");
    const totalExpenses = document.getElementById("total-expenses");
    const editExpenseModal = new bootstrap.Modal(document.getElementById("editExpenseModal"));
    const editExpenseForm = document.getElementById("edit-expense-form");
    const paginationButtons = document.getElementById("pagination-buttons");

    // Load expenses from localStorage 
    let expenses = [];
    try {
        const savedExpenses = localStorage.getItem("expenses");
        if (savedExpenses) {
            expenses = JSON.parse(savedExpenses);
            if (!Array.isArray(expenses)) {
                console.error("Invalid expenses data. Initializing as empty array.");
                expenses = [];
            }
        }
    } catch (error) {
        console.error("Error loading expenses from localStorage:", error);
        expenses = [];
    }

    let CurrentPage = 1;
    let itemsPerPage = 5;
    
    updateExpenseList();
    
    // Function to save expenses to localStorage with error handling
    function saveExpenses() {
        try {
            localStorage.setItem("expenses", JSON.stringify(expenses));
        } catch (error) {
            console.error("Error saving expenses to localStorage:", error);
        }
    }
    
    // Add Expense
    expenseForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("expense-name").value;
        const amount = parseFloat(document.getElementById("expense-amount").value);
        const date = document.getElementById("expense-date").value;
        
        if (!name || isNaN(amount) || !date) {
            alert("Please fill in all fields correctly");
            return;
        }
        
        const newExpense = { id: Date.now(), name, amount, date };
        expenses.push(newExpense);
        saveExpenses(); 
        updateExpenseList();
        expenseForm.reset();
        
        console.log("Added expense:", newExpense);
        console.log("Current expenses:", expenses);
    });
    
    // Update Expense List
    function updateExpenseList() {
        if (!Array.isArray(expenses)) {
            console.error("Invalid expenses data. Cannot update expense list.");
            return;
        }
        expenseList.innerHTML = "";
        let total = 0;

        const totalPages = Math.ceil(expenses.length / itemsPerPage);
        const currentPageExpenses = expenses.slice((CurrentPage - 1) * itemsPerPage, CurrentPage * itemsPerPage);


        currentPageExpenses.forEach(expense => {
            total += expense.amount;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.date}</td>
                <td>
                    <button class="btn btn-warning btn-sm edit-btn" data-id="${expense.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}">Delete</button>
                </td>
            `;
            
            // Add event listeners directly to the buttons
            row.querySelector('.edit-btn').addEventListener('click', function() {
                editExpense(expense.id);
            });
            
            row.querySelector('.delete-btn').addEventListener('click', function() {
                deleteExpense(expense.id);
            });
            
            expenseList.appendChild(row);
        });

        totalExpenses.textContent = `$${total.toFixed(2)}`;

        updatePaginationButtons(totalPages);

    }

     // Update Pagination Buttons
     function updatePaginationButtons(totalPages) {
        paginationButtons.innerHTML = "";

        // Add previous button
        const previousButton = document.createElement("button");
        previousButton.textContent = "Previous";
        previousButton.disabled = CurrentPage === 1;
        previousButton.addEventListener("click", function() {
            CurrentPage--;
            updateExpenseList();
        });
        paginationButtons.appendChild(previousButton);

        // Add page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageNumberButton = document.createElement("button");
            pageNumberButton.textContent = i;
            pageNumberButton.classList.add("page-number-button");
            if (i === CurrentPage) {
                pageNumberButton.classList.add("active");
            }
            pageNumberButton.addEventListener("click", function() {
                CurrentPage = i;
                updateExpenseList();
            });
            paginationButtons.appendChild(pageNumberButton);
        }

         // Add next button
         const nextButton = document.createElement("button");
         nextButton.textContent = "Next";
         nextButton.disabled = CurrentPage === totalPages;
         nextButton.addEventListener("click", function() {
             CurrentPage++;
             updateExpenseList();
         });
         paginationButtons.appendChild(nextButton);
     }

    // Delete Expense
    function deleteExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses(); 
        updateExpenseList();
    }

    // Edit Expense
    function editExpense(id) {
        const expense = expenses.find(exp => exp.id === id);
        if (!expense) return;

        document.getElementById("edit-expense-id").value = expense.id;
        document.getElementById("edit-expense-name").value = expense.name;
        document.getElementById("edit-expense-amount").value = expense.amount;
        document.getElementById("edit-expense-date").value = expense.date;

        editExpenseModal.show();
    }


    // Save Edited Expense
    editExpenseForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("edit-expense-id").value);
        const name = document.getElementById("edit-expense-name").value;
        const amount = parseFloat(document.getElementById("edit-expense-amount").value);
        const date = document.getElementById("edit-expense-date").value;

        if (!name || isNaN(amount) || !date) {
            alert("Please fill in all fields correctly");
            return;
        }

        const index = expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
            expenses[index] = { id, name, amount, date };
            saveExpenses(); 
            updateExpenseList();
            editExpenseModal.hide();
        }
    });

    function filterExpenses() {
        const filterCategory = document.getElementById("filterCategory").value;
        const expenseList = document.getElementById("expenseList");
        expenseList.innerHTML = "";
        
        expenses.filter(expense => !filterCategory || expense.category === filterCategory).forEach(expense => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${expense.name}</td>
                <td>$${expense.amount.toFixed(2)}</td>
                <td>${expense.date}</td>
                <td>${expense.category}</td>
                <td><button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">Delete</button></td>
            `;
            expenseList.appendChild(row);
        });
    }


    // Filtering and Sorting
document.getElementById("sortBy").addEventListener("change", function () {
    const sortBy = this.value;
    if (sortBy === "dateAsc") {
        expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "dateDesc") {
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "amountAsc") {
        expenses.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === "amountDesc") {
        expenses.sort((a, b) => b.amount - a.amount);
    }
    saveExpenses(); 
    updateExpenseList();   
});


document.getElementById("open-overview").addEventListener("click", function() {
    window.location.href = "expense.html";
});
});
