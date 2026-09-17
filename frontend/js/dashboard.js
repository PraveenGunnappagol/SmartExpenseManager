const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));
if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}
let spendingTrendChart = null;

async function testBackendConnection() {
    try {
        const data = await apiGet("/health");
        console.log("Backend response:", data);
    } catch (error) {
        console.error("Could not connect to the C++ backend.");
    }
}

async function loadDashboardSummary() {
    try {
        const summary = await apiGet(
            `/analytics/summary/${CURRENT_USER_ID}`
        );

        console.log("Dashboard summary:", summary);

        document.getElementById("total-income").textContent =
            formatCurrency(summary.totalIncome);

        document.getElementById("total-expenses").textContent =
            formatCurrency(summary.totalExpenses);

        document.getElementById("total-balance").textContent =
            formatCurrency(summary.balance);
        document.getElementById("sidebar-income").textContent =
    formatCurrency(summary.totalIncome);

document.getElementById("sidebar-expenses").textContent =
    formatCurrency(summary.totalExpenses);

document.getElementById("sidebar-balance").textContent =
    formatCurrency(summary.balance);
        document.getElementById("chart-total-expenses").textContent =
            formatCurrency(summary.totalExpenses);

    } catch (error) {
        console.error("Could not load dashboard summary:", error);
    }
}

async function loadMonthlyComparison() {
    try {
        const comparison = await apiGet(
            `/analytics/monthly-comparison/${CURRENT_USER_ID}`
        );

        console.log("Monthly comparison:", comparison);
        const savingsRateElement =
    document.getElementById("savings-rate");

if (savingsRateElement) {
    savingsRateElement.textContent =
        `${Number(comparison.currentSavingsRate).toFixed(2)}%`;
}
        const calculateChange = (current, previous) => {
            if (previous === 0) {
                return null;
            }

            return ((current - previous) / previous) * 100;
        };

        const incomeChange = calculateChange(
            Number(comparison.currentIncome),
            Number(comparison.previousIncome)
        );

        const expenseChange = calculateChange(
            Number(comparison.currentExpenses),
            Number(comparison.previousExpenses)
        );

        const balanceChange = calculateChange(
            Number(comparison.currentBalance),
            Number(comparison.previousBalance)
        );

        const savingsRateChange = calculateChange(
            Number(comparison.currentSavingsRate),
            Number(comparison.previousSavingsRate)
        );

        updatePercentage("income-change", incomeChange);
        updatePercentage("expense-change", expenseChange);
        updatePercentage("balance-change", balanceChange);
        updatePercentage("savings-rate-change", savingsRateChange);

    } catch (error) {
        console.error(
            "Could not load monthly comparison:",
            error
        );
    }
}
function updatePercentage(elementId, value) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    if (value === null || !Number.isFinite(value)) {
        element.textContent = "—";
        return;
    }

    const sign = value > 0 ? "+" : "";

    element.textContent =
        `${sign}${value.toFixed(1)}% from last month`;
}
async function loadCategorySpending() {
    try {
        const categories = await apiGet(
            `/analytics/categories/${CURRENT_USER_ID}`
        );

        console.log("Category spending:", categories);

        renderExpensePieChart(categories);

    } catch (error) {
        console.error("Could not load category spending:", error);
    }
}
async function loadRecentTransactions() {
    try {
        const [transactions, categories] = await Promise.all([
            apiGet(`/transactions/${CURRENT_USER_ID}`),
            apiGet(`/categories`)
        ]);

        console.log("Recent transactions:", transactions);
        console.log("Categories for transactions:", categories);

        renderRecentTransactions(
    transactions.transactions || [],
    categories
);

    } catch (error) {
        console.error("Could not load recent transactions:", error);
    }
}

function renderRecentTransactions(transactions, categories) {
    const tableBody = document.getElementById("transactions-body");

    if (!tableBody) {
        return;
    }

    const categoryMap = new Map(
        categories.map(category => [
            category.id,
            category.name
        ])
    );

    tableBody.innerHTML = transactions
        .slice(0, 5)
        .map(transaction => {
            const isIncome = transaction.type === "income";

            const categoryName =
                categoryMap.get(transaction.categoryId) || "Other";

            return `
                <tr>
                    <td>
                        ${formatTransactionDate(transaction.transactionDate)}
                    </td>

                    <td>
                        <span class="transaction-type ${isIncome ? "income" : "expense"}">
                            ${isIncome ? "↑" : "↓"}
                        </span>
                    </td>

                    <td>
                        <span class="category-icon ${categoryName.toLowerCase()}">
                            ${getCategoryIcon(categoryName)}
                        </span>
                        ${categoryName}
                    </td>

                    <td>
                        ${transaction.description || "—"}
                    </td>

                    <td class="${isIncome ? "amount-income" : "amount-expense"}">
                        ${formatCurrency(transaction.amount)}
                    </td>

                    <td>
                        —
                    </td>
                </tr>
            `;
        })
        .join("");
}

function formatTransactionDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getCategoryIcon(categoryName) {
    const icons = {
        Food: "🍴",
        Transport: "🚗",
        Shopping: "🛍",
        Entertainment: "🎬",
        Bills: "▤",
        Health: "⚕",
        Education: "📚",
        Other: "•"
    };

    return icons[categoryName] || "•";
}

function renderExpensePieChart(categories) {
    const chart = document.getElementById("expense-pie-chart");
    const legend = document.getElementById("expense-legend");

    if (!chart || !legend) {
        return;
    }

    if (categories.length === 0) {
        chart.style.background = "none";
        legend.innerHTML = "<p>No expense data available.</p>";
        return;
    }

    const total = categories.reduce(
        (sum, category) => sum + Number(category.totalAmount),
        0
    );

    let currentPercentage = 0;

    const segments = categories.map((category) => {
        const percentage =
            (Number(category.totalAmount) / total) * 100;

        const start = currentPercentage;
        const end = currentPercentage + percentage;

        currentPercentage = end;

        return `${getCategoryColor(category.categoryName)} ${start}% ${end}%`;
    });

    chart.style.background = `
        conic-gradient(
            ${segments.join(", ")}
        )
    `;

    legend.innerHTML = categories.map((category) => {
        const amount = Number(category.totalAmount);
        const percentage = ((amount / total) * 100).toFixed(1);

        return `
            <div class="legend-item">
                <span
                    class="legend-color"
                    style="background: ${getCategoryColor(category.categoryName)}"
                ></span>

                <span class="legend-name">
                    ${category.categoryName}
                </span>

                <span class="legend-value">
                    ${percentage}%
                </span>
            </div>
        `;
    }).join("");
}

function getCategoryColor(categoryName) {
    const colors = {
        Food: "#4f8cff",
        Transport: "#8b5cf6",
        Shopping: "#22c55e",
        Entertainment: "#f59e0b",
        Bills: "#ef4444",
        Health: "#06b6d4",
        Education: "#ec4899",
        Other: "#64748b"
    };

    return colors[categoryName] || "#94a3b8";
}

async function loadSpendingTrend(period = "monthly") {
    try {
        const endpoint =
            period === "daily"
                ? `/analytics/daily/${CURRENT_USER_ID}`
                : `/analytics/monthly/${CURRENT_USER_ID}`;

        const trends = await apiGet(endpoint);

        console.log(`${period} spending:`, trends);

        renderSpendingTrend(trends);

    } catch (error) {
        console.error(`Could not load ${period} spending trend:`, error);
    }
}
function setupSpendingTrendToggle() {
    const buttons = document.querySelectorAll(".toggle-btn");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            const period =
                button.textContent.trim().toLowerCase();

            loadSpendingTrend(period);
        });
    });
}
function renderSpendingTrend(trends) {
    const canvas = document.getElementById("spending-trend-chart");

    if (!canvas) {
        return;
    }

    const labels = trends.map(item => item.date);
    const values = trends.map(item => Number(item.totalAmount));

    if (spendingTrendChart) {
        spendingTrendChart.destroy();
    }

    spendingTrendChart = new Chart(canvas, {
        type: "line",

        data: {
            labels: labels,

            datasets: [
                {
                    label: "Spending",
                    data: values,
                    borderColor: "#4f8cff",
                    backgroundColor: "rgba(79, 140, 255, 0.15)",
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.10)"
                    }
                },

                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#94a3b8"
                    },
                    grid: {
                        color: "rgba(148, 163, 184, 0.10)"
                    }
                }
            }
        }
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}
function loadCurrentDate() {
    const dateElement = document.getElementById("current-date");

    if (!dateElement) {
        return;
    }

    const now = new Date();

    dateElement.textContent = now.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}
function setupLogout() {
    const logoutButton =
        document.querySelector(".nav-item.logout");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener("click", async (event) => {
        event.preventDefault();

        try {
            await apiPost("/users/logout", {});
        } catch (error) {
            console.error(
                "Server logout failed:",
                error
            );
        }

        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("authToken");

        window.location.href = "login.html";
    });
}
function loadWelcomeUser() {
    const username =
        localStorage.getItem("username");

    const welcomeUser =
        document.getElementById("welcome-user");

    if (!welcomeUser) {
        return;
    }

    if (username) {
        welcomeUser.textContent =
            `Welcome, ${username}`;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    testBackendConnection();
    loadDashboardSummary();
    loadMonthlyComparison();
    loadCategorySpending();
    loadSpendingTrend();
    setupSpendingTrendToggle();
    loadRecentTransactions();
    loadCurrentDate();
    setupLogout();
    loadWelcomeUser();
});