import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
});

// Register function
export async function register({ username, email, password }) {
    try {
        const response = await api.post('/api/auth/register', {
            username,
            email,
            password
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Registration failed";
        throw new Error(message, { cause: err });
    }
}

// Login function
export async function login({ email, password }) {
    try {
        const response = await api.post('/api/auth/login', {
            email,
            password
        });
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Login failed";
        throw new Error(message, { cause: err });
    }
}

// Logout function
export async function logout() {
    try {
        const response = await api.get('/api/auth/logout');
        return response.data;
    } catch (err) {
        const message = err.response?.data?.message || err.message || "Logout failed";
        throw new Error(message, { cause: err });
    }
}

// Get current user details (Quiet on 401 unauthenticated check)
export async function getme() {
    try {
        const response = await api.get("/api/auth/get-me");
        return response.data;
    } catch (err) {
        // If unauthenticated (401), quietly return null without console clutter
        if (err.response && err.response.status === 401) {
            return null;
        }
        return null;
    }
}

export default api;
