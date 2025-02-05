import React, {ButtonHTMLAttributes} from 'react';
import './Button.css'

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement>{
    children: React.ReactNode
    active?: boolean
}

const Button: React.FC<IButton> = ({active, children, ...props}) => {
    return (
        <button className={`button${active ? 'active' : ''}`} {...props}>{children}</button>
    );
}

export default Button;