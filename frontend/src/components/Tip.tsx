import { ReactComponent as CircleInfo } from "./icons/circle-info.svg";
import css from "./Tip.module.scss";
import { Tooltip } from "react-tooltip";

export function Tip({ text }: { text: string }): React.ReactElement {
    const id = text.replace(/[^a-zA-Z0-9]/g, "_");
    return (
        <>
            {" "}
            <CircleInfo
                className={css.tip}
                data-tooltip-id={id}
                data-tooltip-content={text}
            />
            <Tooltip id={id} />
        </>
    );
}
