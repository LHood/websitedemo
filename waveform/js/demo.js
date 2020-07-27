var AudioContext =
    window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
context = new AudioContext();

wavesurfer = WaveSurfer.create({
    container: "#waveform",
    // waveColor: "violet",
    // progressColor: "purple",
});

$(window).on("mousemove click scroll", function() {
    if (context.state !== "running") {
        context.resume();
    }
});

var animationID;
var audio = document.getElementById("audio");
var defaultFile = "./demos/spectrum-analyzer/modem.mp3";
var channels = 0;
var sampleRate = 0;
var codec;
var bitRate = 0;
var duration = 0;
var lufs = 0;
audio.src = defaultFile;

audio.controls = true;
audio.onpause = function() {
    window.cancelAnimationFrame(animationID);
};

var upload = document.getElementById("upload");

function onFile() {
    var me = this,
        file = upload.files[0],
        name = "salam";
    // name = file.name.replace(/.[^/.]+$/, "");

    // console.log("upload code goes here", file, name);
}

upload.addEventListener(
    "dragenter",
    function(e) {
        upload.parentNode.className = "area dragging";
    },
    false
);

upload.addEventListener(
    "dragleave",
    function(e) {
        upload.parentNode.className = "area";
    },
    false
);

upload.addEventListener(
    "dragdrop",
    function(e) {
        onFile();
    },
    false
);

upload.addEventListener(
    "change",
    function(e) {
        onFile();
        audio.pause();
        window.cancelAnimationFrame(animationID);

        //see http://lostechies.com/derickbailey/2013/09/23/getting-audio-file-information-with-htmls-file-api-and-audio-element/
        var file = e.currentTarget.files[0];

        var objectUrl = URL.createObjectURL(file);

        // var reader = new FileReader();
        // reader.onload = function(ev) {
        audio.src = objectUrl;
        var reader = new FileReader();

        reader.onload = function(evt) {
            // Create a Blob providing as first argument a typed array with the file buffer
            var blob = new window.Blob([new Uint8Array(evt.target.result)]);

            // Load the blob into Wavesurfer
            wavesurfer.loadBlob(blob);
        };

        reader.onerror = function(evt) {
            console.error("An error ocurred reading the file: ", evt);
        };

        // Read File as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    },
    false
);
var fileInput = $("#audio-file");
fileInput.on("change", function(e) {
    audio.pause();
    window.cancelAnimationFrame(animationID);

    //see http://lostechies.com/derickbailey/2013/09/23/getting-audio-file-information-with-htmls-file-api-and-audio-element/
    var file = e.currentTarget.files[0];

    var objectUrl = URL.createObjectURL(file);

    // var reader = new FileReader();
    // reader.onload = function(ev) {
    audio.src = objectUrl;

    // }
    // console.log(reader);
    // reader.readAsDataURL(file);
});
audio.onplay = function() {
    demo.render();
};
// audio.autoplay = true;
document.body.appendChild(audio);

// (function(){

var demo = new Demo({
    ui: {
        logScale: {
            title: "Logarithmic Frequency Scale?",
            value: false,
        },
        // soundSamples: {
        //   title: "Sound Sample",
        //   value: "song-thrush-rspb",
        //   values: [
        //     ["Bird Song (Song Thrush)", "song-thrush-rspb"],
        //     ["Orca (Killer whale)", "transient-orca"],
        //     ["Police Siren", "police-siren"],
        //     ["Modem (Dial up)", "modem"],
        //     ["Violin", "violin"],
        //     ["Whistling", "whistle"],
        //     ["Sad Trombone", "sad-trombone"],
        //     //["Erskine Butterfield", "erskine-butterfield"]
        //   ], //the first value in each pair is the label, the second is the value
        // },
    },

    canvas: document.getElementById("canvas"),
    canvasLog: document.getElementById("canvas-log"),
    labels: document.getElementById("labels"),

    controls: true,
    // Log mode.
    log: false,
    // Show axis labels, and how many ticks.
    showLabels: true,
    ticks: 5,
    speed: 3,
    // FFT bin size,
    fftsize: 2048,
    oscillator: false,
    color: true,

    init: function() {
        $("#demo").append($("#canvas"));
        $("#demo").append($("#canvas-log"));
        $("#demo").append($("#labels"));
        this.attachedCallback();
        this.onStream();
        $("#ui-container").append($(".audio-file-wrapper"));
        $("#ui-container").append($("audio"));
        window.cancelAnimationFrame(animationID);
        // $("#demo").height(Math.round($("#demo").width() * 0.67));
    },

    update: function(e) {
        if (e == "logScale") {
            if (this.ui.logScale.value === false) {
                this.log = false;
            } else {
                this.log = true;
            }
            // this.ctx.fillRect(0,0,this.width, this.height, this.speed, this.speed);
            this.logChanged();
        }

        if (e == "soundSamples") {
            audio.pause();
            window.cancelAnimationFrame(animationID);
            this.ctx.fillRect(0, 0, this.width, this.height);
            audio.src =
                "./demos/spectrum-analyzer/" + this.ui.soundSamples.value + ".mp3";
        }
    },
    // Assumes context is an AudioContext defined outside of this class.

    attachedCallback: function() {
        (this.tempCanvas = document.createElement("canvas")),
        // Get input from the microphone.
        // if (navigator.mozGetUserMedia) {
        //   navigator.mozGetUserMedia({audio: true},
        //                             this.onStream.bind(this),
        //                             this.onStreamError.bind(this));
        // } else if (navigator.webkitGetUserMedia) {
        //   navigator.webkitGetUserMedia({audio: true},
        //                             this.onStream.bind(this),
        //                             this.onStreamError.bind(this));
        // }
        // this.onStream();
        (this.ctx = this.canvas.getContext("2d"));
    },

    render: function() {
        //console.log('Render');
        this.width = window.innerWidth;
        this.width = $("#demo").width();
        this.height = window.innerHeight;
        this.height = Math.round(this.width * 0.67);

        var didResize = false;
        // Ensure dimensions are accurate.
        if (this.canvas.width != this.width) {
            this.canvas.width = this.width;
            this.labels.width = this.width;
            didResize = true;
        }
        if (this.canvas.height != this.height) {
            this.canvas.height = this.height;
            this.labels.height = this.height;
            didResize = true;
        }

        //// this.renderTimeDomain();
        this.renderFreqDomain();

        if (this.showLabels && didResize) {
            this.renderAxesLabels();
        }

        animationID = requestAnimationFrame(this.render.bind(this));

        var now = new Date();
        if (this.lastRenderTime_) {
            this.instantaneousFPS = now - this.lastRenderTime_;
        }
        this.lastRenderTime_ = now;
    },

    renderTimeDomain: function() {
        var times = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteTimeDomainData(times);

        for (var i = 0; i < times.length; i++) {
            var value = times[i];
            var percent = value / 256;
            var barHeight = this.height * percent;
            var offset = this.height - barHeight - 1;
            var barWidth = this.width / times.length;
            this.ctx.fillStyle = "black";
            this.ctx.fillRect(i * barWidth, offset, 1, 1);
        }
    },
    renderFreqDomain: function() {
        var freq = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(freq);

        var ctx = this.ctx;
        // Copy the current canvas onto the temp canvas.
        this.tempCanvas.width = this.width;
        this.tempCanvas.height = this.height;
        //console.log(this.canvas.height, this.tempCanvas.height);
        var tempCtx = this.tempCanvas.getContext("2d");
        tempCtx.drawImage(this.canvas, 0, 0, this.width, this.height);

        // Iterate over the frequencies.
        for (var i = 0; i < freq.length; i++) {
            var value;
            // Draw each pixel with the specific color.
            if (this.log) {
                logIndex = this.logScale(i, freq.length);
                value = freq[logIndex];
            } else {
                value = freq[i];
            }

            ctx.fillStyle = this.color ?
                this.getFullColor(value) :
                this.getGrayColor(value);

            var percent = i / freq.length;
            var y = Math.round(percent * this.height);

            // draw the line at the right side of the canvas
            ctx.fillRect(
                this.width - this.speed,
                this.height - y,
                this.speed,
                this.speed
            );
        }

        // Translate the canvas.
        ctx.translate(-this.speed, 0);
        // Draw the copied image.
        // console.log(this.width, this.height);
        ctx.drawImage(
            this.tempCanvas,
            0,
            0,
            this.width,
            this.height,
            0,
            0,
            this.width,
            this.height
        );

        // Reset the transformation matrix.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    },

    /**
     * Given an index and the total number of entries, return the
     * log-scaled value.
     */
    logScale: function(index, total, opt_base) {
        var base = opt_base || 2;
        var logmax = this.logBase(total + 1, base);
        var exp = (logmax * index) / total;
        return Math.round(Math.pow(base, exp) - 1);
    },

    logBase: function(val, base) {
        return Math.log(val) / Math.log(base);
    },

    renderAxesLabels: function() {
        var canvas = this.labels;
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        var startFreq = 440;
        var nyquist = context.sampleRate / 2;
        var endFreq = nyquist - startFreq;
        var step = (endFreq - startFreq) / this.ticks;
        var yLabelOffset = 5;
        // Render the vertical frequency axis.
        for (var i = 0; i <= this.ticks; i++) {
            var freq = startFreq + step * i;
            // Get the y coordinate from the current label.
            var index = this.freqToIndex(freq);
            var percent = index / this.getFFTBinCount();
            var y = (1 - percent) * this.height;
            var x = this.width - 60;
            // Get the value for the current y coordinate.
            var label;
            if (this.log) {
                // Handle a logarithmic scale.
                var logIndex = this.logScale(index, this.getFFTBinCount());
                // Never show 0 Hz.
                freq = Math.max(1, this.indexToFreq(logIndex));
            }
            var label = this.formatFreq(freq);
            var units = this.formatUnits(freq);
            ctx.font = '16px "Open Sans"';
            ctx.fillStyle = "black";
            // Draw the value.
            ctx.textAlign = "right";
            ctx.fillText(label, x, y + yLabelOffset);
            // Draw the units.
            ctx.textAlign = "left";
            ctx.fillText(units, x + 10, y + yLabelOffset);
            // Draw a tick mark.
            ctx.fillRect(x + 40, y, 30, 2);
        }
    },

    clearAxesLabels: function() {
        var canvas = this.labels;
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, this.width, this.height);
    },

    formatFreq: function(freq) {
        return freq >= 1000 ? (freq / 1000).toFixed(1) : Math.round(freq);
    },

    formatUnits: function(freq) {
        return freq >= 1000 ? "KHz" : "Hz";
    },

    indexToFreq: function(index) {
        var nyquist = context.sampleRate / 2;
        return (nyquist / this.getFFTBinCount()) * index;
    },

    freqToIndex: function(frequency) {
        var nyquist = context.sampleRate / 2;
        return Math.round((frequency / nyquist) * this.getFFTBinCount());
    },

    getFFTBinCount: function() {
        return this.fftsize / 2;
    },

    onStream: function(stream) {
        // var input = context.createMediaStreamSource(stream);
        var input = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = this.fftsize;

        // Connect graph.
        input.connect(analyser);
        input.connect(context.destination);

        this.analyser = analyser;
        // Setup a timer to visualize some stuff.
        this.render();
    },

    onStreamError: function(e) {
        console.error(e);
    },

    getGrayColor: function(value) {
        return "rgb(V, V, V)".replace(/V/g, 255 - value);
    },

    getFullColor: function(value) {
        var colorPalette = {
            0: [255, 255, 255],
            10: [180, 255, 96],
            20: [151, 255, 4],
            30: [124, 255, 255],
            40: [100, 237, 98],
            50: [80, 218, 255],
            60: [64, 196, 255],
            70: [49, 167, 255],
            80: [32, 123, 255],
            90: [15, 67, 255],
            100: [0, 3, 255],
        };

        //floor to nearest 10:
        var decimalised = (100 * value) / 255;
        var percent = decimalised / 100;
        var floored = 10 * Math.floor(decimalised / 10);
        var distFromFloor = decimalised - floored;
        var distFromFloorPercentage = distFromFloor / 10;
        if (decimalised < 100) {
            var rangeToNextColor = [
                colorPalette[floored + 10][0] - colorPalette[floored + 10][0],
                colorPalette[floored + 10][1] - colorPalette[floored + 10][1],
                colorPalette[floored + 10][2] - colorPalette[floored + 10][2],
            ];
        } else {
            var rangeToNextColor = [0, 0, 0];
        }

        var color = [
            colorPalette[floored][0] + distFromFloorPercentage * rangeToNextColor[0],
            colorPalette[floored][1] + distFromFloorPercentage * rangeToNextColor[1],
            colorPalette[floored][2] + distFromFloorPercentage * rangeToNextColor[2],
        ];

        return "rgb(" + color[0] + ", " + color[1] + "," + color[2] + ")";

        // var fromH = 62;
        // var toH = 0;
        // var percent = value / 255;
        // var delta = percent * (toH - fromH);
        // var hue = fromH + delta;
        // return 'hsl(H, 100%, 50%)'.replace(/H/g, hue);
    },

    logChanged: function() {
        if (this.showLabels) {
            this.renderAxesLabels();
        }
    },

    ticksChanged: function() {
        if (this.showLabels) {
            this.renderAxesLabels();
        }
    },

    labelsChanged: function() {
        if (this.showLabels) {
            this.renderAxesLabels();
        } else {
            this.clearAxesLabels();
        }
    },
});

// $(document).on("dragover", function () {
//   $("#__drop").addClass("show");
//   return false;
// });
// $("#__drop").on("drop", function (e) {
//   e.stopPropagation();
//   e.preventDefault();
//   file = e.currentTarget.files[0];
//   $("#__drop").removeClass("show").addClass("hidden");
// });
// $("#__drop").on("dragleave", function () {
//   $("#__drop").removeClass("show").addClass("hidden");
// });

const onChangeFile = (mediainfo) => {
    const file = upload.files[0];
    if (file) {
        const getSize = () => file.size;

        const readChunk = (chunkSize, offset) =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target.error) {
                        reject(event.target.error);
                    }
                    resolve(new Uint8Array(event.target.result));
                };
                reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
            });

        mediainfo
            .analyzeData(getSize, readChunk)
            .then((result) => {
                $("#name").text(file.name);
                setMedias(result.media);
            })
            .catch((error) => {
                // output.value = `An error occured:\n${error.stack}`;
            });
    }
};
MediaInfo({ format: "object" }, (mediainfo) => {
    upload.addEventListener("change", () => onChangeFile(mediainfo));
});

function togglePlay() {
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}
var savedVolume;

function toggleVolume() {
    if (audio.volume == 0) {
        audio.volume == savedVolume;
    } else {
        savedVolume = audio.volume;
        audio.volume == 0;
    }
}

function setMedias(mediaInfo) {
    channels = mediaInfo.track[1].Channels;
    sampleRate = parseInt(mediaInfo.track[1].SamplingRate) / 1000;
    bitRate = parseInt(mediaInfo.track[1].BitRate) / 1000;
    codec = mediaInfo.track[1].Format + " " + mediaInfo.track[1].Format_Profile;
    duration = parseInt(mediaInfo.track[0].Duration);
    channels = parseInt(mediaInfo.track[1].Channels);
    console.log(duration);

    $("#sample-rate").text(sampleRate);
    $("#bit-rate").text(bitRate);
    time = new Date();
    timestamp = time.getTime();
    $("#file_id").text('#' + timestamp);
    $("#channels").text(channels);
    $("#codec").text(codec);
    $("#lufs").text(lufs);
}

document.addEventListener("DOMContentLoaded", function() {
    wavesurfer.on("ready", function() {
        startComputations(wavesurfer);
    });
});

var combined;
var loudness_canvas = null;
var psr_canvas;
var loudness = null;
var psr = null;
var true_peak = null;
var loudness_display = null;
var psr_display = null;
var dbtp_display = null;
var channel_count = null;
var impulseResponseBuffer = null;
var max_true_peak = null;
var worker1_progress = 0;
var worker2_progress = 0;

function integratedLoudness(e) {
    var buffers = e.data.buffers;
    var channelCount = e.data.buffers.length;
    var duration = e.data.duration; //seconds
    var gatingBlockLength = 0.4;
    var channelWeightings = [1, 1];
    var absoluteGatingThreshold = -70; //LKFS
    //var sampleRate = e.data.sampleRate;
    var overlap = 0.25;
    var step = 1 - overlap;
    var numberOfGatingBlocks = Math.floor(
        (duration - gatingBlockLength) / (gatingBlockLength * step)
    );
    console.log("numberOfGatingBlocks", numberOfGatingBlocks);
    var gatingBlockLoudnesses = new Array(numberOfGatingBlocks);
    var channelGatingBlockMS = new Array(channelCount);
    for (var c = 0; c < channelCount; c++) {
        channelGatingBlockMS[c] = new Array(numberOfGatingBlocks);
    }
    var gatingBlockMSesAboveAbsThreshold = [];

    function getSampleIndexAtTime(time, buffers, duration) {
        var samplesPerChannel = buffers[0].length;
        var relativePosition = time / duration;
        return Math.floor(relativePosition * samplesPerChannel);
    }

    function getLoudnessOfGatingBlockMSes(MSes) {
        var sum = 0;
        for (var c = 0; c < channelCount; c++) {
            sum += channelWeightings[c] * MSes[c];
        }

        return -0.691 + 10 * Math.log10(sum);
    }

    // get MSes of all channel blocks
    for (var b = 0; b < numberOfGatingBlocks; b++) {
        var startSampleIndex = getSampleIndexAtTime(
            gatingBlockLength * b * step,
            buffers,
            duration
        );
        var endSampleIndex = getSampleIndexAtTime(
            gatingBlockLength * (b * step + 1),
            buffers,
            duration
        );
        var numberOfSamplesInBlock = endSampleIndex - startSampleIndex;

        for (var c = 0; c < channelCount; c++) {
            var sum = 0;
            for (var s = startSampleIndex; s < endSampleIndex; s++) {
                sum += buffers[c][s];
            }
            //channelGatingBlockMS[c][b] = (1 / gatingBlockLength) * sum;
            channelGatingBlockMS[c][b] = (1 / numberOfSamplesInBlock) * sum;
        }
    }

    //get gating block loudness values and get blocks above absolute threshold
    for (var b = 0; b < numberOfGatingBlocks; b++) {
        gatingBlockLoudnesses[b] = getLoudnessOfGatingBlockMSes([
            channelGatingBlockMS[0][b],
            channelGatingBlockMS[1][b],
        ]);

        if (gatingBlockLoudnesses[b] > absoluteGatingThreshold) {
            gatingBlockMSesAboveAbsThreshold.push([
                channelGatingBlockMS[0][b],
                channelGatingBlockMS[1][b],
            ]); //MS values for both channels for this block

            //optimize!
        }
    }

    var numberOfBlocksAboveAbsThreshold = gatingBlockMSesAboveAbsThreshold.length;

    //compute relative threshold
    var sum = 0;
    for (var c = 0; c < channelCount; c++) {
        var channelSum = 0;
        for (var b = 0; b < numberOfBlocksAboveAbsThreshold; b++) {
            channelSum += gatingBlockMSesAboveAbsThreshold[b][c];
        }

        sum +=
            channelWeightings[c] * (1 / numberOfBlocksAboveAbsThreshold) * channelSum;
    }
    var relativeThreshold = -0.691 + 10 * Math.log10(sum) - 10; //LKFS

    var gatingBlockMSesAboveBothThresholds = gatingBlockMSesAboveAbsThreshold.filter(
        (MSes) => {
            return getLoudnessOfGatingBlockMSes(MSes) > relativeThreshold;
        }
    );

    //compute loudness of gating blocks above both thresholds
    var sum = 0;
    for (var c = 0; c < channelCount; c++) {
        var channelSum = 0;
        for (var b = 0; b < gatingBlockMSesAboveBothThresholds.length; b++) {
            channelSum += gatingBlockMSesAboveBothThresholds[b][c];
        }

        sum +=
            channelWeightings[c] *
            ((1 / gatingBlockMSesAboveBothThresholds.length) * channelSum);
    }

    var gatedLoudness = -0.691 + 10 * Math.log10(sum);

    return gatedLoudness;
}

function startComputations(wavesurfer) {
    loudness_canvas = dom.make(
        "canvass",
        "loudness_canvas",
        "",
        g("loudness_div")
    );
    loudness_canvas.style.width = "100%";
    loudness_canvas.style.height = "150px";

    psr_canvas = dom.make("canvass", "psr_canvas", "", g("psr_div"));
    psr_canvas.style.width = "100%";
    psr_canvas.style.height = "150px";

    var canvas_width = loudness_canvas.getBoundingClientRect().width * 2;
    var canvas_height = loudness_canvas.getBoundingClientRect().height * 2;

    channel_count = wavesurfer.backend.buffer.numberOfChannels;

    var untouched_buffers = [];

    // we will also need the untouched channels for PSR calculation
    var leftChannel_untouched = wavesurfer.backend.buffer.getChannelData(0);
    untouched_buffers.push(leftChannel_untouched);
    if (channel_count == 2) {
        var rightChannel_untouched = wavesurfer.backend.buffer.getChannelData(1);
        untouched_buffers.push(rightChannel_untouched);
    }
    if (channel_count > 2) {
        console.error("Cannot handle more than 2 channels.");
        return;
    }

    /* INTEGRATED LOUDNESS */

    //get an audioBuffer, in which EBU-S values are stored
    var lengthInSeconds =
        leftChannel_untouched.length / wavesurfer.backend.ac.sampleRate;
    //do not resample
    var targetSampleRate = wavesurfer.backend.ac.sampleRate;
    var OAC_IL = new OfflineAudioContext(
        channel_count,
        lengthInSeconds * targetSampleRate,
        targetSampleRate
    );
    var source = OAC_IL.createBufferSource();
    source.buffer = wavesurfer.backend.buffer;

    var splitter = OAC_IL.createChannelSplitter(2);
    var merger = OAC_IL.createChannelMerger(2);

    //first stage shelving filter
    var highshelf_filter = OAC_IL.createBiquadFilter();
    highshelf_filter.type = "highshelf";
    highshelf_filter.Q.value = 1;
    highshelf_filter.frequency.value = 1500;
    highshelf_filter.gain.value = 4;

    // second stage highpass filter
    var highpass_filter = OAC_IL.createBiquadFilter();
    highpass_filter.frequency.value = 76;
    highpass_filter.Q.value = 1;
    highpass_filter.type = "highpass";

    //SQUARING EVERY CHANNEL
    var square_gain = OAC_IL.createGain();
    square_gain.gain.value = 0;

    //CONNECTING EBU GRAPH
    source
        .connect(highshelf_filter)
        .connect(highpass_filter)
        .connect(square_gain);
    highpass_filter.connect(square_gain.gain);
    square_gain.connect(OAC_IL.destination);

    source.start();

    OAC_IL.startRendering().then(function(renderedBuffer) {
        console.log("Rendering completed successfully");
        var signal_filtered_squared = [
            renderedBuffer.getChannelData(0),
            renderedBuffer.getChannelData(1),
        ];

        //compute integrated loudness
        lufs = integratedLoudness({
            data: {
                buffers: signal_filtered_squared,
                duration: wavesurfer.backend.buffer.duration,
            },
        });
        $("#lufs").text(lufs);
    });
}