import React from 'react';
import { render } from 'react-dom';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';
import StatusManager from './StatusManager.js';
import KeyManager from './KeyManager.js';
import Hud from './hud/Hud.js';

render(
    (<Router>
        <Routes>
            <Route path="/manage">
                <Route path="status" element={<StatusManager />} />
                <Route path="keys" element={<KeyManager />} />
            </Route>
            <Route path="/" element={<Hud />} />
        </Routes>
    </Router>),
    document.getElementById('root')
);
