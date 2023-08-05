import { useContext } from "react";
import { UserContext } from "../providers/LoginProvider";
import { Link } from "react-router-dom";
import { sectionMaker } from "./Section";

export const UserInfo = sectionMaker(function() {
    const { me, logoutMutation } = useContext(UserContext);

    function logoutHandler(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        e.preventDefault();
        logoutMutation({
            onError: (error: any) => {
                alert(error.message);
            },
        });
    }

    return (
        <>
            <h3>Logged in as {me?.username}</h3>
            <ul>
                <li>
                    <Link to="/friends">Friends</Link>
                </li>
                <li>
                    <Link to="/user">Settings</Link>
                </li>
                <li>
                    <Link to="/" onClick={logoutHandler}>
                        Log Out
                    </Link>
                </li>
            </ul>
        </>
    );
});
