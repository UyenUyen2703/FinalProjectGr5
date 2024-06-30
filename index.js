const URL = "https://teachablemachine.withgoogle.com/models/iF4oN3hXh/";
// const axios = require('axios');
let recognizer;
let scores = [];
let humans = [];

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    try {
        // check that model and metadata are loaded via HTTPS requests.
        await recognizer.ensureModelLoaded();
        return recognizer;
    } catch (error) {
        console.error('Failed to load model:', error);
        throw error;
    }
}

function findMax(arr) {
    let max = arr[0]['score'];
    let maxIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        if (arr[i]['score'] > max) {
            maxIndex = i;
            max = arr[i]['score'];
        }
    }

    return maxIndex;
}

async function init() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const labelContainer = document.getElementById("label-container");

    try {
        recognizer = await createModel();
    } catch (error) {
        console.error('Failed to initialize recognition:', error);
        return;
    }

    const classLabels = recognizer.wordLabels(); // get class labels

    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;

    recognizer.listen(result => {
        scores.length = 0;
        humans.length = 0;
        scores = [...result.scores]; // probability of prediction for each class

        // render the probability scores per class
        for (let i = 0; i < classLabels.length; i++) {
            scores = [...result.scores]
            if(i == classLabels.length - 1){
                break
            }
            const classPrediction = `${classLabels[i]}: ${result.scores[i].toFixed(2)}`;
            const human = {
                class: classLabels[i],
                score: result.scores[i].toFixed(2)
            };
            humans.push(human);
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }
        scores = [...result.scores]
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    setTimeout(async () => {
        await recognizer.stopListening();
        console.log(humans);
        console.log(scores);
        const found = findMax(humans);
        console.log("Ket qua: ", humans[found]);
startBtn.disabled = false;
        stopBtn.disabled = true;
        await axios.get('http://localhost:3000/predict/'+humans[found]['class']).then(res => {
            console.log(res.data);
        });
    }, 5000);
}

document.getElementById('startBtn').addEventListener('click', init);
document.getElementById('stopBtn').addEventListener('click', async () => {
    await recognizer.stopListening();
});