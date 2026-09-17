#include "managers/AuthManager.h"

#include <random>
#include <sstream>
#include <iomanip>

std::string AuthManager::createSession(int userId)
{
    if (userId <= 0)
        return "";

    std::random_device randomDevice;
    std::mt19937 generator(randomDevice());
    std::uniform_int_distribution<unsigned int> distribution(
        0,
        0xFFFFFFFF
    );

    std::stringstream token;

    for (int i = 0; i < 4; ++i)
    {
        token << std::hex
              << std::setw(8)
              << std::setfill('0')
              << distribution(generator);
    }

    std::string sessionToken = token.str();

    {
        std::lock_guard<std::mutex> lock(sessionsMutex);

        sessions[sessionToken] = userId;
    }

    return sessionToken;
}

bool AuthManager::validateSession(
    const std::string& token,
    int& userId
)
{
    if (token.empty())
        return false;

    std::lock_guard<std::mutex> lock(sessionsMutex);

    auto iterator =
        sessions.find(token);

    if (iterator == sessions.end())
        return false;

    userId = iterator->second;

    return true;
}

void AuthManager::removeSession(
    const std::string& token
)
{
    if (token.empty())
        return;

    std::lock_guard<std::mutex> lock(sessionsMutex);

    sessions.erase(token);
}