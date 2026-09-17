#include "api/TransactionRoutes.h"
#include "managers/TransactionManager.h"
#include "managers/AuthManager.h"
#include "crow/middlewares/cors.h"

#ifdef DELETE
#undef DELETE
#endif

void registerTransactionRoutes(
    crow::App<crow::CORSHandler>& app,
    TransactionManager& transactionManager,
    AuthManager& authManager
)
{
    CROW_ROUTE(app, "/api/transactions/<int>")
        .methods(crow::HTTPMethod::GET)
        ([&transactionManager, &authManager](
            const crow::request& req,
            int userId)
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

        crow::json::wvalue response;
        crow::json::wvalue::list transactionList;

        for (const auto& transaction : transactions)
        {
            crow::json::wvalue item;

            item["id"] = transaction.getId();
            item["userId"] = transaction.getUserId();
            item["categoryId"] = transaction.getCategoryId();
            item["type"] = transaction.getType();
            item["amount"] = transaction.getAmount();
            item["description"] =
                transaction.getDescription();
            item["transactionDate"] =
                transaction.getTransactionDate();

            transactionList.push_back(
                std::move(item)
            );
        }

        response["transactions"] =
            std::move(transactionList);

        return crow::response(response);
    });


    CROW_ROUTE(app, "/api/transactions")
        .methods(crow::HTTPMethod::POST)
        ([&transactionManager, &authManager](
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

        auto body =
            crow::json::load(req.body);

        if (!body)
        {
            return crow::response(
                400,
                "Invalid JSON"
            );
        }

        int categoryId =
            body["categoryId"].i();

        std::string type =
            body["type"].s();

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
                type,
                amount,
                description,
                transactionDate
            );

        if (!success)
        {
            return crow::response(
                400,
                "Failed to add transaction"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Transaction added successfully";

        response["userId"] =
            authenticatedUserId;

        return crow::response(response);
    });


    CROW_ROUTE(app, "/api/transactions/<int>")
        .methods(crow::HTTPMethod::PUT)
        ([&transactionManager, &authManager](
            const crow::request& req,
            int transactionId)
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

        auto body =
            crow::json::load(req.body);

        if (!body)
        {
            return crow::response(
                400,
                "Invalid JSON"
            );
        }

        int categoryId =
            body["categoryId"].i();

        std::string type =
            body["type"].s();

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
                type,
                amount,
                description,
                transactionDate
            );

        if (!success)
        {
            return crow::response(
                400,
                "Failed to update transaction"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Transaction updated successfully";

        response["userId"] =
            authenticatedUserId;

        return crow::response(response);
    });


    CROW_ROUTE(app, "/api/transactions/<int>")
        .methods(crow::HTTPMethod::DELETE)
        ([&transactionManager, &authManager](
            const crow::request& req,
            int transactionId)
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

        bool success =
            transactionManager.deleteTransaction(
                transactionId,
                authenticatedUserId
            );

        if (!success)
        {
            return crow::response(
                400,
                "Failed to delete transaction"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Transaction deleted successfully";

        return crow::response(response);
    });
}