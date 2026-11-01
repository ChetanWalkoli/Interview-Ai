import { useState, useEffect } from "react";
import { AuthContext } from "./auth.context.def";
import { getme } from "./services/auth.api";

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const initAuth = async () => {
            try {
                const data = await getme();
                if (isMounted) {
                    if (data && data.user) {
                        setUser(data.user);
                    } else {
                        setUser(null);
                    }
                }
            } catch {
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
