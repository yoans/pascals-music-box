
import Pizzicato from 'pizzicato';
import notesFrequencies from 'notes-frequencies';
import {makeMIDImessage} from './midi';

const getIndex = (x, y, size, vector) => {
    if (vector === 0 || vector === 5) {
        return x;
    }
    return y;
};
// const frequencies = notesFrequencies('C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5');//c Scale
const frequencies = notesFrequencies('e3 a3 b3 c4 e4 f4 a4 b4 e5 a5 b5 c6 e6 f6 a6 b6 e7');//ake bono scale
// const frequencies = notesFrequencies('e3 b3 d4 e4 g4 a4 d5 e5 b5 d6 e6 g6 a6 d7 e7');//Yue-Diao scale
// const frequencies = notesFrequencies('e3 a3 b3 C3 D3 E3 F3 G3 A3 E4 F4 G4 A4');//Bayati scale
const lengthSounds = {}
const sounds = (length) => frequencies.map((freq, noteIndex)=>{
    const aSound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            frequency: frequencies[noteIndex][0],
            attack: 0,
            release: 0.1,
            type: 'sine',
            volume: .5
        },
    });
    var dubDelay = new Pizzicato.Effects.DubDelay({
        feedback: 0.1,
        time: length*2.5/1000,
        mix: 1,
        cutoff: 200
    });
    var dubDelay2 = new Pizzicato.Effects.DubDelay({
        feedback: 0.1,
        time: length*3.33/1000,
        mix: 1,
        cutoff: 700
    });
    var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
        frequency: 1000,
        peak: 6
    });
    
    aSound.addEffect(dubDelay);
    aSound.addEffect(dubDelay2);
    aSound.addEffect(lowPassFilter);
    return aSound;
})
export const makePizzaSound = (index, length, volume = .5) => {
    //cacheSounds!
    // const frequencies = notesFrequencies('D3 F3 G#3 C4 D#4 G4 A#5');
    const noteIndex = index % frequencies.length;
    if (!lengthSounds[length]){
        lengthSounds[length] = sounds(length);
    }
    return lengthSounds[length][noteIndex]
};
export const playSounds = (boundaryArrows, size, length, muted) => {
    const alreadyPlayedMap = {};
    var sounds = [];
    
    boundaryArrows.map((arrow) => {
        const speed = getIndex(arrow.x, arrow.y, size, arrow.vector);

        if (!muted && !alreadyPlayedMap[speed]) {
            alreadyPlayedMap[speed] = [speed];
            const snd = makePizzaSound(speed, length);
            sounds.push(snd);
        }
        makeMIDImessage(speed, length).play();
    });
    if (!muted){
        sounds.map((thisSound) => {
            thisSound.play();
            setTimeout(
                () => {
                    thisSound.stop();
                },
                length - 1
            );
        });
    }
};
