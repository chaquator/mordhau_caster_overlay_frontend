import React from 'react';
import useWidthPair from '../useWidthPair.js';
import ReactPlayer from 'react-player';

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
    const [playerNameMap, setPlayerNameMap] = React.useState(null);
    const [intermissionRecords, setIntermissionRecords] = React.useState(null);

    const [currentRecord, setCurrentRecord] = React.useState(null);
    const [videoMuted, setVideoMuted] = React.useState(null);

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

    const randomVideo = () => {
        if (!intermissionRecords) return;

        const randomRecord = intermissionRecords[Math.floor(Math.random() * intermissionRecords.length)];
        setCurrentRecord(randomRecord);
        console.log("Playing", randomRecord);
        setVideoMuted(true);
    };

    const handleStartPlaying = () => {
        requestAnimationFrame(() => {
            setVideoMuted(false);
        });
    }

    const onVidError = () => {
        console.error(arguments);
        console.error(currentRecord);
        randomVideo();
    }

    React.useEffect(() => {
        (async () => {
            // Wait for font to load
            await document.fonts.load("1em Rubik");

            fetch("/intermission_records.json")
                .then(r => r.json())
                .then(json => {
                    setIntermissionRecords(json);
                });

            fetch("/names.json")
                .then(r => r.json())
                .then(json => {
                    setPlayerNameMap(json);
                });

            fetch("/icon_map.json")
                .then(r => r.json())
                .then(json => {
                    setIconMap(json);
                });

            initWs();
        })();
    }, []);

    React.useEffect(() => {
        randomVideo();
    }, [intermissionRecords]);

    const teamNameLookup = s => s.toLowerCase().replace(/ */g, "");

    const iconSrc = name => {
        if (!iconMap) return null;
        if (iconMap.icons) {
            return iconMap.icons[teamNameLookup(name ?? "")] ?? "/icons/default.png";
        }
        return null;
    };

    const lookupAuthor = author => {
        if (!author) return '';
        if (!playerNameMap) return '';

        return playerNameMap[author];
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

    const intermissionScreen = () => (
        <div className="flex-container" id="intermission-container">
            <div>Intermission</div>
            <div className="small">Montage by: {lookupAuthor(currentRecord?.author)}</div>
            <div className="flex-container" id="video-container">
                <ReactPlayer
                    id="video-player"
                    width="100%" height="100%"
                    url={currentRecord?.url}
                    volume="0.125"
                    muted={videoMuted}
                    playing={true}
                    controls={true}
                    onEnded={randomVideo}
                    onStart={handleStartPlaying}
                    onError={onVidError}
                />
            </div>
            <div className="small">Up next:</div>
            <div>{redTeam} v. {blueTeam}</div>
        </div >
    );

    return showHud ? hudContainer() : intermissionScreen();
};

export default Hud;
