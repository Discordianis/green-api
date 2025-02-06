import React from "react";
import './NotFound.css'
import {NavLink} from "react-router-dom";
import Button from "../../components/Button/Button.tsx";

const NotFound:React.FC = () => {

    return (
        <div className={'not_found_root'}>
            <div className={'not_found_span'}>
                <span className={'not_found_span_1'}>—</span>
                <span className={'not_found_span_2'}>404</span>
            </div>
            <div className={'not_found_button'}>
                <NavLink to={'/'}>
                    <Button>Главная</Button>
                </NavLink>
            </div>
        </div>
    )
}
export default NotFound