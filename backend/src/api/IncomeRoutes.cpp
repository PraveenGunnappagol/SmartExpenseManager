#include "api/IncomeRoutes.h"
#include "crow/middlewares/cors.h"
#include "managers/TransactionManager.h"
#include "managers/AuthManager.h"
#include "crow/middlewares/cors.h"

#ifdef DELETE
#undef DELETE
#endif
void registerIncomeRoutes(
    crow::App<crow::CORSHandler>& app,
    TransactionManager& transactionManager,
    AuthManager& authManager
)
{
    // GET /api/income/{userId}
CROW_ROUTE(app, "/api/income/<int>")
    .methods("GET"_method)
    ([&transactionManager, &authManager](
        const crow::request& request,
        int userId)
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

    if (authenticatedUserId != userId)
    {
        return crow::response(
            403,
            "Forbidden"
        );
    }

    auto transactions =
        transactionManager.getTransactions(
            authenticatedUserId
        );

    crow::json::wvalue response =
        crow::json::wvalue::list();

    int index = 0;

    for (const auto& transaction : transactions)
    {
        if (transaction.getType() != "income")
        {
            continue;
        }

        response[index]["id"] =
            transaction.getId();

        response[index]["userId"] =
            transaction.getUserId();

        response[index]["categoryId"] =
            transaction.getCategoryId();

        response[index]["type"] =
            transaction.getType();

        response[index]["amount"] =
            transaction.getAmount();

        response[index]["description"] =
            transaction.getDescription();

        response[index]["transactionDate"] =
            transaction.getTransactionDate();

        ++index;
    }

    return crow::response(
        200,
        response.dump()
    );
});


    // POST /api/income
CROW_ROUTE(app, "/api/income")
    .methods("POST"_method)
    ([&transactionManager, &authManager](
        const crow::request& request)
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

    auto body =
        crow::json::load(request.body);

    if (!body)
    {
        return crow::response(
            400,
            "Invalid JSON"
        );
    }

    if (!body.has("categoryId") ||
        !body.has("amount") ||
        !body.has("description") ||
        !body.has("transactionDate"))
    {
        return crow::response(
            400,
            "Missing required fields"
        );
    }

    int categoryId =
        body["categoryId"].i();

    double amount =
        body["amount"].d();

    std::string description =
        body["description"].s();

    std::string transactionDate =
        body["transactionDate"].s();

    bool success =
        transactionManager.addTransaction(
            authenticatedUserId,
            categoryId,
            "income",
            amount,
            description,
            transactionDate
        );

    if (!success)
    {
        return crow::response(
            400,
            "Failed to add income"
        );
    }

    crow::json::wvalue response;

    response["message"] =
        "Income added successfully";

    response["userId"] =
        authenticatedUserId;

    return crow::response(
        201,
        response.dump()
    );
});
        // PUT /api/income/{transactionId}
CROW_ROUTE(app, "/api/income/<int>")
    .methods("PUT"_method)
    ([&transactionManager, &authManager](
        const crow::request& request,
        int transactionId)
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

    auto body =
        crow::json::load(request.body);

    if (!body)
    {
        return crow::response(
            400,
            "Invalid JSON"
        );
    }

    if (!body.has("categoryId") ||
        !body.has("amount") ||
        !body.has("description") ||
        !body.has("transactionDate"))
    {
        return crow::response(
            400,
            "Missing required fields"
        );
    }

    int categoryId =
        body["categoryId"].i();

    double amount =
        body["amount"].d();

    std::string description =
        body["description"].s();

    std::string transactionDate =
        body["transactionDate"].s();

    bool success =
        transactionManager.updateTransaction(
            transactionId,
            authenticatedUserId,
            categoryId,
            "income",
            amount,
            description,
            transactionDate
        );

    if (!success)
    {
        return crow::response(
            404,
            "Income not found or update failed"
        );
    }

    crow::json::wvalue response;

    response["message"] =
        "Income updated successfully";

    response["userId"] =
        authenticatedUserId;

    return crow::response(
        200,
        response.dump()
    );
});
// DELETE /api/income/{transactionId}
CROW_ROUTE(app, "/api/income/<int>")
    .methods("DELETE"_method)
    ([&transactionManager, &authManager](
        const crow::request& request,
        int transactionId)
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

    bool success =
        transactionManager.deleteTransaction(
            transactionId,
            authenticatedUserId
        );

    if (!success)
    {
        return crow::response(
            404,
            "Income not found or delete failed"
        );
    }

    crow::json::wvalue response;

    response["message"] =
        "Income deleted successfully";

    return crow::response(
        200,
        response.dump()
    );
});
}