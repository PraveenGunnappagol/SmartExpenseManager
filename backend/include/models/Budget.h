#ifndef BUDGET_H
#define BUDGET_H

#include <string>

class Budget
{
public:
    Budget();

    Budget(
        int id,
        int userId,
        double amount,
        const std::string& month
    );

    int getId() const;

    int getUserId() const;

    double getAmount() const;

    std::string getMonth() const;

private:
    int id;
    int userId;
    double amount;
    std::string month;
};

#endif