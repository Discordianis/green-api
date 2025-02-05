import React, {useEffect, useState} from "react";
import Auth from "./features/Auth/Auth.tsx";
import Chat from "./features/Chat/Chat.tsx";
import './App.css'
import GreenAPI from "./store/greenAPI.tsx";
import {observer} from "mobx-react";

const App: React.FC = observer(() => {

    const [authStatus, setAuthStatus] = useState('')

    useEffect(() => {
        GreenAPI.getGreenAPI()
        setAuthStatus(GreenAPI.authStatus)
    }, [GreenAPI.authStatus]);

    return (
        <div className="app">
            {authStatus ? <Chat/> : <Auth/>}
        </div>
    );
});

export default App;