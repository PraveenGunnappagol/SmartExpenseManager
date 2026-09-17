#ifndef ANALYTICS_ROUTES_H
#define ANALYTICS_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class AnalyticsManager;
class AuthManager;

void registerAnalyticsRoutes(
    crow::App<crow::CORSHandler>& app,
    AnalyticsManager& analyticsManager,
    AuthManager& authManager
);

#endif