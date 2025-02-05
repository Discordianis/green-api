import React, {useEffect, useState} from 'react';
import './Auth.css'
import Button from "../../components/Button/Button.tsx";
import useInput from "../../hooks/useInput.tsx";
import useSuccess from "../../hooks/useSuccess.tsx";
import {observer} from "mobx-react";
import GreenAPI from "../../store/greenAPI.tsx";

interface IInstance {
    stateInstance: 'authorized' | 'unauthorized'
}

const Auth: React.FC = observer(() => {
    const idInstance = useInput()
    const apiTokenInstance = useInput()
    const [jsonData, setJsonData] = useState<IInstance | null>(null)
    const {showNotification, NotificationComponent} = useSuccess()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (idInstance.value && apiTokenInstance.value) {
            try {
                const res = await fetch(`https://api.green-api.com/waInstance${idInstance.value}/getStateInstance/${apiTokenInstance.value}`, {
                    method: 'GET'
                })
                const data: IInstance = await res.json()
                if (data && data?.stateInstance === "authorized") {
                    setJsonData(data)
                    const greenApiData = {
                        idInstance: idInstance.value,
                        apiTokenInstance: apiTokenInstance.value,
                        authStatus: '1'
                    }
                    localStorage.setItem('greenAPI', JSON.stringify(greenApiData))
                    GreenAPI.updateGreenAPI('1' ,idInstance.value, apiTokenInstance.value)
                    console.log(jsonData)
                }
                else {
                    showNotification('Инстанс не активирован!', 'error')
                    console.log(data)
                }
            }
            catch (e) {
                console.log('Error: ', e)
                showNotification('Такого аккаунта не существует!', 'error')
            }
        }
    };

    useEffect(() => {
        console.log(idInstance.value)
    }, [idInstance.value]);

    return (
        <div className={'auth_root'}>
            <h2>Вход в систему</h2>
            <div className={'auth_root_sub'}>
                <div className={'auth_help'}>
                    <h3>Как войти в систему?</h3>
                    <span>• Войдите или зарегистрируйтесь на платформе <a
                        href={'https://green-api.com/'}>Green API</a>.</span>
                    <span>• В консоли профиля после входа в аккаунт создайте инстанс и войдите в него.</span>
                    <span>• Ниже вы увидите QR-код, с его помощью привяжите ваш WhatsApp аккаунт с созданным инстансом.</span>
                    <span>• Когда инстанс станет активным, скопируйте «<span style={{fontFamily: 'monospace'}}>idInstance</span>» и «<span style={{fontFamily: 'monospace'}}>apiTokenInstance</span>».</span>
                    <span>• Вставьте скопированные данные в соответствующие поля здесь.</span>
                </div>
                <div className={'form_auth'}>
                    <form>
                        <input type="text" placeholder="idInstance" value={idInstance.value}
                               onChange={(e) => idInstance.onChange(e)} required/>
                        <input type="text" placeholder="apiTokenInstance" value={apiTokenInstance.value}
                               onChange={(e) => apiTokenInstance.onChange(e)} required/>
                        <div className={'auth_button'}>
                            <Button onClick={handleSubmit}>Войти</Button>
                        </div>
                    </form>
                </div>
            </div>
            <NotificationComponent />
        </div>
    );
});

export default Auth;