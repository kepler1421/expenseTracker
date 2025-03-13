// expense-overview.js
function goBackToMain() {
  window.location.href = '/index.html';
}

// Function to fetch expense data from local storage
function fetchExpenseData() {
  const expenseData = localStorage.getItem('expenses');

  // If expense data exists, parse it into an array
  if (expenseData) {
    return JSON.parse(expenseData);
  } else {
    return [];
  }
}

// Fetch the expense data
const expenses = fetchExpenseData();

function calculateTotalExpensesPerMonth(expenses) {
  // Create an array to store the total expenses per month (for all 12 months)
  const totalExpensesPerMonth = Array(12).fill(0);

  // Loop through each expense
  expenses.forEach((expense) => {
    const month = new Date(expense.date).getMonth();
    
    totalExpensesPerMonth[month] += parseFloat(expense.amount);
  });

  return totalExpensesPerMonth;
}

const totalExpensesPerMonth = calculateTotalExpensesPerMonth(expenses);

function calculateTotalExpenses(expenses) {
  return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
}

const totalExpenses = calculateTotalExpenses(expenses);

function calculateAverageExpense(expenses) {
  if (expenses.length === 0) return 0;
  
  const totalExpenses = calculateTotalExpenses(expenses);

  return totalExpenses / expenses.length;
}

const averageExpense = calculateAverageExpense(expenses);

// Function to calculate the highest expense
function calculateHighestExpense(expenses) {
  if (expenses.length === 0) return 0;
  
  // Use the Math.max function with the spread operator to find the highest expense
  return Math.max(...expenses.map((expense) => parseFloat(expense.amount)));
}

const highestExpense = calculateHighestExpense(expenses);

const totalExpenseElement = document.getElementById('total-expenses-overview');
totalExpenseElement.textContent = `Total Expense: $${totalExpenses.toFixed(2).toLocaleString()}`;

const averageExpenseElement = document.getElementById('average-expense');
averageExpenseElement.textContent = `Average Expense: $${averageExpense.toFixed(2).toLocaleString()}`;

const highestExpenseElement = document.getElementById('highest-expense');
highestExpenseElement.textContent = `Highest Expense: $${highestExpense.toFixed(2).toLocaleString()}`;

const monthlyExpenseChartCanvas = document.getElementById('monthlyExpenseChart');
const monthlyExpenseChartCtx = monthlyExpenseChartCanvas.getContext('2d');

const monthlyExpenseData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [{
    label: 'Monthly Expenses',
    data: totalExpensesPerMonth,
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ],
    borderWidth: 1
  }]
};

const monthlyExpenseChart = new Chart(monthlyExpenseChartCtx, {
  type: 'bar',
  data: monthlyExpenseData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});