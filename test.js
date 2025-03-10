
// Initialize variables for data management
let expenses = [];
let currentPage = 1;
const expensesPerPage = 10;
let monthlyBudget = 0;

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load saved expenses
  if (localStorage.getItem('expenses')) {
    expenses = JSON.parse(localStorage.getItem('expenses'));
  }
  
  // Load saved monthly budget
  if (localStorage.getItem('monthlyBudget')) {
    monthlyBudget = parseFloat(localStorage.getItem('monthlyBudget'));
  }
  
  // Initialize date fields with current month range
  initializeDateFilters();
  
  // Display expenses and update UI
  displayExpenses();
  updateOverviewData();
  
  // Show budget setting prompt if not set
  if (monthlyBudget === 0) {
    promptForBudget();
  } else {
    updateBudgetDisplay();
  }
});

// Initialize date filters with current month
function initializeDateFilters() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  document.getElementById('date-from').valueAsDate = firstDayOfMonth;
  document.getElementById('date-to').valueAsDate = lastDayOfMonth;
  
  // Initialize the date field for new expenses with today's date
  document.getElementById('edit-expense-date').valueAsDate = now;
}

// Prompt user to set monthly budget
function promptForBudget() {
  const budgetAmount = prompt("Please set your monthly budget:", "0");
  if (budgetAmount !== null) {
    monthlyBudget = parseFloat(budgetAmount) || 0;
    localStorage.setItem('monthlyBudget', monthlyBudget);
    updateBudgetDisplay();
  }
}

// Update budget display
function updateBudgetDisplay() {
  // Add a budget display element if it doesn't exist
  if (!document.getElementById('budget-display')) {
    const budgetDisplay = document.createElement('div');
    budgetDisplay.id = 'budget-display';
    budgetDisplay.className = 'card bg-light mb-3';
    budgetDisplay.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        Monthly Budget
        <button class="btn btn-sm btn-outline-primary" id="edit-budget-btn">Edit</button>
      </div>
      <div class="card-body">
        <h5 class="card-title" id="budget-amount">$${monthlyBudget.toFixed(2)}</h5>
        <div class="progress">
          <div id="budget-progress" class="progress-bar" role="progressbar" style="width: 0%"></div>
        </div>
      </div>
    `;
    
    // Insert at the top of the summary row
    const summaryRow = document.querySelector('.summary-row');
    if (summaryRow) {
      summaryRow.prepend(budgetDisplay);
    }
    
    // Add event listener to edit budget button
    document.getElementById('edit-budget-btn').addEventListener('click', promptForBudget);
  } else {
    document.getElementById('budget-amount').textContent = `$${monthlyBudget.toFixed(2)}`;
  }
  
  // Update budget progress
  updateBudgetProgress();
}

// Update budget progress bar
function updateBudgetProgress() {
  if (monthlyBudget > 0) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate total for current month
    const monthlyTotal = expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
        return total + expense.amount;
      }
      return total;
    }, 0);
    
    // Update progress bar
    const progressBar = document.getElementById('budget-progress');
    if (progressBar) {
      const percentage = Math.min((monthlyTotal / monthlyBudget) * 100, 100);
      progressBar.style.width = `${percentage}%`;
      
      // Change color based on budget usage
      if (percentage < 70) {
        progressBar.className = 'progress-bar bg-success';
      } else if (percentage < 90) {
        progressBar.className = 'progress-bar bg-warning';
      } else {
        progressBar.className = 'progress-bar bg-danger';
      }
    }
  }
}

// Save expense to localStorage
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Add new expense
document.getElementById('saveExpense').addEventListener('click', function() {
  const nameInput = document.getElementById('expense-name');
  const amountInput = document.getElementById('expense-amount');
  const categoryInput = document.getElementById('expense-category');
  const notesInput = document.getElementById('expense-notes');
  const dateInput = document.getElementById('edit-expense-date');
  
  // Validate inputs
  if (!nameInput.value || !amountInput.value || !categoryInput.value || !dateInput.value) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Get form data
  const newExpense = {
    id: Date.now(), // Unique ID using timestamp
    name: nameInput.value,
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    notes: notesInput.value,
    date: dateInput.value
  };
  
  // Add to expenses array
  expenses.push(newExpense);
  
  // Save to localStorage
  saveExpenses();
  
  // Reset form and close modal
  document.getElementById('expenseForm').reset();
  $('#addExpenseModal').modal('hide');
  
  // Update UI
  displayExpenses();
  updateOverviewData();
  updateBudgetProgress();
});

// Display expenses with pagination
function displayExpenses() {
  const expenseTable = document.getElementById('expenseTable');
  const noExpenses = document.getElementById('no-expenses');
  const expensesTable = document.getElementById('expenses-table');
  
  // Get filter values
  const searchTerm = document.getElementById('search-expenses').value.toLowerCase();
  const categoryFilter = document.getElementById('filter-category').value;
  const sortBy = document.getElementById('sort-by').value;
  const dateFrom = document.getElementById('date-from').value;
  const dateTo = document.getElementById('date-to').value;
  
  // Filter expenses
  let filteredExpenses = expenses.filter(expense => {
    // Name or notes contains search term
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm) || 
                          (expense.notes && expense.notes.toLowerCase().includes(searchTerm));
    
    // Category filter
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    // Date range filter
    const expenseDate = new Date(expense.date);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    const matchesDateRange = (!fromDate || expenseDate >= fromDate) && 
                             (!toDate || expenseDate <= toDate);
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });
  
  // Sort expenses
  filteredExpenses.sort((a, b) => {
    switch(sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'category-asc':
        return a.category.localeCompare(b.category);
      case 'category-desc':
        return b.category.localeCompare(a.category);
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });
  
  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  const startIndex = (currentPage - 1) * expensesPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, startIndex + expensesPerPage);
  
  // Check if there are expenses to show
  if (filteredExpenses.length === 0) {
    noExpenses.style.display = 'block';
    expensesTable.style.display = 'none';
  } else {
    noExpenses.style.display = 'none';
    expensesTable.style.display = 'table';
    
    // Clear table
    expenseTable.innerHTML = '';
    
    // Add expense rows
    paginatedExpenses.forEach(expense => {
      const row = document.createElement('tr');
      
      // Format date
      const expenseDate = new Date(expense.date);
      const formattedDate = expenseDate.toLocaleDateString();
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${expense.name}</td>
        <td>
          <span class="badge badge-pill badge-${getCategoryBadgeColor(expense.category)}">
            ${expense.category}
          </span>
        </td>
        <td class="text-right">$${expense.amount.toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary edit-expense" data-id="${expense.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${expense.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      expenseTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    addExpenseEventListeners();
    
    // Create pagination controls
    createPaginationControls(totalPages);
  }
}

// Get category badge color
function getCategoryBadgeColor(category) {
  const categoryColors = {
    'Food': 'info',
    'Transportation': 'warning',
    'Housing': 'primary',
    'Utilities': 'secondary',
    'Entertainment': 'success',
    'Healthcare': 'danger',
    'Other': 'dark'
  };
  
  return categoryColors[category] || 'light';
}

// Create pagination controls
function createPaginationControls(totalPages) {
  // Remove existing pagination
  const oldPagination = document.querySelector('.pagination-container');
  if (oldPagination) {
    oldPagination.remove();
  }
  
  if (totalPages <= 1) {
    return;
  }
  
  // Create pagination container
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'pagination-container d-flex justify-content-center mt-3';
  
  const pagination = document.createElement('ul');
  pagination.className = 'pagination';
  
  // Previous button
  const prevItem = document.createElement('li');
  prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
  pagination.appendChild(prevItem);
  
  // Page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement('li');
    pageItem.className = `page-item ${currentPage === i ? 'active' : ''}`;
    pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
    pagination.appendChild(pageItem);
  }
  
  // Next button
  const nextItem = document.createElement('li');
  nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextItem.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>`;
  pagination.appendChild(nextItem);
  
  paginationContainer.appendChild(pagination);
  
  // Add pagination to the expenses list
  document.querySelector('.expenses-list').appendChild(paginationContainer);
  
  // Add event listeners to pagination links
  const pageLinks = paginationContainer.querySelectorAll('.page-link');
  pageLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      if (!this.parentElement.classList.contains('disabled')) {
        currentPage = parseInt(this.dataset.page);
        displayExpenses();
      }
    });
  });
}

// Add event listeners to expense rows
function addExpenseEventListeners() {
  // Edit buttons
  document.querySelectorAll('.edit-expense').forEach(button => {
    button.addEventListener('click', function() {
      const expenseId = parseInt(this.dataset.id);
      editExpense(expenseId);
    });
  });
  
  // Delete buttons
  document.querySelectorAll('.delete-expense').forEach(button => {
    button.addEventListener('click', function() {
      const expenseId = parseInt(this.dataset.id);
      deleteExpense(expenseId);
    });
  });
}

// Edit expense
function editExpense(expenseId) {
  // Find expense
  const expense = expenses.find(exp => exp.id === expenseId);
  if (!expense) return;
  
  // Create edit modal if it doesn't exist
  if (!document.getElementById('editExpenseModal')) {
    const modalHTML = `
      <div class="modal fade" id="editExpenseModal" tabindex="-1" role="dialog" aria-labelledby="editExpenseModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="editExpenseModalLabel">Edit Expense</h5>
              <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form id="editExpenseForm">
                <input type="hidden" id="edit-expense-id">
                <div class="form-group">
                  <label for="edit-expense-name">Expense Name</label>
                  <input type="text" class="form-control" id="edit-expense-name" required>
                </div>
                <div class="form-group">
                  <label for="edit-expense-amount">Amount ($)</label>
                  <input type="number" step="0.01" class="form-control" id="edit-expense-amount" required>
                </div>
                <div class="form-group">
                  <label for="edit-expense-date-modal">Date</label>
                  <input type="date" class="form-control" id="edit-expense-date-modal" required>
                </div>
                <div class="form-group">
                  <label for="edit-expense-category">Category</label>
                  <select class="form-control" id="edit-expense-category" required>
                    <option value="">Select a category</option>
                    <option>Food</option>
                    <option>Transportation</option>
                    <option>Housing</option>
                    <option>Utilities</option>
                    <option>Entertainment</option>
                    <option>Healthcare</option>
                    <option>Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="edit-expense-notes">Notes (Optional)</label>
                  <textarea class="form-control" id="edit-expense-notes" rows="2"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="updateExpense">Update Expense</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listener to update button
    document.getElementById('updateExpense').addEventListener('click', function() {
      updateExpenseDetails();
    });
  }
  
  // Fill form with expense details
  document.getElementById('edit-expense-id').value = expense.id;
  document.getElementById('edit-expense-name').value = expense.name;
  document.getElementById('edit-expense-amount').value = expense.amount;
  document.getElementById('edit-expense-date-modal').value = expense.date;
  document.getElementById('edit-expense-category').value = expense.category;
  document.getElementById('edit-expense-notes').value = expense.notes || '';
  
  // Show modal
  $('#editExpenseModal').modal('show');
}

// Update expense details
function updateExpenseDetails() {
  const expenseId = parseInt(document.getElementById('edit-expense-id').value);
  const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
  
  if (expenseIndex === -1) return;
  
  // Get form data
  const nameInput = document.getElementById('edit-expense-name');
  const amountInput = document.getElementById('edit-expense-amount');
  const dateInput = document.getElementById('edit-expense-date-modal');
  const categoryInput = document.getElementById('edit-expense-category');
  const notesInput = document.getElementById('edit-expense-notes');
  
  // Validate inputs
  if (!nameInput.value || !amountInput.value || !categoryInput.value || !dateInput.value) {
    alert('Please fill in all required fields');
    return;
  }
  
  // Update expense
  expenses[expenseIndex] = {
    id: expenseId,
    name: nameInput.value,
    amount: parseFloat(amountInput.value),
    date: dateInput.value,
    category: categoryInput.value,
    notes: notesInput.value
  };
  
  // Save to localStorage
  saveExpenses();
  
  // Close modal
  $('#editExpenseModal').modal('hide');
  
  // Update UI
  displayExpenses();
  updateOverviewData();
  updateBudgetProgress();
}

// Delete expense
function deleteExpense(expenseId) {
  if (confirm('Are you sure you want to delete this expense?')) {
    // Remove expense from array
    expenses = expenses.filter(exp => exp.id !== expenseId);
    
    // Save to localStorage
    saveExpenses();
    
    // Update UI
    displayExpenses();
    updateOverviewData();
    updateBudgetProgress();
  }
}

// Update overview data and charts
function updateOverviewData() {
  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
  
  // Calculate this month's expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthExpenses = expenses.reduce((total, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      return total + expense.amount;
    }
    return total;
  }, 0);
  
  document.getElementById('month-expenses').textContent = `$${monthExpenses.toFixed(2)}`;
  
  // Calculate average monthly expenses
  const monthsWithExpenses = new Set();
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthYear = `${expenseDate.getMonth()}-${expenseDate.getFullYear()}`;
    monthsWithExpenses.add(monthYear);
  });
  
  const averageExpenses = monthsWithExpenses.size > 0 ? totalExpenses / monthsWithExpenses.size : 0;
  document.getElementById('average-expenses').textContent = `$${averageExpenses.toFixed(2)}`;
  
  // Update charts
  updateMonthlyChart();
  updateCategoryChart();
}

// Update monthly expense chart
function updateMonthlyChart() {
  // Group expenses by month
  const monthlyData = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthYear = `${monthNames[expenseDate.getMonth()]} ${expenseDate.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    
    monthlyData[monthYear] += expense.amount;
  });
  
  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.split(' ');
    const [bMonth, bYear] = b.split(' ');
    
    if (aYear !== bYear) {
      return parseInt(aYear) - parseInt(bYear);
    }
    
    return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
  });
  
  // Prepare chart data
  const labels = sortedMonths;
  const data = sortedMonths.map(month => monthlyData[month]);
  
  // Create or update chart
  const ctx = document.getElementById('expenseChart').getContext('2d');
  
  if (window.monthlyChart) {
    window.monthlyChart.data.labels = labels;
    window.monthlyChart.data.datasets[0].data = data;
    window.monthlyChart.update();
  } else {
    window.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Expenses',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.raw.toFixed(2);
              }
            }
          }
        }
      }
    });
  }
  
  // Update highest and lowest spending months
  if (sortedMonths.length > 0) {
    let highestMonth = sortedMonths[0];
    let lowestMonth = sortedMonths[0];
    
    sortedMonths.forEach(month => {
      if (monthlyData[month] > monthlyData[highestMonth]) {
        highestMonth = month;
      }
      if (monthlyData[month] < monthlyData[lowestMonth]) {
        lowestMonth = month;
      }
    });
    
    document.getElementById('highest-month').textContent = `${highestMonth} ($${monthlyData[highestMonth].toFixed(2)})`;
    document.getElementById('lowest-month').textContent = `${lowestMonth} ($${monthlyData[lowestMonth].toFixed(2)})`;
  }
}

// Update category chart
function updateCategoryChart() {
  // Group expenses by category
  const categoryData = {};
  
  expenses.forEach(expense => {
    if (!categoryData[expense.category]) {
      categoryData[expense.category] = 0;
    }
    
    categoryData[expense.category] += expense.amount;
  });
  
  // Prepare chart data
  const labels = Object.keys(categoryData);
  const data = labels.map(category => categoryData[category]);
  
  // Category colors
  const categoryColors = {
    'Food': 'rgba(54, 162, 235, 0.8)',
    'Transportation': 'rgba(255, 206, 86, 0.8)',
    'Housing': 'rgba(75, 192, 192, 0.8)',
    'Utilities': 'rgba(153, 102, 255, 0.8)',
    'Entertainment': 'rgba(255, 159, 64, 0.8)',
    'Healthcare': 'rgba(255, 99, 132, 0.8)',
    'Other': 'rgba(201, 203, 207, 0.8)'
  };
  
  const backgroundColors = labels.map(category => categoryColors[category] || 'rgba(201, 203, 207, 0.8)');
  
  // Create or update chart
  const ctx = document.getElementById('categoryChart').getContext('2d');
  
  if (window.categoryChart) {
    window.categoryChart.data.labels = labels;
    window.categoryChart.data.datasets[0].data = data;
    window.categoryChart.data.datasets[0].backgroundColor = backgroundColors;
    window.categoryChart.update();
  } else {
    window.categoryChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Expenses by Category',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `$${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// Add event listeners for form controls
document.getElementById('search-expenses').addEventListener('input', displayExpenses);
document.getElementById('filter-category').addEventListener('change', displayExpenses);
document.getElementById('sort-by').addEventListener('change', displayExpenses);
document.getElementById('date-from').addEventListener('change', displayExpenses);
document.getElementById('date-to').addEventListener('change', displayExpenses);

// Toggle between expenses and overview panels
document.getElementById('expenses-btn').addEventListener('click', function() {
  document.getElementById('expenses-panel').style.display = 'block';
  document.getElementById('overview-panel').style.display = 'none';
  document.getElementById('expenses-btn').classList.add('active');
  document.getElementById('overview-btn').classList.remove('active');
});

document.getElementById('overview-btn').addEventListener('click', function() {
  document.getElementById('expenses-panel').style.display = 'none';
  document.getElementById('overview-panel').style.display = 'block';
  document.getElementById('expenses-btn').classList.remove('active');
  document.getElementById('overview-btn').classList.add('active');
  
  // Update charts when switching to overview
  updateOverviewData();
});