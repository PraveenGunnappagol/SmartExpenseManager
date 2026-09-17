#ifndef USER_H
#define USER_H

#include <string>

class User
{
public:
    User();

    User(
        int id,
        const std::string& username,
        const std::string& email,
        const std::string& passwordHash
    );

    int getId() const;
    std::string getUsername() const;
    std::string getEmail() const;
    std::string getPasswordHash() const;

private:
    int id;
    std::string username;
    std::string email;
    std::string passwordHash;
};

#endif