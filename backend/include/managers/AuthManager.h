#ifndef AUTH_MANAGER_H
#define AUTH_MANAGER_H

#include <string>
#include <unordered_map>
#include <mutex>

class AuthManager
{
public:
    AuthManager() = default;

    std::string createSession(int userId);

    bool validateSession(
        const std::string& token,
        int& userId
    );

    void removeSession(
        const std::string& token
    );

private:
    std::unordered_map<std::string, int> sessions;
    std::mutex sessionsMutex;
};

#endif