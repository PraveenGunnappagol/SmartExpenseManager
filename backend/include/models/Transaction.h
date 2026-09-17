#ifndef TRANSACTION_H
#define TRANSACTION_H

#include <string>

class Transaction
{
public:
    Transaction();

    Transaction(
        int id,
        int userId,
        int categoryId,
        const std::string& type,
        double amount,
        const std::string& description,
        const std::string& transactionDate
    );

    int getId() const;
    int getUserId() const;
    int getCategoryId() const;
    std::string getType() const;
    double getAmount() const;
    std::string getDescription() const;
    std::string getTransactionDate() const;

private:
    int id;
    int userId;
    int categoryId;
    std::string type;
    double amount;
    std::string description;
    std::string transactionDate;
};

#endif