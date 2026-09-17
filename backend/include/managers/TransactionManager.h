#ifndef TRANSACTION_MANAGER_H
#define TRANSACTION_MANAGER_H

#include "database/DatabaseManager.h"
#include "models/Transaction.h"

#include <string>
#include <vector>

class TransactionManager
{
public:
    explicit TransactionManager(DatabaseManager& databaseManager);

    bool addTransaction(
        int userId,
        int categoryId,
        const std::string& type,
        double amount,
        const std::string& description,
        const std::string& transactionDate
    );
    std::vector<Transaction> getTransactions(int userId);
    bool updateTransaction(
        int transactionId,
        int userId,
        int categoryId,
        const std::string& type,
        double amount,
        const std::string& description,
        const std::string& transactionDate
    );
    bool deleteTransaction(
        int transactionId,
        int userId
    );

private:
    DatabaseManager& databaseManager;
    bool userExists(int userId);
    bool categoryExists(int categoryId);
};

#endif