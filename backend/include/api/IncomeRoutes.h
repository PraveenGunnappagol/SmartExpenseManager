#ifndef INCOME_ROUTES_H
#define INCOME_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class TransactionManager;
class AuthManager;

void registerIncomeRoutes(
    crow::App<crow::CORSHandler>& app,
    TransactionManager& transactionManager,
    AuthManager& authManager
);

#endif