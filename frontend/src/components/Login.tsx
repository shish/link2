import { useContext, useState } from "react";
import { UserContext } from "../providers/LoginProvider";
import { sectionMaker } from "./Section";

export const LogIn = sectionMaker(function() {
    const [loginMode, setLoginMode] = useState<"login" | "create">("login");
    const [error, setError] = useState<Error | null>(null);
    const [username, setUsername] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [email, setEmail] = useState("");
    const { createUserMutation, loginMutation } = useContext(UserContext);

    function loginHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        loginMutation({
            variables: {
                username,
                password: password1,
            },
            onError: (e: Error) => setError(e),
        });
    }

    function createHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        createUserMutation({
            variables: {
                username,
                password1,
                password2,
                email,
            },
            onError: (e: Error) => setError(e),
        });
    }

    return (
        <>
            <h3>Sign Up / Log In</h3>
            {error && <p>{error.message}</p>}
            {loginMode === "login" && (
                <form onSubmit={(e) => loginHandler(e)}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="password"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input type="submit" value="Log In" />
                    <p>
                        <small>
                            Don't have an account?{" "}
                            <a onClick={() => setLoginMode("create")}>
                                Create one!
                            </a>
                        </small>
                    </p>
                </form>
            )}
            {loginMode === "create" && (
                <form onSubmit={(e) => createHandler(e)}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                    <input
                        type="password"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        placeholder="Password"
                        required
                    />
                    <input
                        type="password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                    />
                    <input type="submit" value="Create" />
                    <p>
                        <small>
                            Already have an account?{" "}
                            <a onClick={() => setLoginMode("login")}>Log in!</a>
                        </small>
                    </p>
                </form>
            )}
        </>
    );
});