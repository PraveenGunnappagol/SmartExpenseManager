cmake_minimum_required(VERSION 3.16)

project(SmartExpenseBackend)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_PREFIX_PATH
    "C:/Libraries/mysql-connector-c++-26.7.0-winx64"
)

find_package(mysql-concpp REQUIRED)

find_package(Crow CONFIG REQUIRED)
add_executable(SmartExpenseBackend
    src/main.cpp

    src/database/DatabaseManager.cpp

    src/models/User.cpp

    src/managers/UserManager.cpp

    src/utils/PasswordUtils.cpp

    src/models/Transaction.cpp

    src/managers/TransactionManager.cpp

    src/models/Category.cpp

    src/managers/CategoryManager.cpp

    src/models/Budget.cpp

    src/managers/BudgetManager.cpp

    src/managers/AnalyticsManager.cpp
    src/api/TransactionRoutes.cpp
    src/api/CategoryRoutes.cpp
    src/api/IncomeRoutes.cpp
    src/api/BudgetRoutes.cpp
    src/api/AnalyticsRoutes.cpp
    src/api/UserRoutes.cpp
    src/managers/AuthManager.cpp
)

target_include_directories(SmartExpenseBackend PRIVATE
    include
)
target_link_libraries(SmartExpenseBackend
    mysql::concpp
    Crow::Crow
)