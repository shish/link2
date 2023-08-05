/// <reference path='./main.d.ts'/>
/// <reference types="vite/client" />

import ReactDOM from "react-dom/client";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <App />,
);
