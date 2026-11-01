import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../hooks/use.auth';
import "../Auth.form.scss";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await handleLogin({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.message || "Login failed");
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <h2>Loading...</h2>
            </main>
        );
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                {error && (
                    <div style={{ color: "#f87171", backgroundColor: "#2b1115", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button className="button primary-button">Login</button>
                </form>

                <p>Don't have an account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    );
};

export default Login;
