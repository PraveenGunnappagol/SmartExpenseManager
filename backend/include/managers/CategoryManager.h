#ifndef CATEGORY_MANAGER_H
#define CATEGORY_MANAGER_H

#include "database/DatabaseManager.h"
#include "models/Category.h"

#include <string>
#include <vector>

class CategoryManager
{
public:
    explicit CategoryManager(DatabaseManager& databaseManager);

    std::vector<Category*> getCategories();

    int getOrCreateCategory(const std::string& categoryName);

private:
    DatabaseManager& databaseManager;
};

#endif