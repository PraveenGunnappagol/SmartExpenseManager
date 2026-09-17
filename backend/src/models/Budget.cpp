#include "models/Budget.h"

Budget::Budget()
    : id(0),
      userId(0),
      amount(0.0),
      month("")
{
}

Budget::Budget(
    int id,
    int userId,
    double amount,
    const std::string& month
)
    : id(id),
      userId(userId),
      amount(amount),
      month(month)
{
}

int Budget::getId() const
{
    return id;
}

int Budget::getUserId() const
{
    return userId;
}

double Budget::getAmount() const
{
    return amount;
}

std::string Budget::getMonth() const
{
    return month;
}