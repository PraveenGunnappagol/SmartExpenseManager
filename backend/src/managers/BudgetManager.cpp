#include "managers/BudgetManager.h"

#include <iostream>


BudgetManager::BudgetManager(
    DatabaseManager& databaseManager
)
    : databaseManager(databaseManager)
{
}


// -----------------------------
// Add Budget
// -----------------------------

bool BudgetManager::addBudget(
    int userId,
    double amount,
    const std::string& month
)
{
    try
    {
        if (userId <= 0 ||
            amount <= 0 ||
            month.empty())
        {
            std::cerr
                << "Invalid budget data."
                << std::endl;

            return false;
        }

        if (!userExists(userId))
        {
            std::cerr
                << "User does not exist."
                << std::endl;

            return false;
        }

        auto statement =
            databaseManager.getSession().sql(
                "INSERT INTO budgets "
                "(user_id, category_id, amount, month) "
                "VALUES (?, NULL, ?, ?)"
            );

        statement.bind(
            userId,
            amount,
            month
        );

        statement.execute();

        std::cout
            << "Budget added successfully."
            << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to add budget: "
            << error.what()
            << std::endl;

        return false;
    }
}


// -----------------------------
// Check User
// -----------------------------

bool BudgetManager::userExists(
    int userId
)
{
    try
    {
        auto statement =
            databaseManager.getSession().sql(
                "SELECT id "
                "FROM users "
                "WHERE id = ?"
            );

        statement.bind(userId);

        auto result =
            statement.execute();

        return result.count() > 0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to validate user: "
            << error.what()
            << std::endl;

        return false;
    }
}


// -----------------------------
// Get Budgets
// -----------------------------

std::vector<Budget>
BudgetManager::getBudgets(
    int userId
)
{
    std::vector<Budget> budgets;

    try
    {
        if (userId <= 0)
        {
            return budgets;
        }

        if (!userExists(userId))
        {
            return budgets;
        }

        auto result =
            databaseManager.getSession().sql(
                "SELECT "
                "id, "
                "user_id, "
                "amount, "
                "DATE_FORMAT(month, '%Y-%m-%d') "
                "FROM budgets "
                "WHERE user_id = ? "
                "AND category_id IS NULL "
                "ORDER BY month DESC, id DESC"
            )
            .bind(userId)
            .execute();

        for (auto row : result)
        {
            int id =
                row[0].get<int>();

            int budgetUserId =
                row[1].get<int>();

            double amount =
                row[2].get<double>();

            std::string month =
                row[3].get<std::string>();

            Budget budget(
                id,
                budgetUserId,
                amount,
                month
            );

            budgets.push_back(budget);
        }
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to retrieve budgets: "
            << error.what()
            << std::endl;
    }

    return budgets;
}


// -----------------------------
// Get Budget Status
// -----------------------------

std::vector<BudgetStatus>
BudgetManager::getBudgetStatus(
    int userId
)
{
    std::vector<BudgetStatus> statuses;

    if (userId <= 0)
    {
        return statuses;
    }

    if (!userExists(userId))
    {
        return statuses;
    }

    try
    {
        auto result =
            databaseManager.getSession().sql(
                "SELECT "
                "b.id, "
                "b.amount, "
                "COALESCE(SUM(t.amount), 0), "
                "DATE_FORMAT(b.month, '%Y-%m-%d') "
                "FROM budgets b "
                "LEFT JOIN transactions t "
                "ON t.user_id = b.user_id "
                "AND t.type = 'expense' "
                "AND DATE_FORMAT("
                "t.transaction_date, '%Y-%m'"
                ") = DATE_FORMAT("
                "b.month, '%Y-%m'"
                ") "
                "WHERE b.user_id = ? "
                "AND b.category_id IS NULL "
                "GROUP BY "
                "b.id, "
                "b.amount, "
                "b.month "
                "ORDER BY b.month DESC, b.id DESC"
            )
            .bind(userId)
            .execute();

        for (auto row : result)
        {
            BudgetStatus status;

            status.budgetId =
                row[0].get<int>();

            status.budgetAmount =
                row[1].get<double>();

            status.spentAmount =
                row[2].get<double>();

            status.remainingAmount =
                status.budgetAmount -
                status.spentAmount;

            status.month =
                row[3].get<std::string>();

            double percentage = 0.0;

            if (status.budgetAmount > 0.0)
            {
                percentage =
                    (
                        status.spentAmount /
                        status.budgetAmount
                    ) * 100.0;
            }

            if (percentage >= 100.0)
            {
                status.status =
                    "over_budget";
            }
            else if (percentage >= 80.0)
            {
                status.status =
                    "close_to_budget";
            }
            else
            {
                status.status =
                    "within_budget";
            }

            statuses.push_back(status);
        }
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to calculate budget status: "
            << error.what()
            << std::endl;
    }

    return statuses;
}


// -----------------------------
// Update Budget
// -----------------------------

bool BudgetManager::updateBudget(
    int budgetId,
    int userId,
    double amount,
    const std::string& month
)
{
    try
    {
        if (budgetId <= 0 ||
            userId <= 0 ||
            amount <= 0 ||
            month.empty())
        {
            std::cerr
                << "Invalid budget data."
                << std::endl;

            return false;
        }

        if (!userExists(userId))
        {
            std::cerr
                << "User does not exist."
                << std::endl;

            return false;
        }

        auto statement =
            databaseManager.getSession().sql(
                "UPDATE budgets "
                "SET amount = ?, "
                "month = ? "
                "WHERE id = ? "
                "AND user_id = ? "
                "AND category_id IS NULL"
            );

        statement.bind(
            amount,
            month,
            budgetId,
            userId
        );

        auto result =
            statement.execute();

        if (result.getAffectedItemsCount() == 0)
        {
            std::cerr
                << "Budget not found."
                << std::endl;

            return false;
        }

        std::cout
            << "Budget updated successfully."
            << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to update budget: "
            << error.what()
            << std::endl;

        return false;
    }
}


// -----------------------------
// Delete Budget
// -----------------------------

bool BudgetManager::deleteBudget(
    int budgetId,
    int userId
)
{
    try
    {
        if (budgetId <= 0 ||
            userId <= 0)
        {
            return false;
        }

        if (!userExists(userId))
        {
            return false;
        }

        auto statement =
            databaseManager.getSession().sql(
                "DELETE FROM budgets "
                "WHERE id = ? "
                "AND user_id = ? "
                "AND category_id IS NULL"
            );

        statement.bind(
            budgetId,
            userId
        );

        auto result =
            statement.execute();

        if (result.getAffectedItemsCount() == 0)
        {
            std::cerr
                << "Budget not found."
                << std::endl;

            return false;
        }

        std::cout
            << "Budget deleted successfully."
            << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to delete budget: "
            << error.what()
            << std::endl;

        return false;
    }
}