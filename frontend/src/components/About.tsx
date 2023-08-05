import css from "../pages/SurveyList.module.scss";
import { sectionMaker } from "./Section";


export const About = sectionMaker(function() {
    return (
        <>
            <h3>About</h3>
            <p>How this site works:</p>
            <ol>
                <li>You say what you like.</li>
                <li>Your friends say what they like.</li>
                <li>The site tells you what you have in common.</li>
            </ol>

            <h3>Why?</h3>
            <p>
                Say I have a terrible secret that I like singing along to S-Club
                7, which I will never admit to in public. If any of my friends
                are also into that, then we can find each other and have secret
                S-Club karaoke sessions. My other friends who don't like S-Club
                will never know :D
            </p>
            <p>
                This isn't foolproof; somebody could claim to like everything
                just to see what matches they get - but if one of your friends
                does that, you should punch them in the face until they stop
                doing that :3
            </p>
        </>
    );
}, css.about);