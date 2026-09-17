#include "managers/AnalyticsManager.h"

#include <iostream>

AnalyticsManager::AnalyticsManager(
    DatabaseManager& databaseManager
)
    : databaseManager(databaseManager)
{
}

bool AnalyticsManager::userExists(int userId)
{
    try
    {
        auto statement = databaseManager.getSession().sql(
            "SELECT id "
            "FROM users "
            "WHERE id = ?"
        );

        statement.bind(userId);

        auto result = statement.execute();

        return result.count() > 0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to check user: "
                  << error.what()
                  << std::endl;

        return false;
    }
}

double AnalyticsManager::getTotalIncome(int userId)
{
    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return 0.0;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return 0.0;
        }

        auto statement = databaseManager.getSession().sql(
            "SELECT COALESCE(SUM(amount), 0) "
            "FROM transactions "
            "WHERE user_id = ? "
            "AND type = 'income' "
            "AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "AND transaction_date < DATE_ADD("
            "DATE_FORMAT(CURDATE(), '%Y-%m-01'), "
            "INTERVAL 1 MONTH)"
        );

        statement.bind(userId);

        auto result = statement.execute();

        for (auto row : result)
        {
            return row[0].get<double>();
        }

        return 0.0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate total income: "
                  << error.what()
                  << std::endl;

        return 0.0;
    }
}

double AnalyticsManager::getTotalExpenses(int userId)
{
    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return 0.0;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return 0.0;
        }

        auto statement = databaseManager.getSession().sql(
            "SELECT COALESCE(SUM(amount), 0) "
            "FROM transactions "
            "WHERE user_id = ? "
            "AND type = 'expense' "
            "AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "AND transaction_date < DATE_ADD("
            "DATE_FORMAT(CURDATE(), '%Y-%m-01'), "
            "INTERVAL 1 MONTH)"
        );

        statement.bind(userId);

        auto result = statement.execute();

        for (auto row : result)
        {
            return row[0].get<double>();
        }

        return 0.0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate total expenses: "
                  << error.what()
                  << std::endl;

        return 0.0;
    }
}

double AnalyticsManager::getBalance(int userId)
{
    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return 0.0;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return 0.0;
        }

        double totalIncome =
            getTotalIncome(userId);

        double totalExpenses =
            getTotalExpenses(userId);

        return totalIncome - totalExpenses;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate balance: "
                  << error.what()
                  << std::endl;

        return 0.0;
    }
}

std::vector<CategorySpending>
AnalyticsManager::getCategorySpending(int userId)
{
    std::vector<CategorySpending> spending;

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return spending;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return spending;
        }

        auto result = databaseManager.getSession().sql(
            "SELECT c.name, "
            "SUM(t.amount) "
            "FROM transactions t "
            "JOIN categories c "
            "ON t.category_id = c.id "
            "WHERE t.user_id = ? "
            "AND t.type = 'expense' "
            "GROUP BY c.id, c.name "
            "ORDER BY SUM(t.amount) DESC"
        ).bind(userId).execute();

        for (auto row : result)
        {
            std::string categoryName =
                row[0].get<std::string>();

            double totalAmount =
                row[1].get<double>();

            CategorySpending categorySpending;

            categorySpending.categoryName =
                categoryName;

            categorySpending.totalAmount =
                totalAmount;

            spending.push_back(categorySpending);
        }

        return spending;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate category spending: "
                  << error.what()
                  << std::endl;

        return spending;
    }
}

std::vector<SpendingTrend>
AnalyticsManager::getDailySpending(int userId)
{
    std::vector<SpendingTrend> trends;

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return trends;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return trends;
        }

        auto result = databaseManager.getSession().sql(
            "SELECT DATE_FORMAT(transaction_date, '%Y-%m-%d'), "
            "SUM(amount) "
            "FROM transactions "
            "WHERE user_id = ? "
            "AND type = 'expense' "
            "GROUP BY transaction_date "
            "ORDER BY transaction_date"
        ).bind(userId).execute();

        for (auto row : result)
        {
            SpendingTrend trend;

            trend.date =
                row[0].get<std::string>();

            trend.totalAmount =
                row[1].get<double>();

            trends.push_back(trend);
        }

        return trends;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate daily spending: "
                  << error.what()
                  << std::endl;

        return trends;
    }
}

std::vector<SpendingTrend>
AnalyticsManager::getMonthlySpending(int userId)
{
    std::vector<SpendingTrend> trends;

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return trends;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return trends;
        }

        auto result = databaseManager.getSession().sql(
            "SELECT DATE_FORMAT(transaction_date, '%Y-%m'), "
            "SUM(amount) "
            "FROM transactions "
            "WHERE user_id = ? "
            "AND type = 'expense' "
            "GROUP BY DATE_FORMAT(transaction_date, '%Y-%m') "
            "ORDER BY DATE_FORMAT(transaction_date, '%Y-%m')"
        ).bind(userId).execute();

        for (auto row : result)
        {
            SpendingTrend trend;

            trend.date =
                row[0].get<std::string>();

            trend.totalAmount =
                row[1].get<double>();

            trends.push_back(trend);
        }

        return trends;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate monthly spending: "
                  << error.what()
                  << std::endl;

        return trends;
    }
}

std::string
AnalyticsManager::getHighestSpendingCategory(int userId)
{
    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return "";
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return "";
        }

        auto result = databaseManager.getSession().sql(
            "SELECT c.name "
            "FROM transactions t "
            "JOIN categories c "
            "ON t.category_id = c.id "
            "WHERE t.user_id = ? "
            "AND t.type = 'expense' "
            "GROUP BY c.id, c.name "
            "ORDER BY SUM(t.amount) DESC "
            "LIMIT 1"
        ).bind(userId).execute();

        for (auto row : result)
        {
            return row[0].get<std::string>();
        }

        return "";
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to find highest spending category: "
                  << error.what()
                  << std::endl;

        return "";
    }
}

UnusualSpendingResult
AnalyticsManager::getUnusualSpending(int userId)
{
    UnusualSpendingResult resultData;

    resultData.unusualSpending = false;
    resultData.averageExpense = 0.0;
    resultData.largestExpense = 0.0;

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return resultData;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return resultData;
        }

        auto statement =
            databaseManager.getSession().sql(
                "SELECT "
                "COALESCE(AVG(amount), 0), "
                "COALESCE(STDDEV_POP(amount), 0), "
                "COALESCE(MAX(amount), 0) "
                "FROM transactions "
                "WHERE user_id = ? "
                "AND type = 'expense'"
            );

        statement.bind(userId);

        auto queryResult =
            statement.execute();

        for (auto row : queryResult)
        {
            double averageExpense =
                row[0].get<double>();

            double standardDeviation =
                row[1].get<double>();

            resultData.averageExpense =
                averageExpense;

            resultData.largestExpense =
                row[2].get<double>();

            if (averageExpense <= 0.0 ||
                standardDeviation <= 0.0)
            {
                return resultData;
            }

            resultData.unusualSpending =
    resultData.largestExpense >=
    (averageExpense * 2.0);

            return resultData;
        }

        return resultData;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to calculate unusual spending: "
            << error.what()
            << std::endl;

        return resultData;
    }
}
UnusualSpendingDetails
AnalyticsManager::getUnusualSpendingDetails(int userId)
{
    UnusualSpendingDetails details;

    details.unusualSpending = false;
    details.expenseAmount = 0.0;
    details.averageExpense = 0.0;
    details.multiplier = 0.0;
    details.categoryName = "";
    details.month = "";

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return details;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return details;
        }

        auto result =
            databaseManager.getSession().sql(
                "SELECT "
                "t.amount, "
                "COALESCE(c.name, 'Other'), "
                "DATE_FORMAT(t.transaction_date, '%M %Y'), "
                "(SELECT COALESCE(AVG(amount), 0) "
                " FROM transactions "
                " WHERE user_id = ? "
                " AND type = 'expense'), "
                "(SELECT COALESCE(STDDEV_POP(amount), 0) "
                " FROM transactions "
                " WHERE user_id = ? "
                " AND type = 'expense') "
                "FROM transactions t "
                "LEFT JOIN categories c "
                "ON t.category_id = c.id "
                "WHERE t.user_id = ? "
                "AND t.type = 'expense' "
                "ORDER BY t.amount DESC, "
                "t.transaction_date DESC, "
                "t.id DESC "
                "LIMIT 1"
            )
            .bind(userId)
            .bind(userId)
            .bind(userId)
            .execute();

        for (auto row : result)
        {
            details.expenseAmount =
                row[0].get<double>();

            details.categoryName =
                row[1].get<std::string>();

            details.month =
                row[2].get<std::string>();

            details.averageExpense =
                row[3].get<double>();

            double standardDeviation =
                row[4].get<double>();

            if (details.averageExpense <= 0.0 ||
                standardDeviation <= 0.0)
            {
                return details;
            }

            details.multiplier =
    details.expenseAmount /
    details.averageExpense;

details.unusualSpending =
    details.expenseAmount >=
    (details.averageExpense * 2.0);

            return details;
        }

        return details;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr
            << "Failed to calculate unusual spending details: "
            << error.what()
            << std::endl;

        return details;
    }
}
MonthlyComparison
AnalyticsManager::getMonthlyComparison(int userId)
{
    MonthlyComparison comparison{};

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return comparison;
        }

        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return comparison;
        }

        auto result = databaseManager.getSession().sql(
            "SELECT "
            "COALESCE(SUM(CASE "
            "WHEN type = 'income' "
            "AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "AND transaction_date < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
            "THEN amount ELSE 0 END), 0), "

            "COALESCE(SUM(CASE "
            "WHEN type = 'income' "
            "AND transaction_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
            "AND transaction_date < DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "THEN amount ELSE 0 END), 0), "

            "COALESCE(SUM(CASE "
            "WHEN type = 'expense' "
            "AND transaction_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "AND transaction_date < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
            "THEN amount ELSE 0 END), 0), "

            "COALESCE(SUM(CASE "
            "WHEN type = 'expense' "
            "AND transaction_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH) "
            "AND transaction_date < DATE_FORMAT(CURDATE(), '%Y-%m-01') "
            "THEN amount ELSE 0 END), 0) "

            "FROM transactions "
            "WHERE user_id = ?"
        ).bind(userId).execute();

        for (auto row : result)
        {
            comparison.currentIncome =
                row[0].get<double>();

            comparison.previousIncome =
                row[1].get<double>();

            comparison.currentExpenses =
                row[2].get<double>();

            comparison.previousExpenses =
                row[3].get<double>();

            comparison.currentBalance =
                comparison.currentIncome -
                comparison.currentExpenses;

            comparison.previousBalance =
                comparison.previousIncome -
                comparison.previousExpenses;

            if (comparison.currentIncome > 0.0)
            {
                comparison.currentSavingsRate =
                    (
                        (comparison.currentIncome -
                         comparison.currentExpenses)
                        / comparison.currentIncome
                    ) * 100.0;
            }
            else
            {
                comparison.currentSavingsRate = 0.0;
            }

            if (comparison.previousIncome > 0.0)
            {
                comparison.previousSavingsRate =
                    (
                        (comparison.previousIncome -
                         comparison.previousExpenses)
                        / comparison.previousIncome
                    ) * 100.0;
            }
            else
            {
                comparison.previousSavingsRate = 0.0;
            }

            return comparison;
        }

        return comparison;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to calculate monthly comparison: "
                  << error.what()
                  << std::endl;

        return comparison;
    }
}