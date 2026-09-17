#ifndef BUDGET_ROUTES_H
#define BUDGET_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class BudgetManager;
class AuthManager;

void registerBudgetRoutes(
    crow::App<crow::CORSHandler>& app,
    BudgetManager& budgetManager,
    AuthManager& authManager
);

#endif