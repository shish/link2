import { Page } from "../components/Page";
import { useContext } from "react";
import { UserContext } from "../providers/LoginProvider";
import { LogIn } from "../components/Login";
import { UserInfo } from "../components/UserInfo";
import css from "./SurveyList.module.scss";
import { SurveyItems } from "../components/SurveyItems";
import { About } from "../components/About";

export function SurveyList() {
    const { me } = useContext(UserContext);

    return (
        <Page className={css.page}>
            {me ? <UserInfo /> : <LogIn />}
            <SurveyItems />
            <About />
        </Page>
    );
}
