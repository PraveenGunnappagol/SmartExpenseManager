#include "managers/CategoryManager.h"

#include <iostream>

CategoryManager::CategoryManager(
    DatabaseManager& databaseManager
)
    : databaseManager(databaseManager)
{
}

std::vector<Category*> CategoryManager::getCategories()
{
    std::vector<Category*> categories;

    try
    {
        auto result = databaseManager.getSession().sql(
            "SELECT id, name "
            "FROM categories "
            "ORDER BY name"
        ).execute();

        for (auto row : result)
        {
            int id = row[0].get<int>();

            std::string name =
                row[1].get<std::string>();

            Category* category =
                new Category(id, name);

            categories.push_back(category);
        }

        return categories;
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to retrieve categories: "
                  << error.what()
                  << std::endl;

        return categories;
    }
}

int CategoryManager::getOrCreateCategory(
    const std::string& categoryName
)
{
    try
    {
        // Check whether the category already exists.
        auto result = databaseManager.getSession().sql(
            "SELECT id "
            "FROM categories "
            "WHERE name = ?"
        )
        .bind(categoryName)
        .execute();

        for (auto row : result)
        {
            return row[0].get<int>();
        }

        // Category does not exist, so create it.
        auto insertResult =
            databaseManager.getSession().sql(
                "INSERT INTO categories (name) "
                "VALUES (?)"
            )
            .bind(categoryName)
            .execute();

        return static_cast<int>(
            insertResult.getAutoIncrementValue()
        );
    }
    catch (const mysqlx::Error& error)
    {
        std::cerr << "Failed to get or create category: "
                  << error.what()
                  << std::endl;

        return -1;
    }
}