const audioFileInput = document.getElementById('audio-file');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyser;

audioFileInput.addEventListener('change', handleAudioFile);

function handleAudioFile(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, (audioBuffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            source.start(0);
            visualize();
        });
    };

    fileReader.readAsArrayBuffer(file);
}

function drawGraphics(dataArray, bufferLength, barWidth) {
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 2;
        const hue = i * 360 / bufferLength;
        ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
    }
}

function visualize() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (canvas.width / bufferLength) * 2.5;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        drawGraphics(dataArray, bufferLength, barWidth);

        requestAnimationFrame(draw);
    }

    draw();
}
