// expense-overview.js
function goBackToMain() {
    window.location.href = '/index.html';
  }

  
// Define the chart data 
const monthlyExpenseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Expenses',
      data: [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000,1000000,1100000,1200000],
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
  
  const categoryExpenseData = {
    labels: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment'],
    datasets: [{
      label: 'Expenses by Category',
      data: [100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1
    }]
  };

  
  
  // Get the chart canvas elements
  const monthlyExpenseChartCanvas = document.getElementById('monthlyExpenseChart');
  const categoryExpenseChartCanvas = document.getElementById('categoryExpenseChart');
  
  // Create chart contexts
  const monthlyExpenseChartCtx = monthlyExpenseChartCanvas.getContext('2d');
  const categoryExpenseChartCtx = categoryExpenseChartCanvas.getContext('2d');
  
  // Create the charts
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
  
  const categoryExpenseChart = new Chart(categoryExpenseChartCtx, {
    type: 'bar',
    data: categoryExpenseData,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  }); 
  
  // Calculate and display expense statistics
  const totalExpenses = monthlyExpenseData.datasets[0].data.reduce((a, b) => a + b, 0);
  const averageExpense = totalExpenses / monthlyExpenseData.datasets[0].data.length;
  const highestExpense = Math.max(...monthlyExpenseData.datasets[0].data);

// Display the total expense
const totalExpenseElement = document.getElementById('total-expenses-overview');
  if (totalExpenseElement) {
    totalExpenseElement.textContent = formatCurrency(totalExpenses);
  }

// Display the average expense
const averageExpenseElement = document.getElementById('average-expense');
averageExpenseElement.textContent = `Average Expense: ${averageExpense.toLocaleString()}`;

// Display the highest expense
const highestExpenseElement = document.getElementById('highest-expense');
highestExpenseElement.textContent = `Highest Expense: ${highestExpense.toLocaleString()}`;