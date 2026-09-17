const signupForm =
    document.getElementById("signup-form");

signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username =
        document.getElementById("signup-username")
            .value
            .trim();

    const email =
        document.getElementById("signup-email")
            .value
            .trim();

    const password =
        document.getElementById("signup-password")
            .value;

    const confirmPassword =
        document.getElementById("signup-confirm-password")
            .value;

    if (!username || !email || !password || !confirmPassword) {
        showToast("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        showToast("Passwords do not match.");
        return;
    }

    try {
        await apiPost(
            "/users/register",
            {
                username: username,
                email: email,
                password: password
            }
        );

        showToast(
            "✓ Account created successfully."
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

    } catch (error) {
        console.error(
            "Signup failed:",
            error
        );

        /*
         * apiPost currently throws an Error containing
         * the HTTP status, so show a useful message based
         * on that status.
         */

       if (error.status === 409) {
    showToast(error.message);
}
else if (error.status === 400) {
    showToast(error.message);
}
else {
    showToast(
        "Unable to create account. Please try again."
    );
}
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