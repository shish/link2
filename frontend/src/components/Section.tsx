// catch react errors

import React from "react";

export class Section extends React.Component<
    { children: any, [x: string]: any },
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
        const { children, ...kwargs } = this.props;
        if (this.state.error) {
            return <section {...kwargs}>
                <h3>Error</h3>
                <p>Error: {this.state.error.message}</p>
            </section>;
        }
        return <section {...kwargs}>
            {children}
        </section>;
    }
}

export function sectionMaker<T extends (...args: any) => any>(Component: T, className?: string): T {
    return (function (props: Parameters<typeof Component>) {
        return <Section className={className}>
            <Component {...props} />
        </Section>
    }) as T;
}