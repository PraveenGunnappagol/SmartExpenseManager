#ifndef USER_ROUTES_H
#define USER_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class UserManager;
class AuthManager;

void registerUserRoutes(
    crow::App<crow::CORSHandler>& app,
    UserManager& userManager,
    AuthManager& authManager
);

#endif