import { Link, ScrollRestoration } from "react-router-dom";
import css from "./Page.module.scss";
import "./style.scss";
import { useContext } from "react";
import { UserContext } from "../providers/LoginProvider";

import { ReactComponent as LoginIcon } from "./icons/login.svg";
import { ReactComponent as LogoutIcon } from "./icons/logout.svg";
import { ReactComponent as GearsIcon } from "./icons/gears.svg";
import { ReactComponent as FriendsIcon } from "./icons/friends.svg";

function Header({ title }: { title?: string }) {
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
        <header className={css.header}>
            <h1>
                <Link to="/">
                    <span className="large_only">Link</span>
                </Link>
                {title ? " - " + title : ""}
            </h1>
            <div className={css.fill}>&nbsp;</div>
            {me ? (
                <>
                    <h1>
                        <Link to="/friends">
                            <FriendsIcon data-cy="friends" />
                        </Link>
                    </h1>
                    <h1>
                        <Link to="/user">
                            <GearsIcon data-cy="settings" />
                        </Link>
                    </h1>
                    <h1>
                        <Link to="/" onClick={logoutHandler}>
                            <LogoutIcon data-cy="logout" />
                        </Link>
                    </h1>
                </>
            ) : (
                <h1>
                    <Link to="/">
                        <LoginIcon data-cy="login" />
                    </Link>
                </h1>
            )}
        </header>
    );
}

export function Page({
    title,
    children,
    className,
}: {
    title?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={css.page + (className ? " " + className : "")}>
            <ScrollRestoration />
            <Header title={title} />
            <article>{children}</article>
            <footer className={css.footer}>
                <a href="https://github.com/shish/link2">Link software</a>
                {" by "}
                <a href="https://shish.io/">Shish</a>
            </footer>
        </div>
    );
}
