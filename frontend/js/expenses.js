const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));

if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}

let editingExpenseId = null;

async function loadExpenseCategories() {
    try {
        const categories = await apiGet("/categories");

        const categorySelect =
            document.getElementById("expense-category");

        categorySelect.innerHTML = `
            <option value="">
                Select category
            </option>
        `;

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            categorySelect.appendChild(option);
        });

    } catch (error) {
        console.error(
            "Could not load expense categories:",
            error
        );
    }
}

async function loadExpenses() {
    try {
        const response =
    await apiGet(`/transactions/${CURRENT_USER_ID}`);

const transactions =
    response.transactions || [];

const expenses = transactions.filter(
    transaction => transaction.type === "expense"
);

renderExpenses(expenses);

    } catch (error) {
        console.error(
            "Could not load expenses:",
            error
        );
    }
}

async function loadCategoryMap() {
    const categories = await apiGet("/categories");

    return new Map(
        categories.map(category => [
            category.id,
            category.name
        ])
    );
}

async function renderExpenses(expenses) {
    const tableBody =
        document.getElementById("expenses-body");

    if (!tableBody) {
        return;
    }

    try {
        const categoryMap = await loadCategoryMap();

        if (expenses.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No expenses found.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = expenses
            .map(expense => {

                const categoryName =
                    categoryMap.get(expense.categoryId) ||
                    "Other";

                return `
                    <tr>
                        <td>
                            ${formatExpenseDate(
                                expense.transactionDate
                            )}
                        </td>

                        <td>
                            ${categoryName}
                        </td>

                        <td>
                            ${expense.description || "—"}
                        </td>

                        <td class="amount-expense">
                            ${formatCurrency(expense.amount)}
                        </td>

                        <td>
                            <button
                                class="table-action-btn edit-btn"
                                data-id="${expense.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="table-action-btn delete-btn"
                                data-id="${expense.id}"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            })
            .join("");

    } catch (error) {
        console.error(
            "Could not render expenses:",
            error
        );
    }
}

async function addExpense(event) {
    event.preventDefault();

    const amountInput =
        document.getElementById("expense-amount");

    const categoryInput =
        document.getElementById("expense-category");

    const newCategoryInput =
        document.getElementById("new-expense-category");

    const amount = Number(amountInput.value);

    let categoryId =
        Number(categoryInput.value);

    const newCategoryName =
        newCategoryInput.value.trim();

    if (!Number.isFinite(amount) || amount <= 0) {
       showToast("✓Please enter an amount greater than 0.");
        amountInput.focus();
        return;
    }

    /*
     * If the user typed a new category,
     * create/find it through the backend.
     */
    if (newCategoryName) {

        if (newCategoryName.length > 50) {
            showToast(
                "Category name cannot exceed 50 characters."
            );

            newCategoryInput.focus();
            return;
        }

        try {
            const category =
                await apiPost("/categories", {
                    name: newCategoryName
                });

            categoryId = Number(category.id);

            await loadExpenseCategories();

            categoryInput.value =
                String(categoryId);

        } catch (error) {
            console.error(
                "Could not create category:",
                error
            );

            showToast(
                "Could not create category."
            );

            newCategoryInput.focus();
            return;
        }
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        showToast(
            "Please select a category or enter a new category."
        );

        categoryInput.focus();
        return;
    }

    const transactionDate =
        document.getElementById("expense-date").value;

    const description =
        document
            .getElementById("expense-description")
            .value
            .trim();

    if (description.length > 255) {
        showToast(
            "Description cannot exceed 255 characters."
        );

        document
            .getElementById("expense-description")
            .focus();

        return;
    }

    if (!transactionDate) {
        showToast(
            "Please select an expense date."
        );

        document
            .getElementById("expense-date")
            .focus();

        return;
    }

    const selectedDate =
        new Date(transactionDate);

    const today =
        new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      showToast(
            "Expense date cannot be in the future."
        );

        document
            .getElementById("expense-date")
            .focus();

        return;
    }

    const expenseData = {
        userId: CURRENT_USER_ID,
        categoryId: categoryId,
        type: "expense",
        amount: amount,
        description: description,
        transactionDate: transactionDate
    };

    try {

        if (editingExpenseId === null) {

            await apiPost(
                "/transactions",
                expenseData
            );

            showToast("✓ Expense added successfully.");

        } else {

            await apiPut(
                `/transactions/${editingExpenseId}`,
                expenseData
            );

            showToast(
                "Expense updated successfully."
            );
        }

        editingExpenseId = null;

        document
            .getElementById("expense-form")
            .reset();

        resetExpenseFormMode();

        await loadExpenseCategories();
        await loadExpenses();

    } catch (error) {

        console.error(
            "Could not add expense:",
            error
        );

        showToast(
            "Could not add expense."
        );
    }
}

async function deleteExpense(transactionId) {
    try {
        await apiDelete(
            `/transactions/${transactionId}`,
            {
                userId: CURRENT_USER_ID
            }
        );

        showToast(
            "Expense deleted successfully."
        );

        await loadExpenses();

    } catch (error) {

        console.error(
            "Could not delete expense:",
            error
        );

        showToast(
            "Could not delete expense."
        );
    }
}

async function editExpense(transactionId) {

    try {

        const transactions =
            await apiGet(
                `/transactions/${CURRENT_USER_ID}`
            );

        const expense =
            transactions.find(
                transaction =>
                    transaction.id === transactionId
            );

        if (!expense) {
            showToast("Expense not found.");
            return;
        }

        editingExpenseId = transactionId;

        document
            .getElementById("expense-form-title")
            .textContent = "Edit Expense";

       const addExpenseButton =
    document.getElementById("add-expense-btn");

if (addExpenseButton) {
    addExpenseButton.textContent =
        "Update Expense";
}

        document
            .getElementById("expense-amount")
            .value = expense.amount;

        document
            .getElementById("expense-category")
            .value = expense.categoryId;

        document
            .getElementById("new-expense-category")
            .value = "";

        document
            .getElementById("expense-date")
            .value = expense.transactionDate;

        document
            .getElementById("expense-description")
            .value = expense.description || "";

        document
            .getElementById("expense-form")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {

        console.error(
            "Could not load expense for editing:",
            error
        );

       showToast(
            "Could not load expense."
        );
    }
}

function setupExpenseActions() {

    const tableBody =
        document.getElementById("expenses-body");

    tableBody.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "delete-btn"
                )
            ) {
                const transactionId =
                    Number(event.target.dataset.id);

                deleteExpense(transactionId);
            }

            if (
                event.target.classList.contains(
                    "edit-btn"
                )
            ) {
                const transactionId =
                    Number(event.target.dataset.id);

                editExpense(transactionId);
            }
        }
    );
}

function resetExpenseFormMode() {

    editingExpenseId = null;

    document
        .getElementById("expense-form-title")
        .textContent = "Add Expense";

    const addExpenseButton =
    document.getElementById("add-expense-btn");

if (addExpenseButton) {
    addExpenseButton.textContent =
        "+ Add Expense";
}
}

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}

function formatExpenseDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadExpenseCategories();
        loadExpenses();

        const expenseForm =
            document.getElementById("expense-form");

        expenseForm.addEventListener(
            "submit",
            addExpense
        );

        expenseForm.addEventListener(
            "reset",
            () => {
                resetExpenseFormMode();
            }
        );

        setupExpenseActions();
        loadExpenseSummary();
    }
);
function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}
async function loadExpenseSummary() {
    try {
        const summary =
            await apiGet(`/analytics/summary/${CURRENT_USER_ID}`);

        document.getElementById("income-text").textContent =
            `₹${summary.totalIncome.toFixed(2)}`;

        document.getElementById("expense-text").textContent =
            `₹${summary.totalExpenses.toFixed(2)}`;

        document.getElementById("balance-text").textContent =
            `₹${summary.balance.toFixed(2)}`;

    } catch (error) {
        console.error(
            "Failed to load expense summary:",
            error
        );
    }
}