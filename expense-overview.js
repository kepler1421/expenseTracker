// expense-overview.js
function goBackToMain() {
    window.location.href = '/index.html';
  }

// Function to fetch expense data from local storage
function fetchExpenseData() {
  // Get the expense data from local storage
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

// Function to calculate total expenses per month
function calculateTotalExpensesPerMonth(expenses) {
  // Create an object to store the total expenses per month
  const totalExpensesPerMonth = {};

  // Loop through each expense
  expenses.forEach((expense) => {
    // Get the month from the expense date
    const month = new Date(expense.date).getMonth();

    // If the month is not already in the object, add it
    if (!totalExpensesPerMonth[month]) {
      totalExpensesPerMonth[month] = 0;
    }

    // Add the expense amount to the total for the month
    totalExpensesPerMonth[month] += expense.amount;
  });

  // Return the total expenses per month
  return totalExpensesPerMonth;
}

// Calculate the total expenses per month
const totalExpensesPerMonth = calculateTotalExpensesPerMonth(expenses);

// Function to calculate the total expenses
function calculateTotalExpenses(expenses) {
  // Use the reduce method to sum up all the expense amounts
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

// Calculate the total expenses
const totalExpenses = calculateTotalExpenses(expenses);

// Function to calculate the average expense
function calculateAverageExpense(expenses) {
  // Calculate the total expenses
  const totalExpenses = calculateTotalExpenses(expenses);

  // Calculate the average expense
  return totalExpenses / expenses.length;
}

// Calculate the average expense
const averageExpense = calculateAverageExpense(expenses);

// Function to calculate the highest expense
function calculateHighestExpense(expenses) {
  // Use the Math.max function with the spread operator to find the highest expense
  return Math.max(...expenses.map((expense) => expense.amount));
}

// Calculate the highest expense
const highestExpense = calculateHighestExpense(expenses);

// Display the total expenses
// Display the total expenses
const totalExpenseElement = document.getElementById('total-expenses-overview');
totalExpenseElement.textContent = `Total Expense: $${totalExpenses.toLocaleString()}`;


// Display the average expense
const averageExpenseElement = document.getElementById('average-expense');
averageExpenseElement.textContent = `Average Expense: $${averageExpense.toLocaleString()}`;

// Display the highest expense
const highestExpenseElement = document.getElementById('highest-expense');
highestExpenseElement.textContent = `Highest Expense: $${highestExpense.toLocaleString()}`;

// Display the total expenses per month
const monthlyExpenseChartCanvas = document.getElementById('monthlyExpenseChart');
const monthlyExpenseChartCtx = monthlyExpenseChartCanvas.getContext('2d');

const monthlyExpenseData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [{
    label: 'Monthly Expenses',
    data: Object.values(totalExpensesPerMonth),
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
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