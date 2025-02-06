import React, {useEffect, useState} from "react";
import Auth from "./features/Auth/Auth.tsx";
import Chat from "./features/Chat/Chat.tsx";
import './App.css'
import GreenAPI from "./store/greenAPI.tsx";
import {observer} from "mobx-react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import NotFound from "./features/NotFound/NotFound.tsx";

const App: React.FC = observer(() => {

    const [authStatus, setAuthStatus] = useState('')

    useEffect(() => {
        GreenAPI.getGreenAPI()
        setAuthStatus(GreenAPI.authStatus)
    }, [GreenAPI.authStatus]);

    return (
        <div className="app">
            <BrowserRouter>
                <Routes>
                    {authStatus ?
                        <>
                            <Route path={''} element={<Chat />} />
                            <Route path={'*'} element={<NotFound />} />
                        </>
                        :
                        <>
                            <Route path={''} element={<Auth />} />
                            <Route path={'*'} element={<NotFound />} />
                        </>
                    }
                </Routes>
            </BrowserRouter>
        </div>
    );
});

export default App;