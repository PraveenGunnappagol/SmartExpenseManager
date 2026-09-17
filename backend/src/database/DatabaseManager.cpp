#include "database/DatabaseManager.h"

#include <iostream>

DatabaseManager::DatabaseManager(
    const std::string& host,
    int port,
    const std::string& username,
    const std::string& password,
    const std::string& database
)
    : host(host),
      port(port),
      username(username),
      password(password),
      database(database)
{
}

DatabaseManager::~DatabaseManager()
{
    disconnect();
}

bool DatabaseManager::connect()
{
    try
    {
        session = std::make_unique<mysqlx::Session>(
            host,
            port,
            username,
            password
        );

        session->sql("USE " + database).execute();
        

        std::cout << "Database connected successfully."
                  << std::endl;

        return true;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Database connection failed: "
                  << error.what()
                  << std::endl;

        return false;
    }
}

void DatabaseManager::disconnect()
{
    if (session)
    {
        session->close();
        session.reset();

        std::cout << "Database connection closed."
                  << std::endl;
    }
}

bool DatabaseManager::isConnected() const
{
    return session != nullptr;
}

mysqlx::Session& DatabaseManager::getSession()
{
    thread_local std::unique_ptr<mysqlx::Session> threadSession;

    if (!threadSession)
    {
        threadSession = std::make_unique<mysqlx::Session>(
            host,
            port,
            username,
            password
        );

        threadSession->sql("USE " + database).execute();
    }

    return *threadSession;
}
void DatabaseManager::testCategories()
{
    if (!isConnected())
    {
        std::cerr << "Database is not connected."
                  << std::endl;
        return;
    }

    try
    {
        auto result = session->sql(
            "SELECT id, name FROM categories ORDER BY id"
        ).execute();

        std::cout << "\nCategories:" << std::endl;

        for (auto row : result)
        {
            std::cout << row[0].get<int>()
                      << " - "
                      << row[1].get<std::string>()
                      << std::endl;
        }
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Query failed: "
                  << error.what()
                  << std::endl;
    }
}