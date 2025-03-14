
// Initialize variables for data management
let expenses = [];
let currentPage = 1;
const expensesPerPage = 5;
let monthlyBudget = 0;

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load saved expenses
  if (localStorage.getItem('expenses')) {
    expenses = JSON.parse(localStorage.getItem('expenses'));
  }


  
  initializeDateFilters();
  
  displayExpenses();
  updateOverviewData();
  
 
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
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm) || (expense.notes && expense.notes.toLowerCase().includes(searchTerm));
    
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

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;

    const editExpenseModal = new bootstrap.Modal(document.getElementById("editExpenseModal"));


    document.getElementById("edit-expense-id").value = expense.id;
    document.getElementById("edit-expense-name-modal").value = expense.name;
    document.getElementById("edit-expense-amount-modal").value = expense.amount;
    document.getElementById("edit-expense-date-modal").value = expense.date;

    editExpenseModal.show();
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

// Update expense details
function updateExpenseDetails() {
  const expenseId = parseInt(document.getElementById('edit-expense-id').value);
  const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
  
  if (expenseIndex === -1) return;

  nameInput= document.getElementById("edit-expense-name-modal").value 
   amountInput= document.getElementById("edit-expense-amount-modal").value  
   dateInput = document.getElementById("edit-expense-date-modal").value  
   categoryInput = document.getElementById("edit-expense-category-modal").value 
  
  // Validate inputs
//   if (!nameInput.value || !amountInput.value || !categoryInput.value || !dateInput.value) {
//     alert('Please fill in all required fields');
//     return;
//   }
  
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
  
}

// Add event listeners for form controls
document.getElementById('search-expenses').addEventListener('input', displayExpenses);
document.getElementById('filter-category').addEventListener('change', displayExpenses);
document.getElementById('sort-by').addEventListener('change', displayExpenses);
document.getElementById('date-from').addEventListener('change', displayExpenses);
document.getElementById('date-to').addEventListener('change', displayExpenses);

// Toggle between expenses and overview panels
document.getElementById('overview-btn').addEventListener('click', function() {
  document.getElementById('expenses-panel').style.display = 'none';
  document.getElementById('overview-panel').style.display = 'block';
  document.getElementById('expenses-btn').classList.remove('active');
  document.getElementById('overview-btn').classList.add('active');

  document.getElementById('expenses-btn').addEventListener('click', function() {
  document.getElementById('expenses-panel').style.display = 'block';
  document.getElementById('overview-panel').style.display = 'none';
  document.getElementById('expenses-btn').classList.add('active');
  document.getElementById('overview-btn').classList.remove('active');
});
  
  // Update charts when switching to overview
  updateOverviewData();
});

