localStorage.removeItem("authToken");
localStorage.removeItem("userId");
localStorage.removeItem("username");
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username =
        document.getElementById("login-username").value.trim();

    const password =
        document.getElementById("login-password").value;

    if (!username || !password) {
        showToast("Please enter your username and password.");
        return;
    }

    try {
        const response = await apiPost(
            "/users/login",
            {
                username: username,
                password: password
            }
        );

        localStorage.setItem(
            "userId",
            response.userId
        );

        localStorage.setItem(
            "username",
            username
        );
        localStorage.setItem(
            "authToken",
            response.token
        );

        showToast("✓ Login successful.");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 800);

    } catch (error) {
        console.error(
            "Login failed:",
            error
        );

        showToast(
            "Login failed. Please check your username and password."
        );
    }
});


function showToast(message) {
    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}