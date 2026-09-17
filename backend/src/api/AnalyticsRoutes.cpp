
#include "api/AnalyticsRoutes.h"
#include "managers/AnalyticsManager.h"
#include "managers/AuthManager.h"
#include "crow/middlewares/cors.h"
void registerAnalyticsRoutes(
    crow::App<crow::CORSHandler>& app,
    AnalyticsManager& analyticsManager,
    AuthManager& authManager
)
{
   CROW_ROUTE(app, "/api/analytics/summary/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    double totalIncome =
        analyticsManager.getTotalIncome(
            authenticatedUserId
        );

    double totalExpenses =
        analyticsManager.getTotalExpenses(
            authenticatedUserId
        );

    double balance =
        analyticsManager.getBalance(
            authenticatedUserId
        );

    crow::json::wvalue response;

    response["totalIncome"] =
        totalIncome;

    response["totalExpenses"] =
        totalExpenses;

    response["balance"] =
        balance;

    return crow::response(
        200,
        response.dump()
    );
});
      CROW_ROUTE(app, "/api/analytics/categories/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    auto categories =
        analyticsManager.getCategorySpending(
            authenticatedUserId
        );

    crow::json::wvalue response =
        crow::json::wvalue::list();

    int index = 0;

    for (const auto& category : categories)
    {
        response[index]["categoryName"] =
            category.categoryName;

        response[index]["totalAmount"] =
            category.totalAmount;

        ++index;
    }

    return crow::response(
        200,
        response.dump()
    );
});
       CROW_ROUTE(app, "/api/analytics/daily/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    auto trends =
        analyticsManager.getDailySpending(
            authenticatedUserId
        );

    crow::json::wvalue response =
        crow::json::wvalue::list();

    int index = 0;

    for (const auto& trend : trends)
    {
        response[index]["date"] =
            trend.date;

        response[index]["totalAmount"] =
            trend.totalAmount;

        ++index;
    }

    return crow::response(
        200,
        response.dump()
    );
});
     CROW_ROUTE(app, "/api/analytics/monthly/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    auto trends =
        analyticsManager.getMonthlySpending(
            authenticatedUserId
        );

    crow::json::wvalue response =
        crow::json::wvalue::list();

    int index = 0;

    for (const auto& trend : trends)
    {
        response[index]["date"] =
            trend.date;

        response[index]["totalAmount"] =
            trend.totalAmount;

        ++index;
    }

    return crow::response(
        200,
        response.dump()
    );
});
      CROW_ROUTE(app, "/api/analytics/highest-category/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    std::string category =
        analyticsManager.getHighestSpendingCategory(
            authenticatedUserId
        );

    crow::json::wvalue response;

    response["category"] = category;

    return crow::response(
        200,
        response.dump()
    );
});
CROW_ROUTE(app, "/api/analytics/unusual-spending/<int>")
.methods(crow::HTTPMethod::GET)
([&analyticsManager, &authManager](
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

    UnusualSpendingDetails details =
        analyticsManager.getUnusualSpendingDetails(
            authenticatedUserId
        );

    crow::json::wvalue response;

    response["unusualSpending"] =
        details.unusualSpending;

    response["expenseAmount"] =
        details.expenseAmount;

    response["averageExpense"] =
        details.averageExpense;

    response["multiplier"] =
        details.multiplier;

    response["categoryName"] =
        details.categoryName;

    response["month"] =
        details.month;

    return crow::response(
        200,
        response.dump()
    );
});
    CROW_ROUTE(app, "/api/analytics/monthly-comparison/<int>")
    .methods(crow::HTTPMethod::GET)
    ([&analyticsManager, &authManager](
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

    auto comparison =
        analyticsManager.getMonthlyComparison(
            authenticatedUserId
        );

    crow::json::wvalue response;

    response["currentIncome"] =
        comparison.currentIncome;

    response["currentExpenses"] =
        comparison.currentExpenses;

    response["currentBalance"] =
        comparison.currentBalance;

    response["currentSavingsRate"] =
        comparison.currentSavingsRate;

    response["previousIncome"] =
        comparison.previousIncome;

    response["previousExpenses"] =
        comparison.previousExpenses;

    response["previousBalance"] =
        comparison.previousBalance;

    response["previousSavingsRate"] =
        comparison.previousSavingsRate;

    return crow::response(
        200,
        response.dump()
    );
});
}