const handleFetchImage = async () => {
  const url = document.getElementById("input-text").value
  if (url.length == 0) {
    alert("Please enter image URL")
    return;
  }
  try {
    const response = await fetch(url)
    if (response.status != 404) {
      const blob = await response.blob()
      const imgURL = URL.createObjectURL(blob)
      img.src = imgURL
      showVideo()
    }
    else {
      alert("Image not found")
    }
  }
  catch(err) {
    alert("Cannot fetch the image")
  }

  // img.src = url
  // try {
  //   showVideo()
  // }
  // catch(err) {
  //   alert("Cannot fetch image")
  // }
}

const toggleSelfie = async () => {
  selfie_mode = !selfie_mode
  if (selfie_mode) {
    document.getElementsByClassName("input_video")[0].classList.add("selfie-mode")
    document.getElementsByClassName("output_canvas")[0].classList.add("selfie-mode")
    document.getElementById("selfie-btn").value = "Selfie Mode: On"
    document.getElementById("selfie-btn").classList.add("grass-green-bg")
    document.getElementById("selfie-btn").classList.remove("red-bg")


  }
  else {
    document.getElementsByClassName("input_video")[0].classList.remove("selfie-mode")
    document.getElementsByClassName("output_canvas")[0].classList.remove("selfie-mode")
    document.getElementById("selfie-btn").value = "Selfie Mode: Off"
    document.getElementById("selfie-btn").classList.remove("grass-green-bg")
    document.getElementById("selfie-btn").classList.add("red-bg")
  }
}

const showVideo = () => {
  const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    }});
    selfieSegmentation.setOptions({
    modelSelection: 1,
    });
    selfieSegmentation.onResults(onResults);
    
    const camera = new Camera(videoElement, {
    onFrame: async () => {
      await selfieSegmentation.send({image: videoElement});
    },
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
    });
    camera.start();
}

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.segmentationMask, 0, 0,
                      canvasElement.width, canvasElement.height);

  // Only overwrite existing pixels.

  canvasCtx.globalCompositeOperation = 'source-out';
  canvasCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Only overwrite missing pixels.

  canvasCtx.globalCompositeOperation = 'destination-atop';
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.restore();
}

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 450;

let selfie_mode = false

const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

canvasCtx.width = CANVAS_WIDTH;
canvasCtx.height = CANVAS_HEIGHT;

const img = new Image()

document.getElementById("input-btn").addEventListener("click", handleFetchImage)
document.getElementById("selfie-btn").addEventListener("click", toggleSelfie)