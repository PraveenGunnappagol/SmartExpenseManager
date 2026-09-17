#include <iostream>

#include "crow.h"
#include "crow/middlewares/cors.h"

#include "database/DatabaseManager.h"

#include "managers/UserManager.h"
#include "managers/TransactionManager.h"
#include "managers/CategoryManager.h"
#include "managers/BudgetManager.h"
#include "managers/AnalyticsManager.h"
#include "managers/AuthManager.h"

#include "api/UserRoutes.h"
#include "api/TransactionRoutes.h"
#include "api/CategoryRoutes.h"
#include "api/IncomeRoutes.h"
#include "api/BudgetRoutes.h"
#include "api/AnalyticsRoutes.h"

#ifdef DELETE
#undef DELETE
#endif
int main()
{
    std::cout << "Starting Smart Expense Manager backend..."
              << std::endl;

    DatabaseManager databaseManager(
        "localhost",
        33060,
        "root",
        "Praveen@2005",
        "smart_expense_manager"
    );

    if (!databaseManager.connect())
    {
        std::cerr << "Database connection failed."
                  << std::endl;
        return 1;
    }

    std::cout << "Database connection successful."
              << std::endl;

    crow::App<crow::CORSHandler> app;

    auto& cors =
        app.get_middleware<crow::CORSHandler>();

    cors.global()
        .origin("http://127.0.0.1:5500")
        .methods(
            crow::HTTPMethod::GET,
            crow::HTTPMethod::POST,
            crow::HTTPMethod::PUT,
            crow::HTTPMethod::DELETE
        )
        .headers("Content-Type", "Authorization").max_age(3600);

    AuthManager authManager;

    UserManager userManager(databaseManager);
    TransactionManager transactionManager(databaseManager);
    CategoryManager categoryManager(databaseManager);
    BudgetManager budgetManager(databaseManager);
    AnalyticsManager analyticsManager(databaseManager);

    registerUserRoutes(
        app,
        userManager,
        authManager
    );

    registerTransactionRoutes(
        app,
        transactionManager,
        authManager
    );

    registerCategoryRoutes(
        app,
        categoryManager,
        authManager
    );

    registerIncomeRoutes(
        app,
        transactionManager,
        authManager
    );

    registerBudgetRoutes(
        app,
        budgetManager,
        authManager
    );

    registerAnalyticsRoutes(
        app,
        analyticsManager,
        authManager
    );

    CROW_ROUTE(app, "/api/health")
    ([]()
    {
        crow::json::wvalue response;

        response["status"] = "ok";

        response["message"] =
            "Smart Expense Manager backend is running";

        return response;
    });

    std::cout << "Starting HTTP server on port 18080..."
              << std::endl;

    app.port(18080)
       .multithreaded()
       .run();

    databaseManager.disconnect();

    return 0;
}