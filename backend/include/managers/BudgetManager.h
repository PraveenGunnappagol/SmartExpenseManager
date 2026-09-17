#ifndef BUDGET_MANAGER_H
#define BUDGET_MANAGER_H

#include "database/DatabaseManager.h"
#include "models/Budget.h"

#include <string>
#include <vector>

struct BudgetStatus
{
    int budgetId;
    double budgetAmount;
    double spentAmount;
    double remainingAmount;
    std::string month;
    std::string status;
};

class BudgetManager
{
public:
    explicit BudgetManager(
        DatabaseManager& databaseManager
    );

    bool addBudget(
        int userId,
        double amount,
        const std::string& month
    );

    std::vector<Budget> getBudgets(
        int userId
    );

    std::vector<BudgetStatus> getBudgetStatus(
        int userId
    );

    bool updateBudget(
        int budgetId,
        int userId,
        double amount,
        const std::string& month
    );

    bool deleteBudget(
        int budgetId,
        int userId
    );

private:
    DatabaseManager& databaseManager;

    bool userExists(
        int userId
    );
};

#endif