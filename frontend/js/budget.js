let editingBudgetId = null;

const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));

// Protect the page
if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}


// -----------------------------
// Toast
// -----------------------------

function showToast(message) {
    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}


// -----------------------------
// Format Currency
// -----------------------------

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toFixed(2)}`;
}


// -----------------------------
// Load Month Summary
// -----------------------------

async function loadMonthSummary() {
    try {
        const summary =
            await apiGet(
                `/analytics/summary/${CURRENT_USER_ID}`
            );

        document.getElementById(
            "income-text"
        ).textContent =
            formatCurrency(summary.totalIncome);

        document.getElementById(
            "expense-text"
        ).textContent =
            formatCurrency(summary.totalExpenses);

        document.getElementById(
            "balance-text"
        ).textContent =
            formatCurrency(summary.balance);

    } catch (error) {

        console.error(
            "Failed to load month summary:",
            error
        );
    }
}


// -----------------------------
// Load Budgets
// -----------------------------

async function loadBudgets() {

    try {

        const response =
    await apiGet(
        `/budgets/${CURRENT_USER_ID}`
    );

const budgets =
    response.budgets || [];

       const tableBody =
    document.getElementById(
        "budget-list-body"
    );

        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (!budgets || budgets.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="3"
                        class="empty-state">
                        No budgets found.
                    </td>
                </tr>
            `;

            return;
        }

        budgets.forEach(budget => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>
                    ${budget.month}
                </td>

                <td>
                    ₹${Number(
                        budget.amount
                    ).toFixed(2)}
                </td>

                <td>
                    <button
                        class="table-action-btn"
                        onclick="editBudget(${budget.id})">
                        Edit
                    </button>

                    <button
                        class="table-action-btn delete-action"
                        onclick="deleteBudget(${budget.id})">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Failed to load budgets:",
            error
        );

        showToast(
            "Failed to load budgets."
        );
    }
}
function formatBudgetMonth(month) {

    if (!month) {
        return "-";
    }

    const parts =
        month.split("-");

    if (parts.length < 2) {
        return month;
    }

    const year =
        Number(parts[0]);

    const monthNumber =
        Number(parts[1]);

    const date =
        new Date(
            year,
            monthNumber - 1,
            1
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}


// -----------------------------
// Add / Update Budget
// -----------------------------
// -----------------------------
// Populate Budget Months
// -----------------------------

function populateBudgetMonths() {

    const monthSelect =
        document.getElementById("budget-month");

    if (!monthSelect) return;


    // Keep the placeholder
    monthSelect.innerHTML = `
        <option value="">
            Select month
        </option>
    `;


    const today = new Date();

    const currentYear =
        today.getFullYear();

    const currentMonth =
        today.getMonth();


    /*
     * Show the current month plus
     * the next 11 months.
     *
     * Example:
     * September 2026
     * October 2026
     * ...
     * August 2027
     */

    for (let i = 0; i < 12; i++) {

        const date =
            new Date(
                currentYear,
                currentMonth + i,
                1
            );

        const year =
            date.getFullYear();

        const monthNumber =
            date.getMonth() + 1;

        const value =
            `${year}-${String(monthNumber).padStart(2, "0")}`;

        const label =
            date.toLocaleDateString(
                "en-IN",
                {
                    month: "long",
                    year: "numeric"
                }
            );


        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = label;

        monthSelect.appendChild(option);
    }
}
async function saveBudget(event) {

    event.preventDefault();


    const amount =
        Number(
            document.getElementById(
                "budget-amount"
            ).value
        );


    const month =
        document.getElementById(
            "budget-month"
        ).value;


    if (
        amount <= 0 ||
        !month
    ) {

        showToast(
            "Please enter a valid monthly budget."
        );

        return;
    }


    /*
     * The month select returns:
     *
     * YYYY-MM
     *
     * MySQL DATE column expects:
     *
     * YYYY-MM-01
     */

    const monthDate =
        `${month}-01`;


    try {

        if (editingBudgetId) {

            await apiPut(
                `/budgets/${editingBudgetId}`,
                {
                    amount: amount,
                    month: monthDate
                }
            );

            showToast(
                "Monthly budget updated successfully."
            );

        } else {

            await apiPost(
                "/budgets",
                {
                    amount: amount,
                    month: monthDate
                }
            );

            showToast(
                "Monthly budget created successfully."
            );
        }


        resetBudgetForm();

        await loadBudgets();

    } catch (error) {

        console.error(
            "Failed to save budget:",
            error
        );

        showToast(
            error.message ||
            "Failed to save budget."
        );
    }
}


// -----------------------------
// Edit Budget
// -----------------------------

async function editBudget(budgetId) {

    try {

        const response =
            await apiGet(
                `/budgets/${CURRENT_USER_ID}`
            );

        const budgets =
            response.budgets || [];

        const budget =
            budgets.find(
                item =>
                    item.id === budgetId
            );


        if (!budget) {

            showToast(
                "Budget not found."
            );

            return;
        }


        editingBudgetId =
            budgetId;


        document.getElementById(
            "budget-form-title"
        ).textContent =
            "Edit Monthly Budget";


        document.getElementById(
            "budget-submit-btn"
        ).textContent =
            "Update Budget";


        document.getElementById(
            "budget-amount"
        ).value =
            budget.amount;


        /*
         * Convert:
         *
         * 2026-09-01
         *
         * to:
         *
         * 2026-09
         */

        document.getElementById(
            "budget-month"
        ).value =
            budget.month.substring(0, 7);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Failed to load budget:",
            error
        );

        showToast(
            "Failed to load budget."
        );
    }
}


// -----------------------------
// Delete Budget
// -----------------------------

async function deleteBudget(budgetId) {
    try {
        await apiDelete(
            `/budgets/${budgetId}`
        );

        showToast(
            "Monthly budget deleted successfully."
        );

        await loadBudgets();

    } catch (error) {

        console.error(
            "Failed to delete budget:",
            error
        );

        showToast(
            error.message ||
            "Failed to delete budget."
        );
    }
}


// -----------------------------
// Reset Form
// -----------------------------

function resetBudgetForm() {

    editingBudgetId = null;


    document.getElementById(
        "budget-form"
    ).reset();


    document.getElementById(
        "budget-form-title"
    ).textContent =
        "Add Monthly Budget";


    document.getElementById(
        "budget-submit-btn"
    ).textContent =
        "Save Budget";
}


// -----------------------------
// Logout
// -----------------------------

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logout-btn"
        );

    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await apiPost(
                    "/users/logout",
                    {}
                );

            } catch (error) {

                console.error(
                    "Logout request failed:",
                    error
                );
            }


            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "username"
            );

            localStorage.removeItem(
                "authToken"
            );


            window.location.href =
                "login.html";
        }
    );
}


// -----------------------------
// Add Budget Button
// -----------------------------

function setupAddBudgetButton() {

    const button =
        document.getElementById(
            "add-budget-btn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            resetBudgetForm();


            document.getElementById(
                "budget-amount"
            ).focus();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    );
}


// -----------------------------
// Cancel Button
// -----------------------------

function setupCancelButton() {

    const button =
        document.getElementById(
            "budget-cancel-btn"
        );

    if (!button) return;


    button.addEventListener(
        "click",
        resetBudgetForm
    );
}


// -----------------------------
// Page Initialization
// -----------------------------

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupLogout();

        setupAddBudgetButton();

        setupCancelButton();
         populateBudgetMonths();

        const budgetForm =
            document.getElementById(
                "budget-form"
            );

        if (budgetForm) {

            budgetForm.addEventListener(
                "submit",
                saveBudget
            );
        }


       

        await loadBudgets();
    }
);