#include "models/Transaction.h"

Transaction::Transaction()
    : id(0),
      userId(0),
      categoryId(0),
      type(""),
      amount(0.0),
      description(""),
      transactionDate("")
{
}

Transaction::Transaction(
    int id,
    int userId,
    int categoryId,
    const std::string& type,
    double amount,
    const std::string& description,
    const std::string& transactionDate
)
    : id(id),
      userId(userId),
      categoryId(categoryId),
      type(type),
      amount(amount),
      description(description),
      transactionDate(transactionDate)
{
}

int Transaction::getId() const
{
    return id;
}

int Transaction::getUserId() const
{
    return userId;
}

int Transaction::getCategoryId() const
{
    return categoryId;
}

std::string Transaction::getType() const
{
    return type;
}

double Transaction::getAmount() const
{
    return amount;
}

std::string Transaction::getDescription() const
{
    return description;
}

std::string Transaction::getTransactionDate() const
{
    return transactionDate;
}