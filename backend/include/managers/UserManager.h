#ifndef USER_MANAGER_H
#define USER_MANAGER_H

#include "database/DatabaseManager.h"
#include "models/User.h"

#include <string>

class UserManager
{
public:
    explicit UserManager(DatabaseManager& databaseManager);

    std::string registerUser(
    const std::string& username,
    const std::string& email,
    const std::string& password
);
    int loginUser(
        const std::string& username,
        const std::string& password
    );

    bool userExists(const std::string& username);
    bool emailExists(const std::string& email);
private:
    DatabaseManager& databaseManager;
};

#endif