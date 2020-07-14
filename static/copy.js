var ctx
var canvas
var video
var frameSumArr = []

// Canvas stuff
var myChart

// FFT stuff
var fftr1
var arrLen = 64

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
    drawWebcam();
    pollctx();
}

function drawWebcam(){
    ctx.drawImage(video,0,0,video.videoWidth,video.videoHeight);
    requestAnimationFrame(drawWebcam);
}


// vv This one's for you Jer bear vv
function pollctx(){
    // Get Image data from canvas
    videoData = ctx.getImageData(0, 0, video.videoWidth, video.videoHeight).data;
    // Sum pixels of video data
    videoDataSum = videoData.reduce((a, b) => a + b, 0);
    videoDataSum = videoDataSum/(video.videoWidth*video.videoHeight*255*3)
//    console.log(videoDataSum);

    // Add sum to array
    frameSumArr.push(videoDataSum);
    if (frameSumArr.length > arrLen){
        frameSumArr.shift()
//        tmp = fftr1.forward(frameSumArr)

        updateChart(myChart, frameSumArr)
        console.log(videoDataSum)
    } else{
        console.log(frameSumArr.length)
    }


    // Get next animation

    requestAnimationFrame(pollctx);
    myChart.update(); // This position prevents the graph from jumping
}


function updateChart(chart, datas){
    chart.data.datasets = [{
            label: 'FFT Maybe',
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
        scales: {
            yAxes: [{
                ticks: {
                    max: .3,
                    min: .28
                }
            }]
        }
    }
});

}

main();

