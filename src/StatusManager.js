import React from 'react';
import LoginForm from './LoginForm.js'
import LogoutForm from './LogoutForm.js'

function StatusManager() {
    const [auth, setAuth] = React.useState(null);
    const [status, setStatus] = React.useState({});
    const [iconMap, setIconMap] = React.useState({});

    React.useEffect(() => {
        fetch("/api/status/auth", {
            method: "GET",
            credentials: "same-origin",
        }).then(r => {
            setAuth({ auth: r.ok });
        });

        fetch("/public/icon_map.json")
            .then(r => r.json())
            .then(json => {
                setIconMap(json);
            });

        fetch("/api/data")
            .then(r => r.json())
            .then(json => {
                setStatus(json);
            });
    }, []);

    const handleLogin = () => { setAuth({ auth: true }); };

    const handleLogout = () => { setAuth({ auth: false }); }

    const handleStatusUpdate = status => {
        setStatus(status);

        fetch("/api/status/set_status", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: status })
        });
    };

    const auth_elem = () => {
        if (auth) {
            if (auth.auth) {
                return (
                    <div>
                        <p>You are logged in</p>
                        <LogoutForm route="/api/status/logout" onLogout={handleLogout} />
                    </div>
                );
            } else {
                return (
                    <div>
                        <p>Not logged in</p>
                        <LoginForm route="/api/status/login" onLogin={handleLogin} />
                    </div>
                );
            }
        } else {
            return <p>Retrieving login status...</p>;
        }
    };

    return (
        <div>
            <h1>Status Manager</h1>
            <StatusForm status={status} iconMap={iconMap} updateCb={handleStatusUpdate} />
            {auth_elem()}
        </div>
    );
}

function StatusForm({ status, iconMap, updateCb }) {
    const [intermissionMode, setIntermissionMode] = React.useState(true);
    const [redTeam, setRedTeam] = React.useState('');
    const [redScore, setRedScore] = React.useState(0);
    const [blueTeam, setBlueTeam] = React.useState('');
    const [blueScore, setBlueScore] = React.useState(0);

    React.useEffect(() => {
        if (status.show_hud) setIntermissionMode(!status.show_hud);
        if (status.hud) {
            const hud = status.hud;
            if (hud.red_team) setRedTeam(hud.red_team);
            if (hud.red_score) setRedScore(hud.red_score);
            if (hud.blue_team) setBlueTeam(hud.blue_team);
            if (hud.blue_score) setBlueScore(hud.blue_score);
        }
    }, [status]);

    const handleSubmit = (e) => {
        e.preventDefault();

        updateCb({
            show_hud: !intermissionMode,
            hud: {
                red_team: redTeam,
                red_score: redScore,
                blue_team: blueTeam,
                blue_score: blueScore
            }
        });
    }

    const optionsList = React.useMemo(() => {
        if (iconMap.names) {
            return iconMap.names.map(name => {
                return (<option key={name} value={name}>{name}</option>);
            });
        }
    }, [iconMap]);

    return (
        <form onSubmit={handleSubmit}>
            <label>Intermission: <input type="checkbox" name="showHud" checked={intermissionMode}
                onChange={_ => setIntermissionMode(!intermissionMode)} /></label> <br />
            <label>
                Red team:
                <select name="redTeam" value={redTeam} onChange={e => setRedTeam(e.target.value)}>
                    {optionsList}
                </select>
            </label> <br />
            <label>Red score: <input type="number" name="redScore" min="0" max="3" value={redScore}
                onChange={e => setRedScore(parseInt(e.target.value))} /></label> <br />

            <label>
                Blue team:
                <select name="blueTeam" value={blueTeam} onChange={e => setBlueTeam(e.target.value)}>
                    {optionsList}
                </select>
            </label> <br />
            <label>Blue score: <input type="number" name="blueScore" min="0" max="3"
                value={blueScore} onChange={e => setBlueScore(e.target.value)} /></label> <br />

            <button type="submit">Update</button>
        </form >
    );
}

export default StatusManager;
