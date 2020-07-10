var ctx
var canvas
var video

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
    console.log(ctx);
    requestAnimationFrame(pollctx);
}


//function sumImage()

async function main() {
    // Set up camera
    await setupCamera();


}

main();

