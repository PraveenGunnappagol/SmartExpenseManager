const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));
const CURRENT_USERNAME =
    localStorage.getItem("username") || "User";
if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}


// ==================== LOAD TRANSACTIONS ====================

async function loadTransactions() {
    try {
        const response =
            await apiGet(
                `/transactions/${CURRENT_USER_ID}`
            );

        const transactions =
            response.transactions || [];

        const categories =
            await apiGet("/categories");

        renderTransactions(
            transactions,
            categories
        );

    } catch (error) {
        console.error(
            "Failed to load transactions:",
            error
        );

        const tableBody =
            document.getElementById(
                "transactions-body"
            );

        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Failed to load transactions.
                    </td>
                </tr>
            `;
        }
    }
}


// ==================== RENDER ====================

function renderTransactions(
    transactions,
    categories
) {
    const tableBody =
        document.getElementById(
            "transactions-body"
        );

    if (!tableBody) {
        return;
    }

    if (transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    No transactions found.
                </td>
            </tr>
        `;

        return;
    }

    const categoryMap =
        new Map(
            categories.map(category => [
                category.id,
                category.name
            ])
        );

    tableBody.innerHTML =
        transactions
            .map(transaction => {
                const isIncome =
                    transaction.type === "income";

                const categoryName =
                    categoryMap.get(
                        transaction.categoryId
                    ) || "Other";

                return `
                    <tr>

                        <td>
                            ${formatTransactionDate(
                                transaction.transactionDate
                            )}
                        </td>

                        <td>
                            <span
                                class="transaction-type ${
                                    isIncome
                                        ? "income"
                                        : "expense"
                                }"
                            >
                                ${
                                    isIncome ? 
                                    "↑" : 
                                    "↓"
                                }
                            </span>
                        </td>

                        <td>
                            ${categoryName}
                        </td>

                        <td>
                            ${
                                transaction.description ||
                                "—"
                            }
                        </td>

                        <td class="${
                            isIncome
                                ? "amount-income"
                                : "amount-expense"
                        }">
                            ${formatCurrency(
                                transaction.amount
                            )}
                        </td>

                    </tr>
                `;
            })
            .join("");
}


// ==================== FORMAT DATE ====================

function formatTransactionDate(
    dateString
) {
    const date =
        new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==================== FORMAT CURRENCY ====================

function formatCurrency(amount) {
    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }
    ).format(amount);
}
// ==================== LOAD SIDEBAR SUMMARY ====================

async function loadSidebarSummary() {
    try {
        const summary =
            await apiGet(
                `/analytics/summary/${CURRENT_USER_ID}`
            );

        document.getElementById("sidebar-income").textContent =
            formatCurrency(summary.totalIncome);

        document.getElementById("sidebar-expenses").textContent =
            formatCurrency(summary.totalExpenses);

        document.getElementById("sidebar-balance").textContent =
            formatCurrency(summary.balance);

    } catch (error) {
        console.error(
            "Failed to load sidebar summary:",
            error
        );
    }
}

// ==================== PAGE INITIALIZATION ====================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const welcomeUser =
            document.getElementById("welcome-user");

        if (welcomeUser) {
            welcomeUser.textContent =
                `Welcome, ${CURRENT_USERNAME}`;
        }

    
        loadSidebarSummary();
        loadTransactions();
    }
);