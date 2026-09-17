#include "managers/UserManager.h"
#include <iostream>
#include "utils/PasswordUtils.h"

UserManager::UserManager(DatabaseManager& databaseManager)
    : databaseManager(databaseManager)
{
}

bool UserManager::userExists(const std::string& username)
{
    try
    {
        auto statement = databaseManager.getSession().sql(
            "SELECT id FROM users WHERE username = ?"
        );

        statement.bind(username);

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
bool UserManager::emailExists(const std::string& email)
{
    try
    {
        auto statement = databaseManager.getSession().sql(
            "SELECT id FROM users WHERE email = ?"
        );

        statement.bind(email);

        auto result = statement.execute();

        return result.count() > 0;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to check email: "
                  << error.what()
                  << std::endl;

        return false;
    }
}


std::string UserManager::registerUser(
    const std::string& username,
    const std::string& email,
    const std::string& password
)
{
    try
    {
        if (username.empty() ||
            email.empty() ||
            password.empty())
        {
            std::cerr << "Username, email and password are required."
                      << std::endl;

            return "invalid_input";
        }

        if (userExists(username))
        {
            std::cerr << "Username already exists."
                      << std::endl;

            return "username_exists";
        }

        if (emailExists(email))
        {
            std::cerr << "Email already exists."
                      << std::endl;

            return "email_exists";
        }

        std::string passwordHash =
            hashPassword(password);

        if (passwordHash.empty())
        {
            std::cerr << "Failed to hash password."
                      << std::endl;

            return "database_error";
        }

        auto statement =
            databaseManager.getSession().sql(
                "INSERT INTO users "
                "(username, email, password_hash) "
                "VALUES (?, ?, ?)"
            );

        statement.bind(
            username,
            email,
            passwordHash
        );

        statement.execute();

        std::cout << "User registered successfully."
                  << std::endl;

        return "success";
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to register user: "
                  << error.what()
                  << std::endl;

        return "database_error";
    }
}
int UserManager::loginUser(
    const std::string& username,
    const std::string& password
)
{
    try
    {
        auto statement = databaseManager.getSession().sql(
            "SELECT id, password_hash "
            "FROM users "
            "WHERE username = ?"
        );

        statement.bind(username);

        auto result = statement.execute();

        if (result.count() == 0)
        {
            std::cerr << "User not found."
                      << std::endl;

            return -1;
        }

        auto row = result.fetchOne();

        int userId =
            row[0].get<int>();

        std::string storedPassword =
            row[1].get<std::string>();

        std::string passwordHash =
            hashPassword(password);

        if (passwordHash.empty())
        {
            std::cerr << "Failed to hash password."
                      << std::endl;

            return -1;
        }

        if (storedPassword == passwordHash)
        {
            std::cout << "Login successful."
                      << std::endl;

            return userId;
        }

        std::cerr << "Invalid password."
                  << std::endl;

        return -1;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Login failed: "
                  << error.what()
                  << std::endl;

        return -1;
    }
}