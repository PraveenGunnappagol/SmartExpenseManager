const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));

if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}

let incomeExpenseChart = null;


// ================================
// Financial Overview
// ================================

async function loadAnalyticsSummary() {
    try {
        const response =
            await apiGet(
                `/transactions/${CURRENT_USER_ID}`
            );

        const transactions =
            response.transactions || [];

        const totalIncome =
            transactions
                .filter(
                    transaction =>
                        transaction.type === "income"
                )
                .reduce(
                    (sum, transaction) =>
                        sum + Number(transaction.amount || 0),
                    0
                );

        const totalExpenses =
            transactions
                .filter(
                    transaction =>
                        transaction.type === "expense"
                )
                .reduce(
                    (sum, transaction) =>
                        sum + Number(transaction.amount || 0),
                    0
                );

        const balance =
            totalIncome - totalExpenses;

        const savingsRate =
            totalIncome > 0
                ? (
                    (balance / totalIncome) * 100
                )
                : 0;

        document.getElementById(
            "analytics-total-income"
        ).textContent =
            formatCurrency(totalIncome);

        document.getElementById(
            "analytics-total-expenses"
        ).textContent =
            formatCurrency(totalExpenses);

        document.getElementById(
            "analytics-balance"
        ).textContent =
            formatCurrency(balance);

        document.getElementById(
            "analytics-savings-rate"
        ).textContent =
            `${savingsRate.toFixed(1)}%`;

        document.getElementById(
            "income-text"
        ).textContent =
            formatCurrency(totalIncome);

        document.getElementById(
            "expense-text"
        ).textContent =
            formatCurrency(totalExpenses);

        document.getElementById(
            "balance-text"
        ).textContent =
            formatCurrency(balance);

    } catch (error) {
        console.error(
            "Could not load analytics summary:",
            error
        );
    }
}


// ================================
// Income vs Expense
// ================================

async function loadIncomeExpenseChart() {
    try {
        const comparison =
            await apiGet(
                `/analytics/monthly-comparison/${CURRENT_USER_ID}`
            );

        const canvas =
            document.getElementById(
                "income-expense-chart"
            );

        if (!canvas) {
            return;
        }

        const currentMonth =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        const previousDate =
            new Date();

        previousDate.setMonth(
            previousDate.getMonth() - 1
        );

        const previousMonth =
            previousDate.toLocaleDateString(
                "en-IN",
                {
                    month: "short",
                    year: "numeric"
                }
            );

        if (incomeExpenseChart) {
            incomeExpenseChart.destroy();
        }

        incomeExpenseChart =
            new Chart(canvas, {
                type: "bar",

                data: {
                    labels: [
                        previousMonth,
                        currentMonth
                    ],

                    datasets: [
                        {
                            label: "Income",

                            data: [
                                Number(
                                    comparison.previousIncome || 0
                                ),

                                Number(
                                    comparison.currentIncome || 0
                                )
                            ],

                            borderWidth: 1
                        },

                        {
                            label: "Expenses",

                            data: [
                                Number(
                                    comparison.previousExpenses || 0
                                ),

                                Number(
                                    comparison.currentExpenses || 0
                                )
                            ],

                            borderWidth: 1
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            beginAtZero: true,

                            ticks: {
                                callback: value =>
                                    "₹" +
                                    Number(value)
                                        .toLocaleString("en-IN")
                            }
                        }
                    },

                    plugins: {
                        legend: {
                            display: true
                        },

                        tooltip: {
                            callbacks: {
                                label: context =>
                                    `${context.dataset.label}: ` +
                                    formatCurrency(
                                        context.raw
                                    )
                            }
                        }
                    }
                }
            });

    } catch (error) {
        console.error(
            "Could not load income vs expense chart:",
            error
        );
    }
}


// ================================
// Category-wise Spending
// ================================

async function loadCategorySpending() {
    try {
        const response =
            await apiGet(
                `/analytics/categories/${CURRENT_USER_ID}`
            );

        const categories =
            Array.isArray(response)
                ? response
                : response.categories || [];

        const tableBody =
            document.getElementById(
                "category-spending-body"
            );

        if (!tableBody) {
            return;
        }

        if (categories.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="3">
                        No spending data available.
                    </td>
                </tr>
            `;

            loadFinancialInsights([]);

            return;
        }

        const spendingData =
            categories
                .map(category => ({
                    name:
                        category.categoryName ||
                        "Other",

                    amount:
                        Number(
                            category.totalAmount || 0
                        )
                }))
                .filter(item => item.amount > 0)
                .sort(
                    (a, b) =>
                        b.amount - a.amount
                );

        const totalSpending =
            spendingData.reduce(
                (sum, item) =>
                    sum + item.amount,
                0
            );

        tableBody.innerHTML =
            spendingData
                .map(item => {

                    const percentage =
                        totalSpending > 0
                            ? (
                                item.amount /
                                totalSpending
                            ) * 100
                            : 0;

                    return `
                        <tr>
                            <td>
                                ${escapeHtml(
                                    item.name
                                )}
                            </td>

                            <td class="amount-expense">
                                ${formatCurrency(
                                    item.amount
                                )}
                            </td>

                            <td>
                                ${percentage.toFixed(1)}%
                            </td>
                        </tr>
                    `;
                })
                .join("");

        loadFinancialInsights(
            spendingData
        );

    } catch (error) {
        console.error(
            "Could not load category spending:",
            error
        );
    }
}

// ================================
// Budget Status
// ================================

async function loadBudgetStatus() {
    try {
        const response =
            await apiGet(
                `/budgets/status/${CURRENT_USER_ID}`
            );

        const budgets =
            response.budgets ||
            response ||
            [];

        const container =
            document.getElementById(
                "analytics-budget-status"
            );

        if (!container) {
            return;
        }

        if (budgets.length === 0) {
            container.innerHTML = `
                <div class="budget-empty">
                    No monthly budgets available.
                </div>
            `;

            return;
        }

        const sortedBudgets =
            [...budgets].sort(
                (a, b) =>
                    new Date(a.month) -
                    new Date(b.month)
            );

        container.innerHTML =
            sortedBudgets
                .map(budget => {

                    const budgetAmount =
                        Number(
                            budget.budgetAmount || 0
                        );

                    const spentAmount =
                        Number(
                            budget.spentAmount || 0
                        );

                    const remainingAmount =
                        Number(
                            budget.remainingAmount || 0
                        );

                    const percentage =
                        budgetAmount > 0
                            ? (
                                spentAmount /
                                budgetAmount
                            ) * 100
                            : 0;

                    let statusText;
                    let statusClass;

                    if (percentage >= 100) {
                        statusText =
                            "Over Budget";

                        statusClass =
                            "budget-status-over";
                    }
                    else if (percentage >= 80) {
                        statusText =
                            "Close to Budget";

                        statusClass =
                            "budget-status-close";
                    }
                    else {
                        statusText =
                            "Within Budget";

                        statusClass =
                            "budget-status-safe";
                    }

                    return `
                        <div class="analytics-budget-item">

                            <div class="analytics-budget-info">

                                <strong>
                                    ${formatBudgetMonth(
                                        budget.month
                                    )}
                                </strong>

                                <span>
                                    Spent:
                                    ${formatCurrency(
                                        spentAmount
                                    )}
                                    /
                                    Budget:
                                    ${formatCurrency(
                                        budgetAmount
                                    )}
                                </span>

                            </div>

                            <div class="analytics-budget-progress">

                                <div
                                    class="analytics-budget-progress-bar ${statusClass}"
                                    style="width: ${Math.min(
                                        percentage,
                                        100
                                    )}%"
                                ></div>

                            </div>

                            <div class="analytics-budget-footer">

                                <span class="${statusClass}">
                                    ${statusText}
                                </span>

                                <strong>
                                    Remaining:
                                    ${formatCurrency(
                                        remainingAmount
                                    )}
                                </strong>

                                <strong>
                                    ${percentage.toFixed(1)}%
                                </strong>

                            </div>

                        </div>
                    `;
                })
                .join("");

    } catch (error) {

        console.error(
            "Could not load budget status:",
            error
        );
    }
}


// ================================
// Financial Insights
// ================================

function loadFinancialInsights(spendingData) {

    const highestContainer =
        document.getElementById(
            "highest-spending-list"
        );

    const lowestContainer =
        document.getElementById(
            "lowest-spending-list"
        );

    if (!highestContainer || !lowestContainer) {
        return;
    }

    if (
        !spendingData ||
        spendingData.length === 0
    ) {
        highestContainer.innerHTML = `
            <div class="budget-empty">
                No spending data available.
            </div>
        `;

        lowestContainer.innerHTML = `
            <div class="budget-empty">
                No spending data available.
            </div>
        `;

        return;
    }

    const highest =
        [...spendingData]
            .sort(
                (a, b) =>
                    b.amount - a.amount
            )
            .slice(0, 3);

    const lowest =
        [...spendingData]
            .sort(
                (a, b) =>
                    a.amount - b.amount
            )
            .slice(0, 3);

    highestContainer.innerHTML =
        highest.map(
            (item, index) => `
                <div class="insight-row">

                    <span>
                        <strong>
                            #${index + 1}
                        </strong>

                        ${escapeHtml(item.name)}
                    </span>

                    <strong>
                        ${formatCurrency(item.amount)}
                    </strong>

                </div>
            `
        ).join("");

    lowestContainer.innerHTML =
        lowest.map(
            (item, index) => `
                <div class="insight-row">

                    <span>
                        <strong>
                            #${index + 1}
                        </strong>

                        ${escapeHtml(item.name)}
                    </span>

                    <strong>
                        ${formatCurrency(item.amount)}
                    </strong>

                </div>
            `
        ).join("");
}


// ================================
// Helpers
// ================================

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(Number(amount) || 0);
}


function formatMonthLabel(month) {
    if (!month) {
        return "";
    }

    const date =
        new Date(
            month.length === 7
                ? `${month}-01`
                : month
        );

    if (Number.isNaN(date.getTime())) {
        return month;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "short",
            year: "numeric"
        }
    );
}


function formatBudgetMonth(month) {
    if (!month) {
        return "Unknown Month";
    }

    const date =
        new Date(
            month.length === 7
                ? `${month}-01`
                : month
        );

    if (Number.isNaN(date.getTime())) {
        return month;
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}


function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================================
// Logout
// ================================

function setupLogout() {
    const logoutButton =
        document.querySelector(".logout");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        async event => {

            event.preventDefault();

            try {
                await apiPost(
                    "/users/logout",
                    {}
                );
            } catch (error) {
                console.error(
                    "Logout failed:",
                    error
                );
            }

            localStorage.removeItem("authToken");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");

            window.location.href =
                "login.html";
        }
    );
}
async function loadUnusualSpending()
{
    try
    {
        const data =
            await apiGet(
                `/analytics/unusual-spending/${CURRENT_USER_ID}`
            );

        const transactionResponse =
            await apiGet(
                `/transactions/${CURRENT_USER_ID}`
            );

        const transactions =
            transactionResponse.transactions || [];

        const expenseCount =
            transactions.filter(
                transaction =>
                    transaction.type === "expense"
            ).length;

        const content =
            document.getElementById(
                "unusual-spending-content"
            );

        if (!content)
        {
            return;
        }

        /*
         * Not enough historical expense data
         * for reliable statistical detection.
         */
        if (expenseCount < 5)
        {
            content.innerHTML = `
                <div class="budget-empty">
                    Not enough spending history yet.
                    Add a few more expenses to detect
                    unusual spending patterns.
                </div>
            `;

            return;
        }

        /*
         * No unusual spending detected.
         *
         * Do not display the detailed
         * expense information.
         */
        if (!data.unusualSpending)
        {
            content.innerHTML = `
                <div class="budget-empty">
                    No unusual spending detected.
                    Your spending looks normal.
                </div>
            `;

            return;
        }

        /*
         * An unusual spending spike was detected.
         * Show the detailed information.
         */
        content.innerHTML = `
            <div class="budget-details">

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Status
                    </span>

                    <span class="budget-status budget-status-over">
                        Unusual spending spike detected
                    </span>
                </div>

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Category
                    </span>

                    <span class="budget-detail-value">
                        ${escapeHtml(
                            data.categoryName || "-"
                        )}
                    </span>
                </div>

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Month
                    </span>

                    <span class="budget-detail-value">
                        ${escapeHtml(
                            data.month || "-"
                        )}
                    </span>
                </div>

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Highest Expense
                    </span>

                    <span class="budget-detail-value">
                        ${formatCurrency(
                            Number(
                                data.expenseAmount || 0
                            )
                        )}
                    </span>
                </div>

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Average Expense
                    </span>

                    <span class="budget-detail-value">
                        ${formatCurrency(
                            Number(
                                data.averageExpense || 0
                            )
                        )}
                    </span>
                </div>

                <div class="budget-detail-row">
                    <span class="budget-detail-label">
                        Compared With Average
                    </span>

                    <span class="budget-detail-value">
                        ${Number(
                            data.multiplier || 0
                        ).toFixed(2)}×
                    </span>
                </div>

            </div>
        `;
    }
    catch (error)
    {
        console.error(
            "Failed to load unusual spending:",
            error
        );
    }
}

// ================================
// Page Initialization
// ================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLogout();

        loadAnalyticsSummary();

        loadIncomeExpenseChart();

        loadCategorySpending();

        loadBudgetStatus();

        loadUnusualSpending();

    }
);