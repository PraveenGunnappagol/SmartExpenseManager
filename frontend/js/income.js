const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));

if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}

let editingIncomeId = null;


// ==================== LOAD CATEGORIES ====================

// ==================== LOAD INCOME CATEGORIES ====================

const DEFAULT_INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Interest",
    "Bonus",
    "Commission",
    "Rental Income",
    "Gift",
    "Other Income"
];

// ==================== LOAD INCOME CATEGORIES ====================



// ==================== LOAD INCOME CATEGORIES ====================


async function loadIncomeCategories() {

    const categorySelect =
        document.getElementById("income-category");

    if (!categorySelect) {
        return;
    }

    try {

        const categories =
            await apiGet("/categories");

        const savedIncomeCategories =
            JSON.parse(
                localStorage.getItem("incomeCategories")
            ) || [];

        const categoryMap = new Map();

        categories.forEach(category => {

            categoryMap.set(
                category.id,
                {
                    id: category.id,
                    name: category.name
                }
            );

        });

        savedIncomeCategories.forEach(category => {

            if (
                category &&
                typeof category === "object" &&
                category.id &&
                category.name
            ) {

                categoryMap.set(
                    category.id,
                    {
                        id: category.id,
                        name: category.name
                    }
                );

            }

        });

        categorySelect.innerHTML = `
            <option value="">
                Select category
            </option>
        `;

        categoryMap.forEach(category => {

            const option =
                document.createElement("option");

            option.value =
                String(category.id);

            option.textContent =
                category.name;

            categorySelect.appendChild(option);

        });

    } catch (error) {

        console.error(
            "Failed to load income categories:",
            error
        );

        categorySelect.innerHTML = `
            <option value="">
                Select category
            </option>
        `;
    }
}


// ==================== LOAD INCOME ====================

async function loadIncome() {
    try {
        const response =
    await apiGet(`/transactions/${CURRENT_USER_ID}`);

const transactions =
    response.transactions || [];

const income =
    transactions.filter(
        transaction => transaction.type === "income"
    );

        renderIncome(income);

    } catch (error) {
        console.error(
            "Failed to load income:",
            error
        );
    }
}


// ==================== CATEGORY MAP ====================

async function loadCategoryMap() {
    const categories =
        await apiGet("/categories");

    return new Map(
        categories.map(category => [
            category.id,
            category.name
        ])
    );
}


// ==================== RENDER INCOME ====================

async function renderIncome(income) {

    const tableBody =
        document.getElementById("income-body");

    try {

        const categoryMap =
            await loadCategoryMap();

        if (income.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No income found.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML =
            income.map(transaction => {

                const categoryName =
                    categoryMap.get(
                        transaction.categoryId
                    ) || "Other";

                return `
                    <tr>

                        <td>
                            ${formatIncomeDate(
                                transaction.transactionDate
                            )}
                        </td>

                        <td>
                            ${categoryName}
                        </td>

                        <td>
                            ${transaction.description || "—"}
                        </td>

                        <td class="amount-income">
                            ${formatCurrency(
                                transaction.amount
                            )}
                        </td>

                        <td>

                            <button
                                class="table-action-btn edit-btn"
                                data-id="${transaction.id}"
                            >
                                Edit
                            </button>

                            <button
                                class="table-action-btn delete-btn"
                                data-id="${transaction.id}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Failed to render income:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load income.
                </td>
            </tr>
        `;
    }
}


// ==================== ADD / UPDATE INCOME ====================

async function saveIncome(event) {

    event.preventDefault();

    const amountInput =
        document.getElementById("income-amount");

    const categoryInput =
        document.getElementById("income-category");

    const newCategoryInput =
        document.getElementById("new-income-category");

    const dateInput =
        document.getElementById("income-date");

    const descriptionInput =
        document.getElementById("income-description");


    const amount =
    Number(amountInput.value);

let categoryId =
    Number(categoryInput.value);

const newCategoryName =
    newCategoryInput.value.trim();

    const transactionDate =
        dateInput.value;

    const description =
        descriptionInput.value.trim();


    // ==================== AMOUNT VALIDATION ====================

    if (!Number.isFinite(amount) || amount <= 0) {

        showToast(
            "Please enter a valid income amount."
        );

        amountInput.focus();

        return;
    }


    // ==================== NEW INCOME CATEGORY ====================

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
            await apiPost(
                "/categories",
                {
                    name: newCategoryName
                }
            );

        categoryId =
            Number(category.id);

        const savedIncomeCategories =
            JSON.parse(
                localStorage.getItem(
                    "incomeCategories"
                )
            ) || [];

        const alreadyExists =
            savedIncomeCategories.some(
                item =>
                    item.name.toLowerCase() ===
                    newCategoryName.toLowerCase()
            );

        if (!alreadyExists) {

            savedIncomeCategories.push({
                id: categoryId,
                name: newCategoryName
            });

            localStorage.setItem(
                "incomeCategories",
                JSON.stringify(
                    savedIncomeCategories
                )
            );
        }

        await loadIncomeCategories();

        categoryInput.value =
            String(categoryId);

    } catch (error) {

        console.error(
            "Could not create income category:",
            error
        );

        showToast(
            "Could not create income category."
        );

        newCategoryInput.focus();

        return;
    }
}


    // ==================== CATEGORY VALIDATION ====================

    if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
    ) {

        showToast(
            "Please select a category or enter a new category."
        );

        categoryInput.focus();

        return;
    }


    // ==================== DATE VALIDATION ====================

    if (!transactionDate) {

        showToast(
            "Please select a date."
        );

        dateInput.focus();

        return;
    }


    // ==================== DESCRIPTION VALIDATION ====================

    if (description.length > 255) {

        showToast(
            "Description cannot exceed 255 characters."
        );

        descriptionInput.focus();

        return;
    }


    // ==================== PREVENT FUTURE DATES ====================

    const selectedDate =
        new Date(transactionDate);

    const today =
        new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {

        showToast(
            "Income date cannot be in the future."
        );

        dateInput.focus();

        return;
    }


    // ==================== INCOME DATA ====================

    const incomeData = {

        userId: CURRENT_USER_ID,

        categoryId: categoryId,

        type: "income",

        amount: amount,

        description: description,

        transactionDate: transactionDate
    };


    // ==================== SAVE ====================

    try {

        if (editingIncomeId === null) {

            await apiPost(
                "/transactions",
                incomeData
            );

        } else {

            await apiPut(
                `/transactions/${editingIncomeId}`,
                incomeData
            );
        }


        editingIncomeId = null;

resetIncomeFormMode();

document
    .getElementById("income-form")
    .reset();

showToast("✓ Income added successfully.");

loadIncomeCategories();
loadIncome();


    } catch (error) {

        console.error(
            "Failed to save income:",
            error
        );

        showToast(
            "Failed to save income. Please try again."
        );
    }
}


// ==================== DELETE INCOME ====================

async function deleteIncome(transactionId) {
    try {
        await apiDelete(
            `/transactions/${transactionId}`,
            {
                userId: CURRENT_USER_ID
            }
        );

        showToast(
            "Income deleted successfully."
        );

        await loadIncome();
        await loadIncomeSummary();

    } catch (error) {

        console.error(
            "Failed to delete income:",
            error
        );

        showToast(
            "Failed to delete income. Please try again."
        );
    }
}


// ==================== EDIT INCOME ====================

async function editIncome(transactionId) {

    try {

        const transactions =
            await apiGet(
                `/transactions/${CURRENT_USER_ID}`
            );

        const income =
            transactions.find(
                transaction =>
                    transaction.id === transactionId &&
                    transaction.type === "income"
            );

        if (!income) {

            showToast(
                "Income not found."
            );

            return;
        }

        editingIncomeId =
            transactionId;


        document
            .getElementById("income-form-title")
            .textContent =
                "Edit Income";


        document
            .getElementById("income-submit-btn")
            .textContent =
                "Update Income";


        document
            .getElementById("income-amount")
            .value =
                income.amount;


        document
            .getElementById("income-category")
            .value =
                income.categoryId;


        document
            .getElementById("new-income-category")
            .value =
                "";


        document
            .getElementById("income-date")
            .value =
                income.transactionDate;


        document
            .getElementById("income-description")
            .value =
                income.description || "";


        document
            .getElementById("income-form")
            .scrollIntoView({
                behavior: "smooth"
            });

    } catch (error) {

        console.error(
            "Failed to edit income:",
            error
        );

        showToast(
            "Failed to load income details."
        );
    }
}


// ==================== TABLE ACTIONS ====================

function setupIncomeActions() {

    const tableBody =
        document.getElementById("income-body");

    tableBody.addEventListener(
        "click",
        event => {

            if (
                event.target.classList
                    .contains("delete-btn")
            ) {

                const transactionId =
                    Number(
                        event.target.dataset.id
                    );

                deleteIncome(transactionId);
            }


            if (
                event.target.classList
                    .contains("edit-btn")
            ) {

                const transactionId =
                    Number(
                        event.target.dataset.id
                    );

                editIncome(transactionId);
            }

        }
    );
}


// ==================== RESET FORM ====================

function resetIncomeFormMode() {

    editingIncomeId = null;

    document
        .getElementById("income-form-title")
        .textContent =
            "Add Income";

    const newCategoryInput =
        document.getElementById(
            "new-income-category"
        );

    if (newCategoryInput) {
        newCategoryInput.value = "";
    }
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


// ==================== FORMAT DATE ====================

function formatIncomeDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ==================== LOAD SUMMARY ====================



function setupAddIncomeButton() {
    const addIncomeButton =
        document.getElementById("add-income-btn");

    if (!addIncomeButton) {
        return;
    }

    addIncomeButton.addEventListener("click", () => {
        const incomeForm =
            document.getElementById("income-form");

        incomeForm.requestSubmit();
    });
}
// ==================== PAGE INITIALIZATION ====================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadIncomeCategories();

        loadIncome();



        const incomeForm =
            document.getElementById(
                "income-form"
            );


        incomeForm.addEventListener(
            "submit",
            saveIncome
        );


        incomeForm.addEventListener(
            "reset",
            () => {

                resetIncomeFormMode();

            }
        );


        setupIncomeActions();
        setupAddIncomeButton();

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