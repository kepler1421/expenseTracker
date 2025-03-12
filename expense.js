document.addEventListener("DOMContentLoaded", function () {
  const expenseForm = document.getElementById("expense-form");
  const expenseList = document.getElementById("expense-list");
  const totalExpenses = document.getElementById("total-expenses");
  const editExpenseModal = new bootstrap.Modal(
      document.getElementById("editExpenseModal")
  );
  const editExpenseForm = document.getElementById("edit-expense-form");
  const paginationButtons = document.getElementById("pagination-buttons");
  const addModal = document.getElementById("addExpenseModal");

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

  function addCommas(amount) {
      return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Add Expense
  expenseForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("expense-name").value;
      const amount = parseFloat(document.getElementById("expense-amount").value);
      const date = document.getElementById("expense-date").value;
      const category = document.getElementById("expense-category").value;

      if (!name || isNaN(amount) || !date || !category) {
        Swal.fire({
          title: "Error",
          text: "Please fill in all fields correctly",
          icon: "error",
          confirmButtonText: "Ok",
        });
          return;
      }

      const newExpense = { id: Date.now(), name, amount, date, category };
      expenses.push(newExpense);
      saveExpenses();
      updateExpenseList();
      expenseForm.reset();
      addModal.classList.add("hidden");

      Swal.fire({
        title: "Expense Added",
        text: "Your expense has been added successfully added",
        icon: "success",
        confirmButtonText: "Ok",
      }).then((result) => {
        if (result.isConfirmed) {
          expenseForm.reset();
          addModal.classList.add("hidden");
        }
      });

      console.log("Added expense:", newExpense);
      console.log("Current expenses:", expenses);
      console.log("Formatted amount:", addCommas(amount));
  });

  // Update Expense List
  function updateExpenseList(expensesList = expenses) {
      
      
      if (expenses.length === 0) {
          const noExpenses = document.createElement("div");
          noExpenses.textContent = "No expenses added yet.";
          noExpenses.classList.add("alert", "alert-info", "text-center");
          expenseList.appendChild(noExpenses);
          return;
      }

      if (!Array.isArray(expensesList)) {
          console.error("Invalid expenses data. Cannot update expense list.");
          return;
      }
      const expenseList = document.getElementById("expense-list");
      expenseList.innerHTML = "";
      let total = 0;

      const totalPages = Math.ceil(expensesList.length / itemsPerPage);
      const currentPageExpenses = expensesList.slice(
          (CurrentPage - 1) * itemsPerPage,
          CurrentPage * itemsPerPage
      );

      currentPageExpenses.forEach((expense) => {
          total += expense.amount;
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${expense.name}</td>
              <td>$${addCommas(expense.amount.toFixed(2))}</td>
              <td>${expense.date}</td>
              <td>${expense.category}</td>
              <td>
                  <button class="btn btn-warning btn-sm edit-btn" data-id="${expense.id}">Edit</button>
                  <button class="btn btn-danger btn-sm delete-btn" data-id="${expense.id}">Delete</button>
              </td>
          `;

          // Add event listeners directly to the buttons
          row.querySelector(".edit-btn").addEventListener("click", function () {
              editExpense(expense.id);
          });

          row.querySelector(".delete-btn").addEventListener("click", function () {
              deleteExpense(expense.id);
          });

          expenseList.appendChild(row);
      });

      totalExpenses.textContent = `$${addCommas(total.toFixed(2))}`;

      updatePaginationButtons(totalPages);
  }

  // Update Pagination Buttons
  function updatePaginationButtons(totalPages) {
      paginationButtons.innerHTML = "";

      // Add previous button
      const previousButton = document.createElement("button");
      previousButton.textContent = "Previous";
      previousButton.disabled = CurrentPage === 1;
      previousButton.addEventListener("click", function () {
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
          pageNumberButton.addEventListener("click", function () {
              CurrentPage = i;
              updateExpenseList();
          });
          paginationButtons.appendChild(pageNumberButton);
      }

      // Add next button
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.disabled = CurrentPage === totalPages;
      nextButton.addEventListener("click", function () {
          CurrentPage++;
          updateExpenseList();
      });
      paginationButtons.appendChild(nextButton);
  }

  // Delete Expense
  function deleteExpense(id) {
      Swal.fire({
          title: "Are you sure?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#7bd117",
          confirmButtonText: "Yes, delete it!",
      }).then((result) => {
          if (result.isConfirmed) {
              expenses = expenses.filter((expense) => expense.id !== id);
              saveExpenses();
              updateExpenseList();
              Swal.fire("Deleted!", "Your expense has been deleted.", "success");
          }
      });
  }

  // Edit Expense
  function editExpense(id) {
      const expense = expenses.find((exp) => exp.id === id);
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
      const amount = parseFloat(
          document.getElementById("edit-expense-amount").value
      );
      const date = document.getElementById("edit-expense-date").value;

      if (!name || isNaN(amount) || !date) {
          alert("Please fill in all fields correctly");
          return;
      }

      const index = expenses.findIndex((exp) => exp.id === id);
      if (index !== -1) {
          expenses[index] = { id, name, amount, date };
          saveExpenses();
          updateExpenseList();
          editExpenseModal.hide();
      }
  });

  // Filter
  function filterExpenses() {
      console.log("Filtering expenses...");
      const searchTerm = document.getElementById("search-expenses").value.toLowerCase();
      const categoryFilter = document.getElementById("filterCategory").value;
      const dateFrom = document.getElementById("date-from").value;
      const dateTo = document.getElementById("date-to").value;

      console.log("Category filter:", categoryFilter);
      console.log("Search term:", searchTerm);
      console.log("Date from:", dateFrom);
      console.log("Date to:", dateTo);

      let filteredExpenses = expenses.filter((expense) => {
          const matchesSearch = expense.name.toLowerCase().includes(searchTerm);

          const matchesCategory =
              categoryFilter === "" || expense.category === categoryFilter;

          const expenseDate = new Date(expense.date);
          const fromDate = dateFrom ? new Date(dateFrom) : null;
          const toDate = dateTo ? new Date(dateTo) : null;
          const matchesDateRange =
              (!fromDate || expenseDate >= fromDate) &&
              (!toDate || expenseDate <= toDate);

          return matchesSearch && matchesCategory && matchesDateRange;
      });
      CurrentPage = 1;
      itemsPerPage = 5;

      console.log("Filtered expenses:", filteredExpenses);

      updateExpenseList(filteredExpenses);
  }

  // Add event listener to search input field
  document.getElementById("search-expenses").addEventListener("input", filterExpenses);

  // Add event listener to filter dropdown
  document.getElementById("filterCategory").addEventListener("change", filterExpenses);

  // Add event listener to date from input field
  document.getElementById("date-from").addEventListener("input", filterExpenses);

  // Add event listener to date to input field
  document.getElementById("date-to").addEventListener("input", filterExpenses);

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
      } else if (sortBy === "categoryAsc") {
          expenses.sort((a, b) => a.category.localeCompare(b.category));
      } else if (sortBy === "categoryDesc") {
          expenses.sort((a, b) => b.category.localeCompare(a.category));
      }

      saveExpenses();
      updateExpenseList();
  });

  document
      .getElementById("open-overview")
      .addEventListener("click", function () {
          window.location.href = "expense.html";
      });
});