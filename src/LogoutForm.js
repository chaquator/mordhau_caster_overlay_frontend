function LogoutForm({ route, onLogout }) {
    const handleSubmit = e => {
        e.preventDefault();

        fetch(route, {
            method: "POST"
        }).then(_ => {
            onLogout();
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <button type="submit">Logout</button>
        </form>
    );
}

export default LogoutForm;
