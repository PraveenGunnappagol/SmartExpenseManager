// ================================
// Reports
// ================================

const CURRENT_USER_ID =
    Number(localStorage.getItem("userId"));


// ================================
// Page Protection
// ================================

if (!CURRENT_USER_ID) {
    window.location.href = "login.html";
}


// ================================
// Report Data
// ================================

let allTransactions = [];
let categories = [];
let categoryMap = new Map();
let currentReportData = null;


// ================================
// Currency
// ================================

function formatCurrency(amount) {
    return `₹${Number(amount || 0).toFixed(2)}`;
}


// ================================
// Date Formatting
// ================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ================================
// Month Formatting
// ================================

function formatMonth(monthString) {

    if (!monthString) {
        return "—";
    }

    const parts =
        monthString.split("-");

    if (parts.length < 2) {
        return monthString;
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
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


// ================================
// HTML Safety
// ================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ================================
// Load Initial Data
// ================================

async function loadReportData() {

    try {

        const [
            transactionResponse,
            categoryResponse
        ] = await Promise.all([

            apiGet(
                `/transactions/${CURRENT_USER_ID}`
            ),

            apiGet(
                "/categories"
            )

        ]);


        allTransactions =
            transactionResponse.transactions ||
            transactionResponse ||
            [];


        categories =
            categoryResponse.categories ||
            categoryResponse ||
            [];


        categoryMap =
            new Map(
                categories.map(category => [
                    category.id,
                    category.name
                ])
            );


        setThisMonth();


        await generateReport();


    } catch (error) {

        console.error(
            "Could not load report data:",
            error
        );

        showToast(
            "Could not load report data."
        );

    }
}


// ================================
// Get Category Name
// ================================

function getCategoryName(categoryId) {

    return (
        categoryMap.get(categoryId) ||
        "Other"
    );

}


// ================================
// Get Date Inputs
// ================================

function getDateInputs() {

    const fromDate =
        document.getElementById(
            "report-from-date"
        ).value;

    const toDate =
        document.getElementById(
            "report-to-date"
        ).value;


    return {
        fromDate,
        toDate
    };

}


// ================================
// Validate Date Range
// ================================

function validateDateRange(
    fromDate,
    toDate
) {

    if (!fromDate || !toDate) {

        showToast(
            "Please select both dates."
        );

        return false;
    }


    if (fromDate > toDate) {

        showToast(
            "From date cannot be after To date."
        );

        return false;
    }


    return true;

}


// ================================
// Filter Transactions
// ================================

function getTransactionsForPeriod(
    fromDate,
    toDate
) {

    return allTransactions.filter(
        transaction => {

            if (!transaction.transactionDate) {
                return false;
            }

            const transactionDate =
                String(
                    transaction.transactionDate
                ).substring(0, 10);

            return (
                transactionDate >= fromDate &&
                transactionDate <= toDate
            );

        }
    );

}


// ================================
// Generate Report
// ================================

async function generateReport() {

    const {
        fromDate,
        toDate
    } = getDateInputs();


    if (
        !validateDateRange(
            fromDate,
            toDate
        )
    ) {
        return;
    }


    const transactions =
        getTransactionsForPeriod(
            fromDate,
            toDate
        );


    const incomeTransactions =
        transactions.filter(
            transaction =>
                transaction.type === "income"
        );


    const expenseTransactions =
        transactions.filter(
            transaction =>
                transaction.type === "expense"
        );


    const totalIncome =
        incomeTransactions.reduce(
            (sum, transaction) =>
                sum +
                Number(
                    transaction.amount || 0
                ),
            0
        );


    const totalExpenses =
        expenseTransactions.reduce(
            (sum, transaction) =>
                sum +
                Number(
                    transaction.amount || 0
                ),
            0
        );


    const balance =
        totalIncome -
        totalExpenses;


    const savingsRate =
        totalIncome > 0
            ? (balance / totalIncome) * 100
            : 0;


    currentReportData = {

        fromDate,

        toDate,

        transactions,

        incomeTransactions,

        expenseTransactions,

        totalIncome,

        totalExpenses,

        balance,

        savingsRate

    };


    updateFinancialSummary();

    renderIncomeReport();

    renderExpenseReport();

    renderCategorySummary();

    await renderBudgetSummary();

    renderFinancialInsights();

}


// ================================
// Financial Summary
// ================================

function updateFinancialSummary() {

    if (!currentReportData) {
        return;
    }


    const data =
        currentReportData;


    document.getElementById(
        "report-total-income"
    ).textContent =
        formatCurrency(
            data.totalIncome
        );


    document.getElementById(
        "report-total-expenses"
    ).textContent =
        formatCurrency(
            data.totalExpenses
        );


    document.getElementById(
        "report-balance"
    ).textContent =
        formatCurrency(
            data.balance
        );


    document.getElementById(
        "report-savings-rate"
    ).textContent =
        `${data.savingsRate.toFixed(1)}%`;


    document.getElementById(
        "report-income-total"
    ).textContent =
        formatCurrency(
            data.totalIncome
        );


    document.getElementById(
        "report-expense-total"
    ).textContent =
        formatCurrency(
            data.totalExpenses
        );


    document.getElementById(
        "report-period-label"
    ).textContent =
        `${formatDate(data.fromDate)} - ${formatDate(data.toDate)}`;

}


// ================================
// Income Report
// ================================

function renderIncomeReport() {

    const tableBody =
        document.getElementById(
            "report-income-body"
        );


    if (!tableBody) {
        return;
    }


    const transactions =
        currentReportData
            .incomeTransactions;


    if (transactions.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No income transactions found
                    for this period.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        transactions
            .sort(
                (a, b) =>
                    String(
                        b.transactionDate
                    ).localeCompare(
                        String(
                            a.transactionDate
                        )
                    )
            )
            .map(transaction => {

                const categoryName =
                    getCategoryName(
                        transaction.categoryId
                    );


                return `
                    <tr>

                        <td>
                            ${formatDate(
                                transaction.transactionDate
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                categoryName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                transaction.description ||
                                "—"
                            )}
                        </td>

                        <td class="amount-income">
                            ${formatCurrency(
                                transaction.amount
                            )}
                        </td>

                    </tr>
                `;

            })
            .join("");

}


// ================================
// Expense Report
// ================================

function renderExpenseReport() {

    const tableBody =
        document.getElementById(
            "report-expense-body"
        );


    if (!tableBody) {
        return;
    }


    const transactions =
        currentReportData
            .expenseTransactions;


    if (transactions.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No expense transactions found
                    for this period.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        transactions
            .sort(
                (a, b) =>
                    String(
                        b.transactionDate
                    ).localeCompare(
                        String(
                            a.transactionDate
                        )
                    )
            )
            .map(transaction => {

                const categoryName =
                    getCategoryName(
                        transaction.categoryId
                    );


                return `
                    <tr>

                        <td>
                            ${formatDate(
                                transaction.transactionDate
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                categoryName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                transaction.description ||
                                "—"
                            )}
                        </td>

                        <td class="amount-expense">
                            ${formatCurrency(
                                transaction.amount
                            )}
                        </td>

                    </tr>
                `;

            })
            .join("");

}


// ================================
// Category-wise Expense Summary
// ================================

function renderCategorySummary() {

    const tableBody =
        document.getElementById(
            "report-category-body"
        );


    if (!tableBody) {
        return;
    }


    const categoryTotals =
        new Map();


    currentReportData
        .expenseTransactions
        .forEach(transaction => {

            const categoryName =
                getCategoryName(
                    transaction.categoryId
                );


            const currentAmount =
                categoryTotals.get(
                    categoryName
                ) || 0;


            categoryTotals.set(
                categoryName,
                currentAmount +
                Number(
                    transaction.amount || 0
                )
            );

        });


    const categoryData =
        Array.from(
            categoryTotals.entries()
        )
        .map(
            ([name, amount]) => ({
                name,
                amount
            })
        )
        .sort(
            (a, b) =>
                b.amount - a.amount
        );


    if (categoryData.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="3">
                    No category spending data
                    available for this period.
                </td>
            </tr>
        `;

        return;
    }


    const totalExpenses =
        currentReportData.totalExpenses;


    tableBody.innerHTML =
        categoryData
            .map(item => {

                const percentage =
                    totalExpenses > 0
                        ? (
                            item.amount /
                            totalExpenses
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

}


// ================================
// Budget Summary
// ================================

async function renderBudgetSummary() {

    const tableBody =
        document.getElementById(
            "report-budget-body"
        );


    if (!tableBody) {
        return;
    }


    try {

        const response =
            await apiGet(
                `/budgets/status/${CURRENT_USER_ID}`
            );


        const budgets =
            response.budgets ||
            response ||
            [];


        const fromMonth =
            currentReportData
                .fromDate
                .substring(0, 7);


        const toMonth =
            currentReportData
                .toDate
                .substring(0, 7);


        const filteredBudgets =
            budgets.filter(
                budget => {

                    const month =
                        String(
                            budget.month || ""
                        ).substring(0, 7);


                    return (
                        month >= fromMonth &&
                        month <= toMonth
                    );

                }
            );


        if (
            filteredBudgets.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No budget data available
                        for this period.
                    </td>
                </tr>
            `;

            return;
        }


        tableBody.innerHTML =
            filteredBudgets
                .map(budget => {

                    const budgetAmount =
                        Number(
                            budget.budgetAmount ||
                            0
                        );


                    const spentAmount =
                        Number(
                            budget.spentAmount ||
                            0
                        );


                    const remainingAmount =
                        Number(
                            budget.remainingAmount ||
                            0
                        );


                    const percentage =
                        budgetAmount > 0
                            ? (
                                spentAmount /
                                budgetAmount
                            ) * 100
                            : 0;


                    let statusText;

                    if (
                        percentage >= 100
                    ) {

                        statusText =
                            "Over Budget";

                    } else if (
                        percentage >= 80
                    ) {

                        statusText =
                            "Close to Budget";

                    } else {

                        statusText =
                            "Within Budget";

                    }


                    return `
                        <tr>

                            <td>
                                ${formatMonth(
                                    budget.month
                                )}
                            </td>

                            <td>
                                ${formatCurrency(
                                    budgetAmount
                                )}
                            </td>

                            <td class="amount-expense">
                                ${formatCurrency(
                                    spentAmount
                                )}
                            </td>

                            <td>
                                ${formatCurrency(
                                    remainingAmount
                                )}
                            </td>

                            <td>
                                ${statusText}
                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Could not load budget report:",
            error
        );


        tableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Could not load budget data.
                </td>
            </tr>
        `;

    }

}


// ================================
// Financial Insights
// ================================

function renderFinancialInsights() {

    const container =
        document.getElementById(
            "report-insights"
        );


    if (!container) {
        return;
    }


    const data =
        currentReportData;


    const expenseTransactions =
        data.expenseTransactions;


    const incomeTransactions =
        data.incomeTransactions;


    const insights = [];


    // -----------------------------
    // Income vs Expense
    // -----------------------------

    if (
        data.totalIncome >
        data.totalExpenses
    ) {

        insights.push(
            `You earned more than you spent during this period, leaving a positive balance of ${formatCurrency(data.balance)}.`
        );

    } else if (
        data.totalExpenses >
        data.totalIncome
    ) {

        insights.push(
            `Your expenses were higher than your income during this period by ${formatCurrency(Math.abs(data.balance))}.`
        );

    } else {

        insights.push(
            "Your income and expenses were equal during this period."
        );

    }


    // -----------------------------
    // Savings Rate
    // -----------------------------

    if (data.savingsRate >= 20) {

        insights.push(
            `Your savings rate was ${data.savingsRate.toFixed(1)}%, indicating that a meaningful portion of your income remained after expenses.`
        );

    } else if (
        data.savingsRate >= 0
    ) {

        insights.push(
            `Your savings rate was ${data.savingsRate.toFixed(1)}%. There may be room to increase the amount you retain after expenses.`
        );

    } else {

        insights.push(
            "Your expenses exceeded your income during this period, resulting in a negative savings rate."
        );

    }


    // -----------------------------
    // Highest Spending Category
    // -----------------------------

    const categoryTotals =
        new Map();


    expenseTransactions.forEach(
        transaction => {

            const categoryName =
                getCategoryName(
                    transaction.categoryId
                );


            categoryTotals.set(
                categoryName,
                (
                    categoryTotals.get(
                        categoryName
                    ) || 0
                ) +
                Number(
                    transaction.amount || 0
                )
            );

        }
    );


    const sortedCategories =
        Array.from(
            categoryTotals.entries()
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    if (
        sortedCategories.length > 0
    ) {

        const highestCategory =
            sortedCategories[0];


        insights.push(
            `${highestCategory[0]} was your highest spending category at ${formatCurrency(highestCategory[1])}.`
        );

    }


    // -----------------------------
    // Transaction Count
    // -----------------------------

    insights.push(
        `The selected period contains ${incomeTransactions.length} income transaction${incomeTransactions.length === 1 ? "" : "s"} and ${expenseTransactions.length} expense transaction${expenseTransactions.length === 1 ? "" : "s"}.`
    );


    container.innerHTML =
        insights
            .map(
                insight => `
                    <p>
                        ${escapeHtml(
                            insight
                        )}
                    </p>
                `
            )
            .join("");

}


// ================================
// Date Presets
// ================================

function setDateRange(
    fromDate,
    toDate
) {

    document.getElementById(
        "report-from-date"
    ).value = fromDate;


    document.getElementById(
        "report-to-date"
    ).value = toDate;

}


// ================================
// Format Date Input
// ================================

function dateToInputValue(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


// ================================
// This Month
// ================================

function setThisMonth() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    setDateRange(
        dateToInputValue(firstDay),
        dateToInputValue(today)
    );

}


// ================================
// Last Month
// ================================

function setLastMonth() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
        );


    const lastDay =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            0
        );


    setDateRange(
        dateToInputValue(firstDay),
        dateToInputValue(lastDay)
    );

}


// ================================
// Last 3 Months
// ================================

function setLastThreeMonths() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth() - 2,
            1
        );


    setDateRange(
        dateToInputValue(firstDay),
        dateToInputValue(today)
    );

}


// ================================
// This Year
// ================================

function setThisYear() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            0,
            1
        );


    setDateRange(
        dateToInputValue(firstDay),
        dateToInputValue(today)
    );

}
// ================================
// PDF Export
// ================================

// ================================
// PDF Export
// ================================

function downloadPdfReport() {

    if (!currentReportData) {
        showToast("Please generate the report first.");
        return;
    }

    if (!window.jspdf) {
        showToast("PDF library could not be loaded.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    const data = currentReportData;

    const pageWidth = 210;
    const leftMargin = 20;
    const rightMargin = 20;
    const contentWidth =
        pageWidth - leftMargin - rightMargin;

    let y = 20;


    // ================================
    // Helper Functions
    // ================================

    function addPageIfNeeded(requiredHeight = 10) {

        if (y + requiredHeight > 275) {

            pdf.addPage();

            y = 20;

        }

    }


    function addText(
        text,
        fontSize = 10,
        x = leftMargin,
        spacing = 6
    ) {

        pdf.setFontSize(fontSize);

        pdf.text(
            String(text),
            x,
            y
        );

        y += spacing;

    }


    function addWrappedText(
        text,
        fontSize = 10
    ) {

        pdf.setFontSize(fontSize);

        const lines =
            pdf.splitTextToSize(
                String(text),
                contentWidth
            );

        lines.forEach(line => {

            addPageIfNeeded(7);

            pdf.text(
                line,
                leftMargin,
                y
            );

            y += 5;

        });

        y += 2;

    }


    function formatPdfCurrency(amount) {

        return `INR ${Number(
            amount || 0
        ).toFixed(2)}`;

    }


    // ================================
    // Report Header
    // ================================

    pdf.setFontSize(20);

    pdf.text(
        "SMART EXPENSE",
        leftMargin,
        y
    );

    y += 8;

    pdf.setFontSize(14);

    pdf.text(
        "Financial Report",
        leftMargin,
        y
    );

    y += 5;

    pdf.line(
        leftMargin,
        y,
        pageWidth - rightMargin,
        y
    );

    y += 10;


    // ================================
    // Report Period
    // ================================

    pdf.setFontSize(10);

    pdf.text(
        "REPORT PERIOD",
        leftMargin,
        y
    );

    y += 6;

    pdf.setFontSize(11);

    pdf.text(
        `${formatDate(data.fromDate)} - ${formatDate(data.toDate)}`,
        leftMargin,
        y
    );

    y += 12;


    // ================================
    // Financial Summary
    // ================================

    addPageIfNeeded(45);

    pdf.setFontSize(14);

    pdf.text(
        "FINANCIAL SUMMARY",
        leftMargin,
        y
    );

    y += 8;


    const summaryStartY = y;

    const summaryRows = [
        [
            "Total Income",
            formatPdfCurrency(data.totalIncome)
        ],
        [
            "Total Expenses",
            formatPdfCurrency(data.totalExpenses)
        ],
        [
            "Net Balance",
            formatPdfCurrency(data.balance)
        ],
        [
            "Savings Rate",
            `${data.savingsRate.toFixed(1)}%`
        ]
    ];


    pdf.setFontSize(10);

    summaryRows.forEach(
        ([label, value]) => {

            pdf.text(
                label,
                leftMargin + 5,
                y
            );

            pdf.text(
                value,
                pageWidth - rightMargin - 5,
                y,
                {
                    align: "right"
                }
            );

            y += 7;

        }
    );


    pdf.rect(
        leftMargin,
        summaryStartY - 5,
        contentWidth,
        34
    );

    y += 10;


    // ================================
    // Transaction Summary
    // ================================

    addPageIfNeeded(35);

    pdf.setFontSize(14);

    pdf.text(
        "TRANSACTION SUMMARY",
        leftMargin,
        y
    );

    y += 9;

    pdf.setFontSize(10);

    pdf.text(
        `Income Transactions: ${data.incomeTransactions.length}`,
        leftMargin,
        y
    );

    y += 7;

    pdf.text(
        `Expense Transactions: ${data.expenseTransactions.length}`,
        leftMargin,
        y
    );

    y += 12;


    // ================================
    // Financial Insights
    // ================================

    addPageIfNeeded(35);

    pdf.setFontSize(14);

    pdf.text(
        "FINANCIAL INSIGHTS",
        leftMargin,
        y
    );

    y += 9;


    const insightsContainer =
        document.getElementById(
            "report-insights"
        );


    if (insightsContainer) {

        const insights =
            insightsContainer.querySelectorAll(
                "p"
            );


        if (insights.length === 0) {

            addText(
                "No financial insights available.",
                10
            );

        } else {

            insights.forEach(
                insight => {

                    addPageIfNeeded(15);

                    pdf.setFontSize(10);

                    pdf.text(
                        "•",
                        leftMargin,
                        y
                    );

                    const lines =
                        pdf.splitTextToSize(
                            insight.textContent.trim(),
                            contentWidth - 8
                        );

                    lines.forEach(
                        (line, index) => {

                            addPageIfNeeded(7);

                            pdf.text(
                                line,
                                leftMargin + 7,
                                y
                            );

                            y += 5;

                        }
                    );

                    y += 3;

                }
            );

        }

    }


    // ================================
    // Footer
    // ================================

    const totalPages =
        pdf.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        pdf.setPage(page);

        pdf.setFontSize(8);

        pdf.text(
            `Smart Expense Manager | Page ${page} of ${totalPages}`,
            pageWidth / 2,
            287,
            {
                align: "center"
            }
        );

    }


    // ================================
    // Download
    // ================================

    pdf.save(
        "smart-expense-financial-report.pdf"
    );

    showToast(
        "PDF report downloaded successfully."
    );
}


// ================================
// CSV Export
// ================================

function exportCsvReport() {

    if (!currentReportData) {
        showToast("Please generate the report first.");
        return;
    }

    const data = currentReportData;

    const rows = [];

    rows.push([
        "Smart Expense Financial Report"
    ]);

    rows.push([
        "Report Period",
        `${data.fromDate} to ${data.toDate}`
    ]);

    rows.push([]);

    rows.push([
        "Financial Summary"
    ]);

    rows.push([
        "Total Income",
        data.totalIncome.toFixed(2)
    ]);

    rows.push([
        "Total Expenses",
        data.totalExpenses.toFixed(2)
    ]);

    rows.push([
        "Net Balance",
        data.balance.toFixed(2)
    ]);

    rows.push([
        "Savings Rate",
        `${data.savingsRate.toFixed(1)}%`
    ]);

    rows.push([]);

    // Income Report

    rows.push([
        "Income Report"
    ]);

    rows.push([
        "Date",
        "Category",
        "Description",
        "Amount"
    ]);

    data.incomeTransactions.forEach(
        transaction => {

            rows.push([
                formatDate(
                    transaction.transactionDate
                ),
                getCategoryName(
                    transaction.categoryId
                ),
                transaction.description || "",
                Number(
                    transaction.amount || 0
                ).toFixed(2)
            ]);

        }
    );

    rows.push([]);

    // Expense Report

    rows.push([
        "Expense Report"
    ]);

    rows.push([
        "Date",
        "Category",
        "Description",
        "Amount"
    ]);

    data.expenseTransactions.forEach(
        transaction => {

            rows.push([
                formatDate(
                    transaction.transactionDate
                ),
                getCategoryName(
                    transaction.categoryId
                ),
                transaction.description || "",
                Number(
                    transaction.amount || 0
                ).toFixed(2)
            ]);

        }
    );

    rows.push([]);

    // Category Summary

    rows.push([
        "Category Summary"
    ]);

    rows.push([
        "Category",
        "Amount",
        "Percentage"
    ]);

    const categoryTotals = new Map();

    data.expenseTransactions.forEach(
        transaction => {

            const category =
                getCategoryName(
                    transaction.categoryId
                );

            const current =
                categoryTotals.get(category) || 0;

            categoryTotals.set(
                category,
                current +
                Number(
                    transaction.amount || 0
                )
            );

        }
    );

    Array.from(
        categoryTotals.entries()
    )
    .sort(
        (a, b) => b[1] - a[1]
    )
    .forEach(
        ([category, amount]) => {

            const percentage =
                data.totalExpenses > 0
                    ? (
                        amount /
                        data.totalExpenses
                    ) * 100
                    : 0;

            rows.push([
                category,
                amount.toFixed(2),
                `${percentage.toFixed(1)}%`
            ]);

        }
    );


    const csvContent =
        rows
            .map(row =>
                row
                    .map(value => {

                        const text =
                            String(
                                value ?? ""
                            );

                        return `"${text.replace(
                            /"/g,
                            '""'
                        )}"`;

                    })
                    .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "smart-expense-financial-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showToast(
        "CSV report exported successfully."
    );
}

// ================================
// Toast
// ================================

function showToast(message) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ================================
// Button Events
// ================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "generate-report-btn"
        )?.addEventListener(
            "click",
            generateReport
        );


        document.getElementById(
            "report-this-month-btn"
        )?.addEventListener(
            "click",
            async () => {

                setThisMonth();

                await generateReport();

            }
        );


        document.getElementById(
            "report-last-month-btn"
        )?.addEventListener(
            "click",
            async () => {

                setLastMonth();

                await generateReport();

            }
        );


        document.getElementById(
            "report-last-three-months-btn"
        )?.addEventListener(
            "click",
            async () => {

                setLastThreeMonths();

                await generateReport();

            }
        );


        document.getElementById(
            "report-this-year-btn"
        )?.addEventListener(
            "click",
            async () => {

                setThisYear();

                await generateReport();

            }
        );


        document.getElementById(
    "download-pdf-btn"
)?.addEventListener(
    "click",
    downloadPdfReport
);


document.getElementById(
    "export-csv-btn"
)?.addEventListener(
    "click",
    exportCsvReport
);

        loadReportData();

    }
);