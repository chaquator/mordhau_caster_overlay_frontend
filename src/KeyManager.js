import React, { useState, useEffect } from 'react'
import LoginForm from './LoginForm.js'
import LogoutForm from './LogoutForm.js'

function KeyManager() {
    const [auth, setAuth] = useState(null);
    const [keys, setKeys] = useState([]);

    useEffect(() => {
        fetch("/api/keys/auth", {
            method: "GET",
            credentials: "same-origin"
        }).then(r => {
            setAuth({ auth: r.ok });
        });
    }, []);

    useEffect(() => {
        if (auth && auth.auth) {
            fetch("/api/keys/keys")
                .then(r => r.json())
                .then(json => {
                    setKeys(json.keys);
                });
        }
    }, [auth]);

    const handleLogin = () => { setAuth({ auth: true }) };
    const handleLogout = () => { setAuth({ auth: false }) };

    const handleCreateKey = () => {
        fetch("/api/keys/create_key", {
            method: "POST",
            credentials: "same-origin"
        }).then(r => {
            if (r.ok) {
                return r.json();
            }
        }).then(json => {
            if (json) {
                const key = json.key
                setKeys([...keys, key]);
            }
        });
    };

    const handleDeleteKey = (key) => {
        fetch("/api/keys/delete_key", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ key: key })
        }).then(r => {
            if (r.ok) {
                let newKeys = [...keys];
                const idx = keys.indexOf(key);
                if (idx !== -1) {
                    newKeys.splice(idx, 1);
                    setKeys(newKeys);
                }
            }
        });
    };

    const handleClearKeys = () => {
        fetch("/api/keys/clear_keys", {
            method: "POST",
            credentials: "same-origin"
        }).then(r => {
            if (r.ok) {
                setKeys([]);
            }
        });
    }

    const authElem = () => {
        if (auth) {
            if (auth.auth) {
                return (
                    <div>
                        Keys:
                        <KeyList keys={keys} deleteCb={handleDeleteKey} />

                        <p>You are logged in</p>
                        <p>
                            <button onClick={handleCreateKey}>Create new key</button>
                            <button onClick={handleClearKeys}>Clear keys</button>
                        </p>
                        <LogoutForm route="/api/keys/logout" onLogout={handleLogout} />
                    </div>
                );
            } else {
                return (
                    <div>
                        <p>Not logged in</p>
                        <LoginForm route="/api/keys/login" onLogin={handleLogin} />
                    </div>
                );
            }
        } else {
            return <p>Retrieving login status...</p>;
        }
    };

    return (
        <div>
            <h1>Key Manager</h1>
            {authElem()}
        </div>
    );
}

function KeyList({ keys, deleteCb }) {
    if (keys.length === 0) {
        return (<ul><li>Currently no keys</li></ul>);
    }
    const keyItems = keys.map((key) =>
        <li key={key}>
            <KeyElem keyVal={key} deleteCb={deleteCb} />
        </li>
    );
    return (
        <ul>{keyItems}</ul>
    );
}

function KeyElem({ keyVal, deleteCb }) {
    const handleClick = () => {
        deleteCb(keyVal);
    }
    const handleCopy = () => {
        window.prompt("Copy this key:", keyVal);
    }
    return (
        <div>
            {keyVal}
            <br />
            <button onClick={handleClick}>Delete</button>
            <button onClick={handleCopy}>Copy</button>
        </div>
    );
}

export default KeyManager;
