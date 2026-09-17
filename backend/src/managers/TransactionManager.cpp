#include "managers/TransactionManager.h"

#include <iostream>

TransactionManager::TransactionManager(
    DatabaseManager& databaseManager
)
    : databaseManager(databaseManager)
{
}

bool TransactionManager::addTransaction(
    int userId,
    int categoryId,
    const std::string& type,
    double amount,
    const std::string& description,
    const std::string& transactionDate
)
{
    try
    {
        // Basic validation
        if (userId <= 0 ||
            categoryId <= 0 ||
            amount <= 0 ||
            transactionDate.empty())
        {
            std::cerr << "Invalid transaction data."
                      << std::endl;

            return false;
        }

        // Check that the user actually exists
        if (!userExists(userId))
        {
            std::cerr << "User does not exist."
                      << std::endl;

            return false;
        }

        // Check that the category actually exists
        if (!categoryExists(categoryId))
        {
            std::cerr << "Category does not exist."
                      << std::endl;

            return false;
        }

        // Validate transaction type
        if (type != "income" &&
            type != "expense")
        {
            std::cerr << "Transaction type must be "
                      << "income or expense."
                      << std::endl;

            return false;
        }

        auto statement = databaseManager.getSession().sql(
            "INSERT INTO transactions "
            "(user_id, category_id, type, amount, "
            "description, transaction_date) "
            "VALUES (?, ?, ?, ?, ?, ?)"
        );

        statement.bind(
            userId,
            categoryId,
            type,
            amount,
            description,
            transactionDate
        );

        statement.execute();

        std::cout << "Transaction added successfully."
                  << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to add transaction: "
                  << error.what()
                  << std::endl;

        return false;
    }
}
std::vector<Transaction> TransactionManager::getTransactions(
    int userId
)
{
    std::vector<Transaction> transactions;

    try
    {
        if (userId <= 0)
        {
            std::cerr << "Invalid user ID."
                      << std::endl;

            return transactions;
        }

        auto statement = databaseManager.getSession().sql(
            "SELECT id, user_id, category_id, type, "
            "amount, description, "
            "DATE_FORMAT(transaction_date, '%Y-%m-%d') "
            "FROM transactions "
            "WHERE user_id = ? "
            "ORDER BY transaction_date DESC, id DESC"
        );

        statement.bind(userId);

        auto result = statement.execute();

        for (auto row : result)
        {
            int id = row[0].get<int>();
            int transactionUserId = row[1].get<int>();
            int categoryId = row[2].get<int>();
            std::string type = row[3].get<std::string>();
            double amount = row[4].get<double>();

            std::string description;

            if (!row[5].isNull())
            {
                description = row[5].get<std::string>();
            }

            std::string transactionDate =
                     row[6].get<std::string>();

            Transaction transaction(
                id,
                transactionUserId,
                categoryId,
                type,
                amount,
                description,
                transactionDate
            );

            transactions.push_back(transaction);
        }

        return transactions;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to retrieve transactions: "
                  << error.what()
                  << std::endl;

        return transactions;
    }
}
bool TransactionManager::updateTransaction(
    int transactionId,
    int userId,
    int categoryId,
    const std::string& type,
    double amount,
    const std::string& description,
    const std::string& transactionDate
)
{
    try
    {
        if (transactionId <= 0 ||
            userId <= 0 ||
            categoryId <= 0 ||
            amount <= 0 ||
            transactionDate.empty())
        {
            std::cerr << "Invalid transaction data."
                      << std::endl;

            return false;
        }

        if (type != "income" &&
            type != "expense")
        {
            std::cerr << "Transaction type must be "
                      << "income or expense."
                      << std::endl;

            return false;
        }

        auto statement = databaseManager.getSession().sql(
            "UPDATE transactions "
            "SET category_id = ?, "
            "type = ?, "
            "amount = ?, "
            "description = ?, "
            "transaction_date = ? "
            "WHERE id = ? AND user_id = ?"
        );

        statement.bind(
            categoryId,
            type,
            amount,
            description,
            transactionDate,
            transactionId,
            userId
        );

        auto result = statement.execute();

        if (result.getAffectedItemsCount() == 0)
        {
            std::cerr << "Transaction not found "
                      << "or does not belong to the user."
                      << std::endl;

            return false;
        }

        std::cout << "Transaction updated successfully."
                  << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to update transaction: "
                  << error.what()
                  << std::endl;

        return false;
    }
}
bool TransactionManager::deleteTransaction(
    int transactionId,
    int userId
)
{
    try
    {
        if (transactionId <= 0 || userId <= 0)
        {
            std::cerr << "Invalid transaction or user ID."
                      << std::endl;

            return false;
        }

        auto statement = databaseManager.getSession().sql(
            "DELETE FROM transactions "
            "WHERE id = ? AND user_id = ?"
        );

        statement.bind(
            transactionId,
            userId
        );

        auto result = statement.execute();

        if (result.getAffectedItemsCount() == 0)
        {
            std::cerr << "Transaction not found "
                      << "or does not belong to the user."
                      << std::endl;

            return false;
        }

        std::cout << "Transaction deleted successfully."
                  << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to delete transaction: "
                  << error.what()
                  << std::endl;

        return false;
    }
}
bool TransactionManager::userExists(int userId)
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
        std::cerr << "Failed to validate user: "
                  << error.what()
                  << std::endl;

        return false;
    }
}

bool TransactionManager::categoryExists(int categoryId)
{
    try
    {
        auto statement = databaseManager.getSession().sql(
            "SELECT id "
            "FROM categories "
            "WHERE id = ?"
        );

        statement.bind(categoryId);

        auto result = statement.execute();

        return result.count() > 0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to validate category: "
                  << error.what()
                  << std::endl;

        return false;
    }
}