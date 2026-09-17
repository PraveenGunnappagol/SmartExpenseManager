#include "api/BudgetRoutes.h"
#include "managers/BudgetManager.h"
#include "managers/AuthManager.h"
#include "crow/middlewares/cors.h"

#ifdef DELETE
#undef DELETE
#endif


void registerBudgetRoutes(
    crow::App<crow::CORSHandler>& app,
    BudgetManager& budgetManager,
    AuthManager& authManager
)
{
    // --------------------------------
    // Add Monthly Budget
    // --------------------------------

    CROW_ROUTE(app, "/api/budgets")
        .methods(crow::HTTPMethod::POST)
        ([&budgetManager, &authManager](
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

        if (!body.has("amount") ||
            !body.has("month"))
        {
            return crow::response(
                400,
                "Missing required fields"
            );
        }

        double amount =
            body["amount"].d();

        std::string month =
            body["month"].s();

        bool success =
            budgetManager.addBudget(
                authenticatedUserId,
                amount,
                month
            );

        if (!success)
        {
            return crow::response(
                400,
                "Failed to add budget"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Monthly budget added successfully";

        response["userId"] =
            authenticatedUserId;

        return crow::response(response);
    });


    // --------------------------------
    // Get Monthly Budgets
    // --------------------------------

    CROW_ROUTE(app, "/api/budgets/<int>")
        .methods(crow::HTTPMethod::GET)
        ([&budgetManager, &authManager](
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

        auto budgets =
            budgetManager.getBudgets(
                authenticatedUserId
            );

        crow::json::wvalue response;

        crow::json::wvalue::list budgetList;

        for (const auto& budget : budgets)
        {
            crow::json::wvalue item;

            item["id"] =
                budget.getId();

            item["userId"] =
                budget.getUserId();

            item["amount"] =
                budget.getAmount();

            item["month"] =
                budget.getMonth();

            budgetList.push_back(
                std::move(item)
            );
        }

        response["budgets"] =
            std::move(budgetList);

        return crow::response(response);
    });


    // --------------------------------
    // Update Monthly Budget
    // --------------------------------

    CROW_ROUTE(app, "/api/budgets/<int>")
        .methods("PUT"_method)
        ([&budgetManager, &authManager](
            const crow::request& request,
            int budgetId)
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

        if (!body.has("amount") ||
            !body.has("month"))
        {
            return crow::response(
                400,
                "Missing required fields"
            );
        }

        double amount =
            body["amount"].d();

        std::string month =
            body["month"].s();

        bool success =
            budgetManager.updateBudget(
                budgetId,
                authenticatedUserId,
                amount,
                month
            );

        if (!success)
        {
            return crow::response(
                404,
                "Budget not found or update failed"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Monthly budget updated successfully";

        return crow::response(
            200,
            response.dump()
        );
    });


    // --------------------------------
    // Delete Monthly Budget
    // --------------------------------

    CROW_ROUTE(app, "/api/budgets/<int>")
        .methods("DELETE"_method)
        ([&budgetManager, &authManager](
            const crow::request& request,
            int budgetId)
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
            budgetManager.deleteBudget(
                budgetId,
                authenticatedUserId
            );

        if (!success)
        {
            return crow::response(
                404,
                "Budget not found or delete failed"
            );
        }

        crow::json::wvalue response;

        response["message"] =
            "Monthly budget deleted successfully";

        return crow::response(
            200,
            response.dump()
        );
    });


    // --------------------------------
    // Monthly Budget Status
    // --------------------------------

    CROW_ROUTE(app, "/api/budgets/status/<int>")
        .methods("GET"_method)
        ([&budgetManager, &authManager](
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

        auto statuses =
            budgetManager.getBudgetStatus(
                authenticatedUserId
            );

        crow::json::wvalue response =
            crow::json::wvalue::list();

        int index = 0;

        for (const auto& status : statuses)
        {
            response[index]["budgetId"] =
                status.budgetId;

            response[index]["budgetAmount"] =
                status.budgetAmount;

            response[index]["spentAmount"] =
                status.spentAmount;

            response[index]["remainingAmount"] =
                status.remainingAmount;

            response[index]["month"] =
                status.month;

            response[index]["status"] =
                status.status;

            index++;
        }

        return crow::response(
            200,
            response.dump()
        );
    });
}