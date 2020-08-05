var ctx
var canvas
var video
var frameSumArr = []

// Canvas stuff
var myChart

// FFT stuff
var fftr1
var arrLen = 256
var maxInd, maxVal

// normalization
var cropSize = 100;
var normFactor = 1/(cropSize*cropSize*25);
var filter = Array.prototype.filter.call.bind(Array.prototype.filter)
var t0 = performance.now();

// Getting frequency
var times = [];
var timesLen = arrLen/4;
var curPollFreq;

// Heartrate
var heartrate


function drawToCanvas(element_id, data) {
  const element = document.getElementById(element_id);
  const width = element.clientWidth;
  const height = element.clientHeight;
  const n = data.length;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  element.appendChild(canvas);

  const context = canvas.getContext('2d');
  context.strokeStyle = 'blue';
  context.beginPath();
  data.forEach((c_value, i) => {
    context.lineTo(i * width / n, height/2 * (1.5 - c_value.real));
  });
  context.stroke();
}


function onCapabilitiesReady(capabilities) {
  console.log(capabilities);
}

async function setupCamera() {
    await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: 300,
      }
    })
    .then((stream) => {
      video = document.querySelector('video');
      video.srcObject = stream;

        // get an active track of the stream to print capabilities
        const track = stream.getVideoTracks()[0];
        video.addEventListener('loadedmetadata', (e) => {
          window.setTimeout(() => (
            onCapabilitiesReady(track.getCapabilities())
          ), 500);
        });

        // Added trigger to get video width and height
      video.addEventListener( "loadedmetadata", loadCanvas, false );

    })
    .catch(err => console.error('getUserMedia() failed: ', err));
    console.log('setuep cmaera done');
}

async function loadCanvas(){
    // Set up canvas
    canvas = document.getElementById('output');
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx = canvas.getContext('2d');
    video.play();

    drawWebcam();
    pollctx();
}

async function drawWebcam(){
    ctx.drawImage(video,0,0,canvas.width, canvas.height);
//    console.log('webcam drawn');

    requestAnimationFrame(drawWebcam);
}


// Use with below code to get only red, maybe improve SNR
//    videoDataSum = filter(videoData, everyFourth)
//        .reduce((a, b) => a + b, 0);
function everyFourth(elem, i) {
    return (i-2) % 4 == 0

}

async function pollctx(){
    // Get Image data from canvas
    videoData = ctx.getImageData(100, 100, cropSize, cropSize).data;

    // Sum pixels of video data
    videoDataSum = videoData.reduce((a, b) => a + b, 0);
    videoDataSum -= cropSize*cropSize*255 // remove alpha
    videoDataSum = videoDataSum*normFactor;

        // Add sum to array
    frameSumArr.push(videoDataSum);
    if (frameSumArr.length > arrLen){
        frameSumArr.shift()

        // Calculate the FFT and update the chart
        calcFFT();
    }else{
        console.log(frameSumArr.length)
    }


    // Get next animation

    times.push(performance.now()-t0);
    if (times.length > timesLen){
        times.shift();
        curPollFreq = 1/(times.reduce((a, b) => a + b, 0)/timesLen/1000);

        if (isNaN(heartrate)){
            heartrate = maxInd*curPollFreq/arrLen*30;
        }

        heartrate = heartrate + ( maxInd*curPollFreq/arrLen*30 - heartrate)*.01;
        heartrateIndicator = document.getElementById('heartrate')
        heartrateIndicator.textContent = "Predicted heartrate: " + Math.round(heartrate) + " BPM"

    }
    t0 = performance.now();
    requestAnimationFrame(pollctx);
    myChart.update(); // This position prevents the graph from jumping
}

async function calcFFT(){

    tmp = fftr1.forward(frameSumArr);

    maxVal = 0;
    maxInd = 0;

    // Find peaks past the meyer wave and DC noise freqs
    tmp.forEach((item, index, arr) => {
        arr[index] = Math.abs(item)
        if (index > 8 && arr[index] > maxVal){
            maxInd = index
            maxVal = arr[index]
        }
    })
    updateChart(myChart, tmp.slice(1))

}



function updateChart(chart, datas){
    chart.data.datasets = [{
            label: 'Heartrate FFT',
            data: datas,

            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }];

}

//function sumImage()

async function main() {
    // Set up camera
    await setupCamera();



    fftr1 = new window.kiss.FFTR(arrLen);






    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [...Array(arrLen).keys()],
        datasets: [{
            label: 'FFT Maybe',

            data: [12, 19, 3, 5, 2, 3],

            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
//        responsive:true,
//        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
//                    max: .2,
                    max: 1,
                    min: -1
                }
            }]
        }
    }
    });
}

main();

