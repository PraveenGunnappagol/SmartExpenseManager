#include "api/UserRoutes.h"

#include "managers/UserManager.h"
#include "managers/AuthManager.h"

#include "crow/middlewares/cors.h"

void registerUserRoutes(
    crow::App<crow::CORSHandler>& app,
    UserManager& userManager,
    AuthManager& authManager
)
{
    // POST /api/users/register
CROW_ROUTE(app, "/api/users/register")
.methods("POST"_method)
([&userManager](const crow::request& request)
{
    auto body = crow::json::load(request.body);

    if (!body)
    {
        return crow::response(
            400,
            "Invalid JSON"
        );
    }

    if (!body.has("username") ||
        !body.has("email") ||
        !body.has("password"))
    {
        return crow::response(
            400,
            "Username, email and password are required"
        );
    }

    std::string username =
        body["username"].s();

    std::string email =
        body["email"].s();

    std::string password =
        body["password"].s();

    std::string result =
        userManager.registerUser(
            username,
            email,
            password
        );

    if (result == "username_exists")
    {
        return crow::response(
            409,
            "Username already exists"
        );
    }

    if (result == "email_exists")
    {
        return crow::response(
            409,
            "Email already exists"
        );
    }

    if (result == "invalid_input")
    {
        return crow::response(
            400,
            "Username, email and password are required"
        );
    }

    if (result == "database_error")
    {
        return crow::response(
            500,
            "Registration failed due to a server error"
        );
    }

    crow::json::wvalue response;

    response["message"] =
        "Account created successfully";

    return crow::response(
        201,
        response.dump()
    );
});
    // POST /api/users/login
CROW_ROUTE(app, "/api/users/login")
.methods("POST"_method)
([&userManager, &authManager](const crow::request& request)
{
    auto body = crow::json::load(request.body);

    if (!body)
    {
        return crow::response(
            400,
            "Invalid JSON"
        );
    }

    if (!body.has("username") ||
        !body.has("password"))
    {
        return crow::response(
            400,
            "Username and password are required"
        );
    }

    std::string username =
        body["username"].s();

    std::string password =
        body["password"].s();

    int userId =
        userManager.loginUser(
            username,
            password
        );

    if (userId == -1)
    {
        return crow::response(
            401,
            "Invalid username or password"
        );
    }
    std::string token =
    authManager.createSession(userId);
    crow::json::wvalue response;

    response["message"] =
        "Login successful";

    response["userId"] =
        userId;
    response["token"] =
    token;
    return crow::response(
        200,
        response.dump()
    );
});
// POST /api/users/logout
CROW_ROUTE(app, "/api/users/logout")
    .methods("POST"_method)
    ([&authManager](const crow::request& request)
{
    std::string authHeader =
        request.get_header_value("Authorization");

    if (authHeader.rfind("Bearer ", 0) != 0)
    {
        return crow::response(
            401,
            "Unauthorized"
        );
    }

    std::string token =
        authHeader.substr(7);

    int userId = 0;

    if (!authManager.validateSession(
            token,
            userId))
    {
        return crow::response(
            401,
            "Invalid or expired session"
        );
    }

    authManager.removeSession(token);

    crow::json::wvalue response;

    response["message"] =
        "Logout successful";

    return crow::response(
        200,
        response.dump()
    );
});
}