import React from 'react';
import useWidthPair from '../useWidthPair.js';

function Hud() {
    const [showHud, setShowHud] = React.useState(null);
    const [redTeam, setRedTeam] = React.useState(null);
    const [redScore, setRedScore] = React.useState(null);
    const [blueTeam, setBlueTeam] = React.useState(null);
    const [blueScore, setBlueScore] = React.useState(null);

    const elemTeamRed = React.useRef(null);
    const elemScoreRed = React.useRef(null);
    const elemScoreBlue = React.useRef(null);
    const elemTeamBlue = React.useRef(null);

    const [styleTeamRed, styleTeamBlue] = useWidthPair(elemTeamRed.current, elemTeamBlue.current, redTeam, blueTeam, showHud);
    const [styleScoreRed, styleScoreBlue] = useWidthPair(elemScoreRed.current, elemScoreBlue.current, redScore, blueScore, showHud);

    const [iconMap, setIconMap] = React.useState(null);
    const [intermissionRecords, setIntermissionRecords] = React.useState(null);

    const [currentRecord, setCurrentRecord] = React.useState(null);

    const vidRef = React.useRef(null);

    const initWs = () => {
        const WS_ENDPOINT = (() => {
            let url = new URL(document.URL);
            url.protocol = "ws:";
            url.pathname = "/wsapp/";

            return url;
        })();

        const ws = new WebSocket(WS_ENDPOINT);
        ws.addEventListener("message", e => {
            const obj = JSON.parse(e.data);
            setShowHud(obj.show_hud);
            if (obj.hud) {
                const hud = obj.hud;
                setRedTeam(hud.red_team);
                setRedScore(hud.red_score);
                setBlueTeam(hud.blue_team);
                setBlueScore(hud.blue_score);
            }
        });
        ws.addEventListener("close", ev => {
            console.log(ev.reason);
        });
    };

    const onVidEnd = () => {
        if (!intermissionRecords) return;

        const randomRecord = intermissionRecords[Math.floor(Math.random() * intermissionRecords.length)];
        setCurrentRecord(randomRecord);

        console.log("Playing", randomRecord);
    };

    const onVidPlay = e => {
        requestAnimationFrame(() => {
            e.target.muted = false;
        });
    }

    // const onVidError = () => {
    //     console.error(arguments);
    //     console.error(currentRecord);
    //     onVidEnd();
    // }

    React.useEffect(() => {
        (async () => {
            // Wait for font to load
            await document.fonts.load("1em Rubik");

            fetch("/video/intermission_records.json")
                .then(r => r.json())
                .then(json => {
                    console.log(json);

                    setIntermissionRecords(json);
                });

            fetch("/public/icon_map.json")
                .then(r => r.json())
                .then(json => {
                    setIconMap(json);
                });

            initWs();
        })();
    }, []);

    React.useEffect(() => {
        onVidEnd();
    }, [intermissionRecords]);

    const teamNameLookup = s => s.toLowerCase().replace(/ */g, "");

    const iconSrc = name => {
        if (!iconMap) return null;
        if (iconMap.icons) {
            return iconMap.icons[teamNameLookup(name ?? "")] ?? "/public/icons/default.png";
        }
        return null;
    };

    const hudContainer = () => (
        <div className="flex-container" id="hud-container">
            <img id="red-icon" alt="icon" src={iconSrc(redTeam)} />
            <span style={styleTeamRed} ref={elemTeamRed} id="red-team" className="elem">{redTeam}</span>
            <span style={styleScoreRed} ref={elemScoreRed} id="red-score" className="elem">{redScore ?? 0}</span>
            <span style={styleScoreBlue} ref={elemScoreBlue} id="blue-score" className="elem">{blueScore ?? 0}</span>
            <span style={styleTeamBlue} ref={elemTeamBlue} id="blue-team" className="elem">{blueTeam}</span>
            <img id="blue-icon" alt="icon" src={iconSrc(blueTeam)} />
        </div>
    );

    // const VidYt = ({ record }) => {
    //     return <YouTube
    //         videoId={record?.video_id}
    //         id="video-player"
    //         opts={{
    //             height: "100%",
    //             width: "100%",
    //             playerVars: {
    //                 autoplay: 1,
    //                 mute: 1
    //             }
    //         }}
    //         onPlay={onVidPlay}
    //         onEnd={onVidEnd}
    //         onError={onVidError}
    //     />
    // };

    const VidReg = ({ record }) => {
        return <video ref={vidRef} id="video-player" autoPlay controls muted onPlay={onVidPlay} onEnded={onVidEnd}>
            <source src={record?.url} type="video/mp4" />
        </video >
    };

    const intermissionScreen = () => (
        <div className="flex-container" id="intermission-container">
            <div>Intermission</div>
            <div className="small">Montage by: {currentRecord?.author}</div>
            <div className="flex-container" id="video-container">
                <VidReg record={currentRecord} />
            </div>
            <div className="small">Up next:</div>
            <div>{redTeam} v. {blueTeam}</div>
        </div >
    );

    return showHud ? hudContainer() : intermissionScreen();
};

// TODO: switch to youtube playlist instead of intermission_records.json

export default Hud;
