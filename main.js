let audioCtx; // Declare audio context
let osc1, osc2; // Declare oscillator nodes
let gainNode; // Declare gain node to control volume
let pannerNode1, pannerNode2; // Declare panner nodes for stereo panning and each oscillator
let env1, env2; // Declare envelope nodes for each oscillator
let currentGain; // Declare a variable to store the current gain value
const aMinorPentatonic = [440, 523.25, 587.33, 659.25, 783.99, 880]; // A minor pentatonic scale specified in Hz


// Function to create an oscillator with a given frequency
function createOscillator(frequency) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine'; // Set waveform type
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime); // Set frequency
    return osc;
}

// Function to apply an ADSR envelope to a given gain node
function applyEnvelope(env, attack, decay, sustain, release, duration) {
    const now = audioCtx.currentTime;
    env.gain.cancelScheduledValues(now); // Clear previous automation

    // Attack phase: Ramp up to full volume
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(gainNode.gain.value, now + attack);

    // Decay phase: Drop to sustain level
    env.gain.linearRampToValueAtTime(sustain, now + attack + decay);

    // Release phase starts after duration
    const releaseStart = now + attack + decay + duration;
    env.gain.setValueAtTime(sustain, releaseStart);
    env.gain.linearRampToValueAtTime(0, releaseStart + release);
}

// Start audio a context when the user clicks the start button
document.getElementById("startButton").addEventListener("click", () => {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
   
});

// Smooth fade-out when stopping using the stop button
document.getElementById("stopButton").addEventListener("click", () => {
    if (osc1 && ocs2 && gainNode) {
        const fadeTime = 1; // Duration of fade-out in seconds
        currentGain = gainNode.gain.value; // Capture current volume

        // Start fade-out smoothly from the current gain value
        gainNode.gain.setValueAtTime(currentGain, audioCtx.currentTime); // Avoid sudden jumps
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeTime);

        // Stop oscillator after fade-out completes
        setTimeout(() => {
            osc1.stop();
            osc1 = null; // Clear reference
            osc2.stop();
            osc2 = null; // Clear reference
        }, fadeTime * 1000);
    }
});

const images = document.querySelectorAll("img");

images.forEach(img => {
    img.addEventListener("mouseenter", () => {

    let randomNote = aMinorPentatonic[Math.floor(Math.random() * aMinorPentatonic.length)];
    let randomBeating = Math.floor(Math.random() * 10) + 5;
    console.log(randomNote, randomBeating);

    // Create oscillators
    osc1 = createOscillator(randomNote);
    osc2 = createOscillator(randomNote + randomBeating);

    // Create a gain node to control volume
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Set initial volume

    // Create envelope nodes
    env1 = audioCtx.createGain();
    env2 = audioCtx.createGain();

    // Set initial volume for eneveope nodes
    env1.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    env2.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);

    // Create panner nodes
    pannerNode1 = audioCtx.createStereoPanner();
    pannerNode2 = audioCtx.createStereoPanner();

    // Set pan positions (-1 = full left, 1 = full right)
    pannerNode1.pan.setValueAtTime(-1, audioCtx.currentTime); // Pan left
    pannerNode2.pan.setValueAtTime(1, audioCtx.currentTime);  // Pan right

    // Connect nodes
    osc1.connect(pannerNode1);
    osc2.connect(pannerNode2);
    pannerNode1.connect(env1);
    pannerNode2.connect(env2);
    env1.connect(gainNode);
    env2.connect(gainNode);
    gainNode.connect(audioCtx.destination); // Connect to audio context destination

    let noteDuration = 2.0; // Total note duration
    // Apply ADSR envelope to each oscillator
    applyEnvelope(env1, 0.01, 0.1, 0.5, 0.8, noteDuration);
    applyEnvelope(env2, 0.1, 0.2, 0.8, 1.2, noteDuration);

    // Start oscillator
    osc1.start();
    osc2.start();
    });

    img.addEventListener("mouseleave", () => {
        console.log(`Mouse left image`);
    });
});