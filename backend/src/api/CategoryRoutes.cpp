#include "api/CategoryRoutes.h"
#include "managers/CategoryManager.h"
#include "managers/AuthManager.h"
#include "crow/middlewares/cors.h"

void registerCategoryRoutes(
    crow::App<crow::CORSHandler>& app,
    CategoryManager& categoryManager,
    AuthManager& authManager
)
{
    CROW_ROUTE(app, "/api/categories")
    .methods(crow::HTTPMethod::GET)
    ([&categoryManager, &authManager](
        const crow::request& req)
{
    std::string authHeader =
        req.get_header_value("Authorization");

    if (authHeader.rfind("Bearer ", 0) != 0)
    {
        return crow::response(
            401,
            "Unauthorized"
        );
    }

    std::string token =
        authHeader.substr(7);

    int authenticatedUserId = 0;

    if (!authManager.validateSession(
            token,
            authenticatedUserId))
    {
        return crow::response(
            401,
            "Invalid or expired session"
        );
    }

    auto categories =
    categoryManager.getCategories();

    crow::json::wvalue response =
        crow::json::wvalue::list();

    int index = 0;

    for (const auto& category : categories)
{
    if (category == nullptr)
        continue;

    response[index]["id"] =
        category->getId();

    response[index]["name"] =
        category->getName();

    ++index;
}

    return crow::response(
        200,
        response.dump()
    );
});

    // POST /api/categories
    CROW_ROUTE(app, "/api/categories")
    .methods("POST"_method)
    ([&categoryManager](const crow::request& request)
    {
        auto body =
            crow::json::load(request.body);

        if (!body)
        {
            return crow::response(
                400,
                "Invalid JSON"
            );
        }

        if (!body.has("name"))
        {
            return crow::response(
                400,
                "Missing category name"
            );
        }

        std::string categoryName =
            body["name"].s();

        if (categoryName.empty())
        {
            return crow::response(
                400,
                "Category name cannot be empty"
            );
        }

        int categoryId =
            categoryManager.getOrCreateCategory(
                categoryName
            );

        if (categoryId == -1)
        {
            return crow::response(
                500,
                "Failed to create category"
            );
        }

        crow::json::wvalue response;

        response["id"] = categoryId;
        response["name"] = categoryName;

        return crow::response(
            200,
            response.dump()
        );
    });
}