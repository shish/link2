import { useState } from "react";
import { Page } from "../components/Page";
import { graphql } from "../gql";
import { useMutation, useQuery } from "@apollo/client";
import { LoadingPage } from "../components/LoadingPage";
import { ErrorPage } from "../components/ErrorPage";
import { Navigate } from "react-router-dom";
import css from "./Friends.module.scss";

export const GET_FRIENDS = graphql(`
    query getFriends {
        me: user {
            friends {
                username
            }
            friendsOutgoing {
                username
            }
            friendsIncoming {
                username
            }
        }
    }
`);

export const ADD_FRIEND = graphql(`
    mutation addFriend($username: String!) {
        addFriend(username: $username)
    }
`);

export const REMOVE_FRIEND = graphql(`
    mutation removeFriend($username: String!) {
        removeFriend(username: $username)
    }
`);

function ConfirmedFriends({ friends }: { friends: { username: string }[] }) {
    const [removeFriendMutation, removeFriendQ] = useMutation(REMOVE_FRIEND, {
        refetchQueries: [GET_FRIENDS],
        onError: (error) => {
            alert(error);
        },
    });

    return (
        <section className={css.confirmed}>
            <h3>Confirmed</h3>
            {friends.length == 0 ?
                <p>No friends yet.</p> :
            <table className="zebra">
                <tbody>
                    {friends.map((friend) => (
                        <tr>
                            <td>{friend.username}</td>
                            <td>
                                <input
                                    type="button"
                                    value="Remove"
                                    onClick={() =>
                                        removeFriendMutation({
                                            variables: {
                                                username: friend.username,
                                            },
                                        })
                                    }
                                    disabled={removeFriendQ.loading}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}
        </section>
    );
}

function IncomingFriends({ friends }: { friends: { username: string }[] }) {
    const [addFriendMutation, addFriendQ] = useMutation(ADD_FRIEND, {
        refetchQueries: [GET_FRIENDS],
        onError: (error) => {
            alert(error);
        },
    });

    return (
        <section className={css.incoming}>
            <h3>Incoming Requests</h3>
            {friends.length == 0 ?
                <p>No pending invites.</p> :
                <table className="zebra">
                <tbody>
                    {friends.map((friend) => (
                        <tr>
                            <td>{friend.username}</td>
                            <td>
                                <input
                                    type="button"
                                    value="Accept"
                                    onClick={() =>
                                        addFriendMutation({
                                            variables: {
                                                username: friend.username,
                                            },
                                        })
                                    }
                                    disabled={addFriendQ.loading}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}
        </section>
    );
}

function OutgoingFriends({ friends }: { friends: { username: string }[] }) {
    const [friendToAdd, setFriendToAdd] = useState("");
    const [addFriendMutation, addFriendQ] = useMutation(ADD_FRIEND, {
        refetchQueries: [GET_FRIENDS],
        onCompleted: (data: any) => {
            setFriendToAdd("");
        },
        onError: (error) => {
            alert(error);
        },
    });
    const [removeFriendMutation, removeFriendQ] = useMutation(REMOVE_FRIEND, {
        refetchQueries: [GET_FRIENDS],
        onError: (error) => {
            alert(error);
        },
    });

    return (
        <section className={css.outgoing}>
            <h3>Outgoing Requests</h3>
            <table className="zebra">
                <tbody>
                    <tr>
                        <td>
                            <input
                                type="text"
                                placeholder="Username"
                                value={friendToAdd}
                                onChange={(e) => setFriendToAdd(e.target.value)}
                                disabled={addFriendQ.loading}
                            />
                        </td>
                        <td>
                            <input
                                type="button"
                                value="Send"
                                onClick={() =>
                                    addFriendMutation({
                                        variables: { username: friendToAdd },
                                    })
                                }
                                disabled={addFriendQ.loading}
                            />
                        </td>
                    </tr>
                    {friends.map((friend) => (
                        <tr>
                            <td>{friend.username}</td>
                            <td>
                                <input
                                    type="button"
                                    value="Cancel"
                                    onClick={() =>
                                        removeFriendMutation({
                                            variables: {
                                                username: friend.username,
                                            },
                                        })
                                    }
                                    disabled={removeFriendQ.loading}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}

export function Friends() {
    ///////////////////////////////////////////////////////////////////
    // Hooks
    const q = useQuery(GET_FRIENDS);

    ///////////////////////////////////////////////////////////////////
    // Hook edge case handling
    if (q.loading) {
        return <LoadingPage />;
    }
    if (q.error) {
        return <ErrorPage error={q.error} />;
    }
    const me = q.data?.me;
    if (!me) {
        return <Navigate to="/" />;
    }

    ///////////////////////////////////////////////////////////////////
    // Render

    return (
        <Page title={"Friends"} className={css.page}>
            <IncomingFriends friends={me.friendsIncoming} />
            <ConfirmedFriends friends={me.friends} />
            <OutgoingFriends friends={me.friendsOutgoing} />
        </Page>
    );
}
