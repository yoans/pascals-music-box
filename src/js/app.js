import React from 'react';
import {
    PlayButton,
    PauseButton,
    MuteToggleButton,
    PrevButton,
    NextButton
 
} from 'react-player-controls';
import {makePizzaSound} from './play-notes';
import {
    emptyGrid,
    newGrid,
    nextGrid,
    removeFromGrid,
    addToGrid
} from './balls-logic';
import {
    updateCanvas,
    setUpCanvas,
    getAdderWithMousePosition
} from './animations';
import {TrashButton} from './buttons/trash-button';
import {EditButton} from './buttons/edit-button';
import {ArrowButton} from './buttons/arrow-button';
import {
    LargeGridIcon,
    SmallGridIcon,
    RabbitIcon,
    TurtleIcon,
    InfoIcon,
    ShareIcon
} from './buttons/icons';
import {setSliderOnChange} from './sliders';
import presets from './presets';

const chance = new Chance();
const maxSize = 20;
const minSize = 2;
const minNoteLength = -500;
const maxNoteLength = -50;
const sound = ({
    play:()=>{
        const theSound = makePizzaSound(1, undefined, .001);
        theSound.play();
        setTimeout(
            ()=>{theSound.stop()},
            1
        )
    }
});
const interactSound = (state) => (state.muted ? undefined : sound.play());
const putBallsInGrid = (balls) => ({"size":8,"balls":balls,"muted":true});
export class Application extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tut: "TutorialButtonStartGreen",
            currentPreset:-1,
            presets,
            inputDirection: 0,
            noteLength: props.noteLength || 275,
            grid: props.grid || newGrid(11, 0),
            playing: false,
            muted: true,
            deleting: false,
            horizontalSymmetry: false,
            verticalSymmetry: false,
            backwardDiagonalSymmetry: false,
            forwardDiagonalSymmetry: false,
            inputNumber: 1
        };
        setUpCanvas(this.state);
    }

    componentDidMount() {
        // this.play();
        const idsAndCallbacks = [
            {id: '#grid-size-slider', onChange: this.newSize},
            {id: '#note-length-slider', onChange: this.newNoteLength}
        ]
        setSliderOnChange(idsAndCallbacks);
    }

    timerID = undefined

    play = () => {
        this.timerID = setInterval(
            () => this.nextGrid(this.state.noteLength),
            this.state.noteLength,
        );
        this.setState({ playing: true });
        interactSound(this.state);
    }
    resetTimer = () => {
        clearInterval(this.timerID);
        if (this.state.playing) {
            this.play();
        }
    }
    pause = () => {
        clearInterval(this.timerID);
        this.setState({ playing: false });
    }
    muteToggle = () => {
        this.setState({ muted: !this.state.muted });
        interactSound(this.state);
    }
    changeEditMode = () => {
        this.setState({ deleting: !this.state.deleting });
    }
    newSize = (value) => {
        const input = parseInt(value, 10);

        this.setState({
            grid: {
                ...this.state.grid,
                id: chance.guid(),
                size: input,
            },
        });
    }
    newNoteLength = (value) => {
        this.resetTimer();
        const input = parseInt(value, 10);

        this.setState({
            noteLength: -1*input,
        });
    }
    nextGrid = (length) => {
        this.setState({
            grid: nextGrid({
                ...this.state.grid,
                id: chance.guid(),
                muted: this.state.muted 
            }, length),
        });
    }
    newInputDirection = (inputDirection) => {
        this.setState({
            inputDirection,
        });
    }
    newGrid = (number, size) => {
        this.setState({
            grid: newGrid(size, number),
        });
    }
    emptyGrid = () => {
        this.setState({
            grid: emptyGrid(this.state.grid.size),
        });
    }
    removeTutHighlight = () => {
        this.setState({
            tut: '',
        });
    }
    addPreset = () => {
        
        const encoded = window.btoa(
            JSON.stringify({
                noteLength:this.state.noteLength,
                grid: this.state.grid
            })
        );
        console.log(encoded);

    }
    addToGrid = (x, y, e) => {
        if (e.shiftKey || this.state.deleting) {
            this.setState({
                grid: removeFromGrid(this.state.grid, x, y)
            });
        } else {
            this.setState({
                grid: addToGrid(this.state.grid, x, y, this.state.inputDirection, this.state.inputNumber, 1)
            });
        }
    }
    share = () => {
        ga('send', {
            hitType: 'social',
            socialNetwork: 'Facebook',
            socialAction: 'share',
            socialTarget: 'http://myownpersonaldomain.com'
          });
        const gridString = window.btoa(JSON.stringify({
            grid: this.state.grid,
            noteLength: this.state.noteLength,
            muted: this.state.muted
        }));
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fpascalsmusicbox.sagaciasoft.com/?data=${gridString}&amp;src=sdkpreparse`;
        window.open(shareUrl,'newwindow','width=300,height=250');return false;
    }
    render() {
        const newDate = new Date();
        updateCanvas(this.state, newDate);
        return (
            <div className="no-copy midi-toys-app">
                <div className="edit-options">
                    <div className=" edit-options-member app-title-div">
                        <h1 data-step="1" data-intro="Welcome to Pascal's Music Box!">
                            Pascal's Music Box
                        </h1>
                    </div>
                </div>
                
            
                <div
                    className="edit-options"
                >
                
                <div className="edit-options-member">
                        <div className="">
                            <button
                                className={"TutorialButton isEnabled " + this.state.tut} 
                                onClick={()=>{
                                    this.removeTutHighlight();
                                    introJs()
                                    .setOption('hideNext', true)
                                    .setOption('hidePrev', true)
                                    .setOption('showStepNumbers', false)
                                    .setOption('exitOnOverlayClick', false)
                                    .start();
                                }}
                            >
                                <InfoIcon/>
                            </button> 
                        </div>
                    </div>
                    <div
                        className="edit-options-member"
                    >
                        <div
                            className="slider-container"
                            data-step="5"
                            data-intro="Adjust the speed with this slider."
                        >
                            <input
                                id="note-length-slider"
                                className="ball-input"
                                type="range"
                                max={maxNoteLength}
                                min={minNoteLength}
                                value={-1*this.state.noteLength}
                            />
                        </div>
                        <div
                            className="slider-icon-container"
                        >
                            <RabbitIcon/>
                            <TurtleIcon/>
                        </div>
                    </div>
                    <div
                        className="edit-options-member"
                        data-step="14"
                        data-intro="Unmute to hear your creation."
                    >
                        <MuteToggleButton
                            isEnabled={true}
                            isMuted={this.state.muted}
                            onMuteChange={this.muteToggle}
                        />
                    </div>
                </div>
                <div
                    className="edit-options"
                >
                    <div
                        className="edit-options-member"
                        data-step="13"
                        data-intro="Get Creative!"
                    >
                        <div
                            className="edit-options-member"
                            data-step="8"
                            data-intro="Delete some balls by clicking on them."
                        >
                            <div
                                id="sketch-holder"
                                data-step="2"
                                data-intro="Click on the grid to draw an Ball."
                                onClick={getAdderWithMousePosition(this.addToGrid)}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className="edit-options"
                >
                <div 
                        className="edit-options-member"
                        data-step="11"
                        data-intro="Change the ball direction."
                    >
                    {
                        [
                            (
                                <ArrowButton
                                    number={this.state.inputNumber}
                                    onClick={
                                        () => this.newInputDirection(1)
                                    } 
                                    direction="Up"
                                />),
                            (
                                <ArrowButton
                                    number={this.state.inputNumber}
                                    onClick={
                                        () => this.newInputDirection(2)
                                    }
                                    direction="Right"
                                />),
                            (
                                <ArrowButton
                                    number={this.state.inputNumber}
                                    onClick={
                                        () => this.newInputDirection(3)
                                    }
                                    direction="Down"
                                />),
                            (
                                <ArrowButton
                                    number={this.state.inputNumber}
                                    onClick={
                                        () => this.newInputDirection(0)
                                    }
                                    direction="Left"
                                />),
                        ][this.state.inputDirection]
                    }</div>
                    <div
                        className="edit-options-member"
                    >
                        <div
                            className="slider-container"
                            data-step="12"
                            data-intro="Adjust the grid with this slider."
                        >
                            <input
                                id="grid-size-slider"
                                className="ball-input" 
                                type="range"
                                max={maxSize}
                                min={minSize}
                                value={this.state.grid.size}
                            />
                        </div>
                        <div className="slider-icon-container">
                            <LargeGridIcon/>
                            <SmallGridIcon/>
                        </div>
                    
                    </div>
                    
                    <div
                        className="edit-options-member"
                        data-step="6"
                        data-intro="Switch to erase mode."
                    >
                        <div 
                            data-step="10"
                            data-intro="Switch to draw mode."
                        >
                            <EditButton isEditing={!this.state.deleting} onClick={this.changeEditMode} className={this.state.deleting ? 'EraseIconRotate' : 'EditIconRotate'}/>
                        </div>
                    </div>
                </div>
                <div className="edit-options">
                    {/*<PlusButton 
                        onClick={this.addPreset}
                    /> */}
                    
                    <div className="edit-options-member">

                        <PrevButton
                            onClick={()=>{
                                let NextPreset = this.state.currentPreset - 1;
                                
                                if (NextPreset<0) {
                                    NextPreset = this.state.presets.length -1;
                                }
 
                                this.setState({
                                    grid: this.state.presets[NextPreset],
                                    currentPreset: NextPreset
                                });
                            }}
                            isEnabled={true}
                        />
                    </div> 
                    <div
                        className="edit-options-member"
                        data-step="3"
                        data-intro="Press play to watch your creation unfold."
                    >
                        <div
                            data-step="7"
                            data-intro="Pause to allow easier editing."
                        >
                        <div
                            data-step="15"
                            data-intro="Check to see that your device has sound enabled and play your music."
                        >
                            {
                                this.state.playing ?
                                <PauseButton  onClick={this.pause}></PauseButton> :
                                <PlayButton isEnabled={true} onClick={this.play}></PlayButton>
                            }
                            </div>
                        </div>
                    </div>
                    <div
                        className="edit-options-member" 
                        data-step="4"
                        data-intro="Press this to see other examples."
                    >
                        <NextButton
                            onClick={()=>{
                                let NextPreset = this.state.currentPreset + 1;
                                
                                if (NextPreset>=this.state.presets.length) {
                                    NextPreset = 0;
                                }

                                this.setState({
                                    grid: this.state.presets[NextPreset],
                                    currentPreset: NextPreset
                                });
                            }}
                            isEnabled={true}
                        />
                    </div>
                </div>
                
                <div className="edit-options">
                    <div
                        className="edit-options-member"
                        data-step="9"
                        data-intro="Trash the whole thing."
                    >
                        <TrashButton onClick={this.emptyGrid}/>
                    </div>
                    <div className= "spacer-div-next-to-trash"/>
                    <div
                        className="edit-options-member"
                        data-step="16"
                        data-intro="Share your creation on Facebook!"
                    >
                        <button
                            className="ShareButton isEnabled"
                            onClick={this.share}
                        >
                            <ShareIcon/>
                        </button> 
                    </div>
                </div>
                <select id="midiOut" className="ball-input">
                    <option value="">Not connected</option>
                </select>
            </div>
        );
    }
}
