import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router-dom";

import { ErrorPage } from "../components/ErrorPage";
import { SurveyList } from "./SurveyList";
import { SurveyView } from "./SurveyView";
import { ResponseView } from "./ResponseView";
import { Friends } from "./Friends";
import { User } from "./User";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" errorElement={<ErrorPage />}>
            <Route index element={<SurveyList />} />
            <Route path="survey/:survey_id" element={<SurveyView />} />
            <Route path="response/:response_id" element={<ResponseView />} />
            <Route path="friends" element={<Friends />} />
            <Route path="user" element={<User />} />
        </Route>,
    ),
);
