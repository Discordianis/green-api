import {useState} from 'react';

const useSuccess = () => {

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        setTimeout(() => {
            setNotification(null)
        }, 3000)
    }

    const NotificationComponent = () => {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: '70px',
                    right: '20px',
                    padding: '10px 20px',
                    backgroundColor: notification?.type === 'success' ? '#017561' : '#ad4242',
                    color: '#fff',
                    borderRadius: '5px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    transition: 'opacity 0.5s ease-in-out',
                    opacity: notification?.message ? 1 : 0,
                }}
            >
                {notification?.message}
            </div>
        );
    }
    return {NotificationComponent, showNotification}
}
export default useSuccess