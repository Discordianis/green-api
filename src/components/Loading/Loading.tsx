import React from 'react';
import loadingImg from '../../../public/loading.gif'

const Loading: React.FC = () => {
    return (
        <div className={'loading_root'}>
            <img src={loadingImg} alt={'loading'}/>
        </div>
    );
}

export default Loading;