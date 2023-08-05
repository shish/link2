import { Comparison, Www } from "../gql/graphql";

export function CompareSection({
    section, comparisons,
}: {
    section: string;
    comparisons: Array<Comparison>;
}) {
    function compsort(a: Comparison, b: Comparison) {
        const s = {
            [Www.Want]: 2,
            [Www.Will]: 1,
            [Www.Wont]: 0,
            [Www.Na]: 0,
        };
        return (
            (s[b.mine] + s[b.theirs]) - (s[a.mine] + s[a.theirs]) ||
            a.order - b.order
        );
    }

    return (
        <>
            <h3>{section}</h3>
            <ul>
                {comparisons.sort(compsort).map((c) => (
                    <Comparison
                        key={c.text + c.order}
                        comparison={c}
                     />
                ))}
            </ul>
        </>
    );
}

function Comparison({ comparison }: { comparison: Comparison }) {
    const c = comparison;

    if (c.mine == Www.Want && c.theirs == Www.Want) {
        if (!c.flip) {
            return (
                <li><b>You both want {c.text}</b></li>
            );
        } else {
            return (
                <li><b>You want {c.text} and they want {c.flip}</b></li>
            );
        }
    } else if (c.mine == Www.Want && c.theirs == Www.Will) {
        return (
            <li>
                You want {c.flip ? c.text : ""} and they would try{" "}
                {c.flip ? c.flip : c.text}
            </li>
        );
    } else if (c.mine == Www.Will && c.theirs == Www.Want) {
        return (
            <li>
                You would try {c.flip ? c.text : ""} and they want{" "}
                {c.flip ? c.flip : c.text}
            </li>
        );
    } else {
        return "Err??";
    }
}
