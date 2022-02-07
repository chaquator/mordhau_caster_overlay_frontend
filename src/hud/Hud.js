import React from 'react';

function Hud() {
    const [showHud, setShowHud] = React.useState(null);
    const [redTeam, setRedTeam] = React.useState(null);
    const [redScore, setRedScore] = React.useState(null);
    const [blueTeam, setBlueTeam] = React.useState(null);
    const [blueScore, setBlueScore] = React.useState(null);

    const redTeamElem = React.useRef(null);
    const redScoreElem = React.useRef(null);
    const blueTeamElem = React.useRef(null);
    const blueScoreElem = React.useRef(null);

    const [iconMap, setIconMap] = React.useState(null);

    const displayStyle = React.useMemo(() => {
        return { display: showHud ? "inline-block" : "none" };
    }, [showHud]);

    React.useEffect(() => {
        (async () => {
            // Wait for font to load
            await document.fonts.load("1em Rubik");

            const WS_ENDPOINT = (() => {
                let url = new URL(document.URL);
                url.protocol = "ws:";
                url.pathname = "/wsapp/";

                return url;
            })();

            await fetch("/icon_map.json")
                .then(r => r.json())
                .then(json => {
                    setIconMap(json);
                });

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
        })();
    }, []);

    const [widthTeamRed, setWTR] = React.useState(null);
    const [widthTeamBlue, setWTB] = React.useState(null);
    const [widthScoreRed, setWSR] = React.useState(null);
    const [widthScoreBlue, setWSB] = React.useState(null);

    const width = e => {
        const comp_style = getComputedStyle(e);
        const w = parseFloat(comp_style.width);
        return w;
    };

    // Width adjust part 1: reset elements's width to auto
    const widthAdjustPart1 = (setWidthR, setWidthB) => {
        setWidthR("auto");
        setWidthB("auto");
    };

    // Width adjust part 2: with width set to auto, parse width of elements to set both widths to max of the two
    const widthAdjustPart2 = (elemR, elemB, setWidthR, setWidthB) => {
        window.requestAnimationFrame(() => {
            const wRed = width(elemR);
            const wBlue = width(elemB);
            const wMax = wRed > wBlue ? wRed : wBlue;
            setWidthR(wMax);
            setWidthB(wMax);
        });
    };

    // Adjust width of score and team name elements when changes are made
    React.useEffect(() => {
        widthAdjustPart1(setWTR, setWTB);
    }, [redTeam, blueTeam]);
    React.useEffect(() => {
        widthAdjustPart1(setWSR, setWSB);
    }, [redScore, blueScore]);
    React.useEffect(() => {
        if (widthTeamRed === "auto" && widthTeamBlue === "auto") {
            widthAdjustPart2(redTeamElem.current, blueTeamElem.current, setWTR, setWTB);
        }
    }, [widthTeamRed, widthTeamBlue]);
    React.useEffect(() => {
        if (widthScoreRed === "auto" && widthScoreBlue === "auto") {
            widthAdjustPart2(redScoreElem.current, blueScoreElem.current, setWSR, setWSB);
        }
    }, [widthScoreRed, widthScoreBlue]);

    const teamNameLookup = s => s.toLowerCase().replace(/ */g, "");

    const iconSrc = name => {
        if (!iconMap) return null;
        if (iconMap.icons) {
            return iconMap.icons[teamNameLookup(name ?? "")] ?? "/icons/default.png";
        }
        return null;
    };

    const styleWidthAdjusted = w => {
        const wStr = w?.toString() === "NaN" ? "auto" : w;
        return {
            ...displayStyle,
            ...{ width: wStr }
        }
    };

    return (
        <div id="hud-container">
            <img style={displayStyle} id="red-icon" src={iconSrc(redTeam)} />
            <span style={styleWidthAdjusted(widthTeamRed)} ref={redTeamElem} id="red-team" className="elem">{redTeam}</span>
            <span style={styleWidthAdjusted(widthScoreRed)} ref={redScoreElem} id="red-score" className="elem">{redScore ?? 0}</span>
            <span style={styleWidthAdjusted(widthScoreBlue)} ref={blueScoreElem} id="blue-score" className="elem">{blueScore ?? 0}</span>
            <span style={styleWidthAdjusted(widthTeamBlue)} ref={blueTeamElem} id="blue-team" className="elem">{blueTeam}</span>
            <img style={displayStyle} id="blue-icon" src={iconSrc(blueTeam)} />
        </div>
    );
};

export default Hud;
