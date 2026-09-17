#ifndef DATABASE_MANAGER_H
#define DATABASE_MANAGER_H

#include <mysqlx/xdevapi.h>
#include <memory>
#include <string>

class DatabaseManager
{
public:
    DatabaseManager(
        const std::string& host,
        int port,
        const std::string& username,
        const std::string& password,
        const std::string& database
    );

    ~DatabaseManager();

    bool connect();
    void disconnect();

    bool isConnected() const;

    mysqlx::Session& getSession();
    void testCategories();

private:
    std::string host;
    int port;
    std::string username;
    std::string password;
    std::string database;

    std::unique_ptr<mysqlx::Session> session;
};

#endif