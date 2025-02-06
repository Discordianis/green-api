import React, {Suspense, useEffect, useState} from 'react';
import './Auth.css'
import Button from "../../components/Button/Button.tsx";
import useInput from "../../hooks/useInput.tsx";
import useSuccess from "../../hooks/useSuccess.tsx";
import {observer} from "mobx-react";
import GreenAPI from "../../store/greenAPI.tsx";
import Loading from "../../components/Loading/Loading.tsx";
import unvisible from '../../../public/visibility_off.svg'
import visible from '../../../public/visibility.svg'

interface IInstance {
    stateInstance: 'authorized' | 'unauthorized'
}

const Auth: React.FC = observer(() => {
    const idInstance = useInput();
    const apiTokenInstance = useInput();
    const {showNotification, NotificationComponent} = useSuccess();
    const [showPass, setShowPass] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const storedData = localStorage.getItem('greenAPI');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                if (parsedData.idInstance && parsedData.apiTokenInstance) {
                    GreenAPI.updateGreenAPI('1', parsedData.idInstance, parsedData.apiTokenInstance);
                }
            } catch (error) {
                console.error("Ошибка при парсинге данных аутентификации:", error);
                localStorage.removeItem('greenAPI');
            }
        }
        setLoading(false);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idInstance.value || !apiTokenInstance.value) return;

        setLoading(true);
        try {
            const res = await fetch(
                `https://api.green-api.com/waInstance${idInstance.value}/getStateInstance/${apiTokenInstance.value}`, {
                    method: 'GET'
                }
            );

            const data: IInstance = await res.json();
            if (data?.stateInstance === "authorized") {
                const greenApiData = {
                    idInstance: idInstance.value,
                    apiTokenInstance: apiTokenInstance.value,
                    authStatus: '1'
                };
                localStorage.setItem('greenAPI', JSON.stringify(greenApiData));
                GreenAPI.updateGreenAPI('1', idInstance.value, apiTokenInstance.value);
            } else {
                showNotification('Инстанс не активирован!', 'error');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка авторизации!', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToken = (e: React.FormEvent) => {
        e.preventDefault();
        setShowPass(!showPass);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={'auth_rooter'}>
            <div className={'auth_root'}>
                <Suspense fallback={<Loading />}>
                    <h2>Вход в систему</h2>
                    <div className={'auth_root_sub'}>
                        <div className={'auth_help'}>
                            <h3>Как войти в систему?</h3>
                            <span>• Войдите или зарегистрируйтесь на платформе <a href={'https://green-api.com/'}>Green API</a>.</span>
                            <span>• В консоли профиля после входа в аккаунт создайте инстанс и войдите в него.</span>
                            <span>• Ниже вы увидите QR-код, с его помощью привяжите ваш WhatsApp аккаунт с созданным инстансом.</span>
                            <span>• Когда инстанс станет активным, скопируйте «<span style={{fontFamily: 'monospace'}}>idInstance</span>» и «<span style={{fontFamily: 'monospace'}}>apiTokenInstance</span>».</span>
                            <span>• Вставьте скопированные данные в соответствующие поля здесь.</span>
                        </div>
                        <div className={'form_auth'}>
                            <form>
                                <input
                                    type="text"
                                    placeholder="idInstance"
                                    value={idInstance.value}
                                    autoComplete={'name'}
                                    onChange={(e) => idInstance.onChange(e)}
                                    maxLength={10}
                                    required
                                />
                                <div className={'input_token'}>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="apiTokenInstance"
                                        value={apiTokenInstance.value}
                                        onChange={(e) => apiTokenInstance.onChange(e)}
                                        maxLength={50}
                                        required
                                    />
                                    <img src={showPass ? unvisible : visible} onClick={showToken} alt="" />
                                </div>
                                <div className={'auth_button'}>
                                    <Button onClick={handleSubmit}>Войти</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <NotificationComponent />
                </Suspense>
            </div>
        </div>
    );
});

export default Auth;
