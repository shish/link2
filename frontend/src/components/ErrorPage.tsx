import React from "react";
import { useRouteError } from "react-router-dom";
import { Page } from "./Page";

export class ErrorBoundary extends React.Component<
    { children: any },
    { error: any }
> {
    constructor(props: any) {
        super(props);
        this.state = {
            error: null,
        };
    }

    static getDerivedStateFromError(error: any) {
        return { error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return <ErrorPage error={this.state.error} />;
        }
        return this.props.children;
    }
}

export function ErrorPage(props: any) {
    let error: any = null;
    try {
        const routeError = useRouteError();
        error = props.error ?? routeError;
        console.error(error);
    } catch (e) {
        console.log("Error in error handler:", e);
        console.log("Original error:", props.error);
        error = props.error;
    }

    return (
        <Page title={"Error"}>
            <h1>Oops!</h1>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error && (error.statusText || error.message)}</i>
            </p>
        </Page>
    );
}
