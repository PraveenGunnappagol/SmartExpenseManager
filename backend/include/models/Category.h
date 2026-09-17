#ifndef CATEGORY_H
#define CATEGORY_H

#include <string>

class Category
{
public:
    Category();

    Category(
        int id,
        const std::string& name
    );

    int getId() const;
    std::string getName() const;

private:
    int id;
    std::string name;
};

#endif