import React from 'react';
import {BallIcon} from './icons';
export const BallButton = ({onClick, direction, number}) => (
    <button className={"ArrowButton isEnabled"} onClick={onClick}>
        <div className={"number-overlayee"}>
            <BallIcon direction={direction}></BallIcon>
            <div className={'number-overlay'}>
                {/* <h4>{number}</h4> */}
            </div>
        </div>
    </button>
)