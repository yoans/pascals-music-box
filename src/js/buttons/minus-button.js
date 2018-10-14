import React from 'react';
import {MinusIcon} from './icons';
export const MinusButton = ({onClick}) => (
    <button className={"PlusButton isEnabled"} onClick={onClick}>
        <MinusIcon></MinusIcon>
    </button>
)