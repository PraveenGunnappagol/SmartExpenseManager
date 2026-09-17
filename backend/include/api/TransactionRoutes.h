#ifndef TRANSACTION_ROUTES_H
#define TRANSACTION_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class TransactionManager;
class AuthManager;

void registerTransactionRoutes(
    crow::App<crow::CORSHandler>& app,
    TransactionManager& transactionManager,
    AuthManager& authManager
);

#endif