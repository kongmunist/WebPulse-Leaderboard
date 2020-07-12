var ctx
var canvas
var video
var frameSumArr = []

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
    console.log(videoDataSum);

    // Add sum to array
    frameSumArr.push(videoDataSum);
    console.log(frameSumArr);

    // Get next animation
    requestAnimationFrame(pollctx);
}


//function sumImage()

async function main() {
    // Set up camera
    await setupCamera();


}

main();

