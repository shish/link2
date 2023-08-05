import { useContext } from "react";
import { UserContext } from "../providers/LoginProvider";
import { Page } from "../components/Page";
import { Settings } from "../components/Settings";
import { Navigate } from "react-router-dom";
import css from "./User.module.scss";

export function User() {
    const { me } = useContext(UserContext);
    if (!me) {
        return <Navigate to="/" />;
    }

    return (
        <Page title={"Settings"} className={css.page}>
            <Settings />
        </Page>
    );
}
