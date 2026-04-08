async function auth_test() {

    const body = {
        user_name: "testuser",
        password: "testpassword",
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890"
    }

    const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        credentials: 'include'
    })

    if(response.status!==201){
        return false;
    }

    const login_response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            user_name: "testuser",
            password: "testpassword"
        }),
        credentials: 'include'
    });
    if(login_response.status!=201){
        return false;
    }
    return true;
}