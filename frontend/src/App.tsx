import React, { useState } from "react";
import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
    HttpLink,
} from "@apollo/client";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { router } from "./pages";
import { LoginProvider } from "./providers/LoginProvider";

const createApolloClient = () => {
    const debugHttpLink = new HttpLink({
        uri: "/graphql",
        credentials: "include",
        fetch: (uri: string, options: any) => {
            const { operationName } = JSON.parse(options.body);
            return fetch(`${uri}?on=${operationName}`, options);
        },
    });
    const prodHttpLink = new HttpLink({
        uri: "/graphql",
    });

    return new ApolloClient({
        link: process.env.NODE_ENV === "production" ? prodHttpLink : debugHttpLink,
        cache: new InMemoryCache(),
    });
};

type AppProps = {
    router: any;
    client?: ApolloClient<any>;
    mocks?: MockedResponse[];
};

function ApolloOrMockedProvider({ client, mocks, children }: any) {
    if (client) {
        return <ApolloProvider client={client}>{children}</ApolloProvider>;
    } else if (mocks) {
        return (
            <MockedProvider mocks={mocks} addTypename={true}>
                {children}
            </MockedProvider>
        );
    } else {
        throw new Error("Must provide either client or mocks");
    }
}

export function AppWithMiddleware({ client, router, mocks }: AppProps) {
    return <React.StrictMode>
        <ApolloOrMockedProvider client={client} mocks={mocks}>
            <LoginProvider>
                <RouterProvider router={router} />
            </LoginProvider>
        </ApolloOrMockedProvider>
    </React.StrictMode>;
}

// Set up all the app scaffolding (login, router, etc) but only
// holding a single component, for easy component testing
export function DevApp({ component, mocks }: { component: any; mocks: any[] }) {
    const routes = [
        { path: "/", element: component },
    ];
    const router = createMemoryRouter(routes, {
        initialEntries: ["/"],
        initialIndex: 0,
    });

    return <AppWithMiddleware mocks={mocks} router={router} />;
}

export function App() {
    const [client] = useState(createApolloClient());
    return <AppWithMiddleware client={client} router={router} />;
}
