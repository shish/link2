import { graphql } from "../gql";
import { useMutation } from "@apollo/client";
import { GET_ME, ME_FRAGMENT, UserContext } from "../providers/LoginProvider";
import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { useFragment as fragCast } from "../gql/fragment-masking";
import { sectionMaker } from "./Section";

export const UPDATE_USER = graphql(`
    mutation updateUser(
        $password: String!
        $username: String!
        $password1: String!
        $password2: String!
        $email: String!
    ) {
        updateUser(
            password: $password
            username: $username
            password1: $password1
            password2: $password2
            email: $email
        ) {
            ...UserLogin
        }
    }
`);

export const Settings = sectionMaker(function() {
    const { me } = useContext(UserContext);
    if (!me) {
        return <Navigate to="/" />;
    }
    const [error, setError] = useState<Error | null>(null);
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(me.username);
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [email, setEmail] = useState(me.email || "");
    const [saveSettingsMutation, saveSettingsQ] = useMutation(UPDATE_USER, {
        onError: (e: Error) => setError(e),
        update: (cache, { data }) => {
            cache.writeQuery({
                query: GET_ME,
                data: { me: fragCast(ME_FRAGMENT, data?.updateUser) },
            });
        },
    });

    function saveHandler(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        saveSettingsMutation({
            variables: {
                password,
                username,
                password1,
                password2,
                email,
            },
            onCompleted: () => {
                alert("Settings saved!");
            },
        });
    }

    return (
        <>
            <h3>Settings</h3>
            {error && <p>{error.message}</p>}
            <form onSubmit={(e) => saveHandler(e)}>
                <input
                    type="password"
                    placeholder="Current Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={true}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New Password (or leave empty)"
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                />
                {password1 && (
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                    />
                )}
                <input
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="submit"
                    value="Save Settings"
                    disabled={saveSettingsQ.loading}
                />
            </form>
        </>
    );
});