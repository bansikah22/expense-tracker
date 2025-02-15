let transactions = [
    { id: 1, type: 'income', description: 'Salary', amount: 2000, date: '2023-01-15' },
    { id: 2, type: 'expense', description: 'Groceries', amount: 150, date: '2023-01-20' },
    { id: 3, type: 'expense', description: 'Utilities', amount: 100, date: '2023-01-25' },
    { id: 4, type: 'income', description: 'Freelance', amount: 500, date: '2023-02-10' },
    { id: 5, type: 'expense', description: 'Rent', amount: 800, date: '2023-02-15' },
];

// Get DOM elements
const transactionForm = document.getElementById('transaction-form');
const transactionsList = document.getElementById('transactions');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('total-income');
const expensesEl = document.getElementById('total-expenses');
const monthFilter = document.getElementById('month-filter');

// Event listener for form submission
transactionForm.addEventListener('submit', addTransaction);

// Add event listener for month filter change
monthFilter.addEventListener('change', filterTransactions);

// Function to add a transaction
function addTransaction(e) {
    e.preventDefault();

    const type = document.getElementById('transaction-type').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('transaction-date').value;

    console.log('Adding Transaction:', { type, description, amount, date }); // Debugging line

    if (description.trim() === '' || isNaN(amount) || date === '') {
        alert('Please enter valid transaction details');
        return;
    }

    const transaction = {
        id: Date.now(),
        type,
        description,
        amount,
        date
    };

    transactions.push(transaction);
    renderTransactions();
    updateSummary(); // Update the summary after adding a transaction
    transactionForm.reset();

    console.log('Current Transactions:', transactions); // Debugging line
}

// Function to render transactions
function renderTransactions(transactionsToRender = transactions) {
    transactionsList.innerHTML = '';
    transactionsToRender.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.description} - ${transaction.type === 'income' ? '+' : '-'} ${transaction.amount} on ${transaction.date}`;

        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'transaction-button';
        editButton.onclick = () => editTransaction(transaction.id);
        li.appendChild(editButton);

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'transaction-button';
        deleteButton.onclick = () => deleteTransaction(transaction.id);
        li.appendChild(deleteButton);

        transactionsList.appendChild(li);
    });
}

// Function to update financial summary
function updateSummary() {
    let balance = 0;
    let income = 0;
    let expenses = 0;

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    balance = income - expenses;

    balanceEl.textContent = formatCurrency(balance);
    incomeEl.textContent = formatCurrency(income);
    expensesEl.textContent = formatCurrency(expenses);

    // Calculate and display recommended savings (20% of income)
    const recommendedSavings = income * 0.20; // 20% of income
    document.getElementById('recommended-savings').textContent = formatCurrency(recommendedSavings);

    // Render the chart
    renderChart();
}

// Function to render the expense chart
function renderChart(filteredTransactions = transactions) {
    let totalIncome = 0;
    let totalExpenses = 0;

    filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpenses += transaction.amount;
        }
    });

    const savings = totalIncome * 0.20; // Assuming savings is 20% of total income

    // Prepare data for the pie chart
    const chartData = {
        labels: ['Income', 'Expenses', 'Savings'],
        datasets: [{
            data: [totalIncome, totalExpenses, savings],
            backgroundColor: [
                '#4caf50', // Green for income
                '#f44336', // Red for expenses
                '#ffeb3b'  // Yellow for savings
            ]
        }]
    };

    // Create the pie chart
    const ctx = document.getElementById('expense-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'Financial Overview for Selected Month'
            }
        }
    });
}

// Function to calculate savings
function calculateSavings(e) {
    e.preventDefault();
    const savingsPercentage = parseFloat(document.getElementById('savings-percentage').value);
    
    if (isNaN(savingsPercentage) || savingsPercentage < 0 || savingsPercentage > 100) {
        alert('Please enter a valid savings percentage (0-100)');
        return;
    }

    const recommendedSavings = income * (savingsPercentage / 100);
    savingsResult.textContent = `Based on your income, you should save ${formatCurrency(recommendedSavings)} before spending.`;
}

// Function to display a random tip
function displayRandomTip() {
    const defaultTips = [
        "Cook meals at home to save money on eating out.",
        "Use public transportation or carpool to reduce transportation costs.",
        "Cancel unused subscriptions and memberships.",
        "Shop with a list to avoid impulse purchases.",
        "Use energy-efficient appliances to reduce utility bills."
    ];

    const allTips = [...defaultTips, ...customTips];
    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
    tipContainer.textContent = randomTip;
}

// Function to add a custom tip
function addCustomTip(e) {
    e.preventDefault();
    const customTip = document.getElementById('custom-tip').value.trim();
    if (customTip) {
        customTips.push(customTip);
        localStorage.setItem('customTips', JSON.stringify(customTips));
        displayRandomTip();
        document.getElementById('custom-tip').value = '';
    }
}

// Function to filter transactions by month
function filterTransactions() {
    const selectedMonth = monthFilter.value;
    console.log('Selected Month:', selectedMonth); // Debugging line
    let filteredTransactions = transactions;

    if (selectedMonth) {
        // Get the year and month from the selected value
        const [year, month] = selectedMonth.split('-');
        filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() == year && (transactionDate.getMonth() + 1) == month; // Month is 0-indexed
        });
        console.log('Filtered Transactions:', filteredTransactions); // Debugging line
    }

    renderTransactions(filteredTransactions);
    updateChart(filteredTransactions); // Update the chart with filtered transactions
}

// Function to update the pie chart
function updateChart(transactionsToRender) {
    const income = transactionsToRender
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + t.amount, 0);
    const expenses = transactionsToRender
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + t.amount, 0);

    const chartData = {
        labels: ['Income', 'Expenses'],
        datasets: [{
            data: [income, expenses],
            backgroundColor: ['#4caf50', '#f44336'],
        }]
    };

    const ctx = document.getElementById('expense-chart').getContext('2d');
    if (window.expenseChart) {
        window.expenseChart.destroy(); // Destroy the previous chart instance
    }
    window.expenseChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// Function to update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CFA' }).format(amount);
}

// Function to edit a transaction
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        document.getElementById('transaction-type').value = transaction.type;
        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.getElementById('transaction-date').value = transaction.date;

        // Remove the transaction from the list for editing
        transactions = transactions.filter(t => t.id !== id);
        updateLocalStorage();
        updateSummary();
        renderTransactions();
    }
}

// Function to delete a transaction
function deleteTransaction(id) {
    // Filter out the transaction with the given id
    transactions = transactions.filter(t => t.id !== id);
    
    // Update local storage
    updateLocalStorage();
    
    // Re-render the transactions list
    renderTransactions();
    
    // Update the summary
    updateSummary();
}

function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
        renderTransactions();
        updateSummary();
        updateChart(transactions); // Initialize the chart with all transactions
    }
}

// Call this function on initial load
loadTransactions();
