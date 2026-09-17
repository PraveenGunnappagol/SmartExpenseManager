#ifndef ANALYTICS_MANAGER_H
#define ANALYTICS_MANAGER_H

#include <string>
#include <vector>

#include "database/DatabaseManager.h"

struct CategorySpending
{
    std::string categoryName;
    double totalAmount;
};

struct SpendingTrend
{
    std::string date;
    double totalAmount;
};

struct MonthlyComparison
{
    double currentIncome;
    double previousIncome;

    double currentExpenses;
    double previousExpenses;

    double currentBalance;
    double previousBalance;

    double currentSavingsRate;
    double previousSavingsRate;
};
struct UnusualSpendingDetails
{
    bool unusualSpending;

    double expenseAmount;
    double averageExpense;
    double multiplier;

    std::string categoryName;
    std::string month;
};
struct UnusualSpendingResult
{
    bool unusualSpending;
    double averageExpense;
    double largestExpense;
};
class AnalyticsManager
{
public:
    explicit AnalyticsManager(DatabaseManager& databaseManager);

    double getTotalIncome(int userId);
    double getTotalExpenses(int userId);
    double getBalance(int userId);

    std::vector<CategorySpending> getCategorySpending(int userId);

    std::vector<SpendingTrend> getDailySpending(int userId);

    std::vector<SpendingTrend> getMonthlySpending(int userId);

    std::string getHighestSpendingCategory(int userId);
    UnusualSpendingResult getUnusualSpending(int userId);
    UnusualSpendingDetails getUnusualSpendingDetails(int userId);
    MonthlyComparison getMonthlyComparison(int userId);

private:
    DatabaseManager& databaseManager;

    bool userExists(int userId);
};

#endif