function LoginForm({ route, onLogin }) {
    const handleSubmit = e => {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const key = form.get("key");

        fetch(route, {
            method: "POST",
            body: JSON.stringify({ authKey: key }),
            credentials: "same-origin",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        }).then(r => {
            if (r.ok) {
                onLogin();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Login key: <input type="password" name="key" /> </label>
            <button type="submit">Login</button>
        </form>
    );
}

export default LoginForm;
