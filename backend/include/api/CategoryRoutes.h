#ifndef CATEGORY_ROUTES_H
#define CATEGORY_ROUTES_H

#include "crow.h"
#include "crow/middlewares/cors.h"

class CategoryManager;
class AuthManager;

void registerCategoryRoutes(
    crow::App<crow::CORSHandler>& app,
    CategoryManager& categoryManager,
    AuthManager& authManager
);

#endif