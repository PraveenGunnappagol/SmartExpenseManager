#include "models/User.h"

User::User()
    : id(0),
      username(""),
      email(""),
      passwordHash("")
{
}

User::User(
    int id,
    const std::string& username,
    const std::string& email,
    const std::string& passwordHash
)
    : id(id),
      username(username),
      email(email),
      passwordHash(passwordHash)
{
}

int User::getId() const
{
    return id;
}

std::string User::getUsername() const
{
    return username;
}

std::string User::getEmail() const
{
    return email;
}

std::string User::getPasswordHash() const
{
    return passwordHash;
}