/* =========================================================
   SMART EXPENSE MANAGER
   API Helper
   ========================================================= */

const API_BASE_URL = "http://localhost:18080/api";


/*
    Generic GET request helper.

    Example:
        apiGet("/health")

    becomes:
        http://localhost:18080/api/health
*/

async function apiGet(endpoint) {
    try {
        const token =
            localStorage.getItem("authToken");

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                headers: token
                    ? {
                        "Authorization":
                            `Bearer ${token}`
                    }
                    : {}
            }
        );

        if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");

        window.location.href = "login.html";
    }

    throw new Error(
        `HTTP error: ${response.status}`
    );
}

        return await response.json();

    } catch (error) {
        console.error(
            "API GET request failed:",
            error
        );

        throw error;
    }
}


/*
    Generic POST request helper.

    We will use this later for:
        - Adding expenses
        - Adding income
        - Adding budgets
*/

async function apiPost(endpoint, data) {
    try {
        const token =
            localStorage.getItem("authToken");

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    ...(token
                        ? {
                            "Authorization":
                                `Bearer ${token}`
                        }
                        : {})
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            if (response.status === 401) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("userId");
                localStorage.removeItem("username");

                window.location.href = "login.html";
            }

            const error =
                new Error(
                    errorText ||
                    `HTTP error: ${response.status}`
                );

            error.status =
                response.status;

            throw error;
        }

        return await response.json();

    } catch (error) {
        console.error(
            "API POST request failed:",
            error
        );

        throw error;
    }
}

/*
    Generic PUT request helper.

    We will use this later for editing
    expenses, income and budgets.
*/

async function apiPut(endpoint, data) {
    try {
        const token =
            localStorage.getItem("authToken");

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    ...(token
                        ? {
                            "Authorization":
                                `Bearer ${token}`
                        }
                        : {})
                },

                body: JSON.stringify(data)
            }
        );

       if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");

        window.location.href = "login.html";
    }

    throw new Error(
        `HTTP error: ${response.status}`
    );
}

        return await response.json();

    } catch (error) {
        console.error(
            "API PUT request failed:",
            error
        );

        throw error;
    }
}

/*
    Generic DELETE request helper.
*/

async function apiDelete(endpoint, data) {
    try {
        const token =
            localStorage.getItem("authToken");

        const response = await fetch(
            API_BASE_URL + endpoint,
            {
                method: "DELETE",

                headers: {
                    "Content-Type": "application/json",
                    ...(token
                        ? {
                            "Authorization":
                                `Bearer ${token}`
                        }
                        : {})
                },

                body: JSON.stringify(data)
            }
        );

       if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");

        window.location.href = "login.html";
    }

    throw new Error(
        `HTTP error: ${response.status}`
    );
}

        return await response.json();

    } catch (error) {
        console.error(
            "API DELETE request failed:",
            error
        );

        throw error;
    }
}