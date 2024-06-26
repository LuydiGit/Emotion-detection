const cam = document.querySelector('#video');
let emotions = [];
const userData = JSON.parse(localStorage.getItem('userData'));
console.log(userData.user.id);

// Extrair o ID do paciente da URL
let urlParams = new URLSearchParams(window.location.search);
let patientId = urlParams.get('patientId'); // Asume que a URL é algo como 'detection.html?patientId=123'

if (!patientId) {
    console.error('ID do paciente não fornecido');
    // Trate o caso em que não há um paciente selecionado
    // Por exemplo, redirecionar de volta para a página de seleção de pacientes
}


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo).catch(error => {
  console.error('Erro ao carregar modelos:', error);
  // Se ocorrer um erro ao carregar os modelos, envie 'sem camera' para o servidor
  saveEmotionToServer('sem camera');
});

async function startVideo() {
  try {
    const constraints = { video: true };
    let stream = await navigator.mediaDevices.getUserMedia(constraints);

    cam.srcObject = stream;
    cam.onloadedmetadata = (e) => {
      cam.play();
    };
  } catch (err) {
    console.error('Erro ao acessar a câmera:', err);
    // Se ocorrer um erro ao acessar a câmera, envie 'camera não detectada' para o servidor
    saveEmotionToServer('camera não detectada');
    return;
  }

  cam.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(cam);
    document.body.append(canvas);
    const displaySize = { width: cam.width, height: cam.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(cam, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length > 0) {
        const emotionsData = detections[0].expressions;
        const predominantEmotion = getPredominantEmotion(emotionsData);
        console.log('Predominant Emotion:', predominantEmotion);

        const timestamp = new Date();
        const formattedTimestamp = `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;

        const emotionWithTimestamp = `${formattedTimestamp} - ${predominantEmotion}`;
        emotions.push(emotionWithTimestamp);

        // Send emotions data to the server
        saveEmotionToServer(emotionWithTimestamp);
      }

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceExpressions(canvas, detections);
    }, 200);
  });
}

function getPredominantEmotion(expressions) {
  const emotionScores = {
    'neutral': expressions.neutral,
    'happy': expressions.happy,
    'sad': expressions.sad,
    'angry': expressions.angry,
    'fearful': expressions.fearful,
    'disgusted': expressions.disgusted,
    'surprised': expressions.surprised,
  };

  console.log('Pontuações de Expressões:', expressions);

  let predominantEmotion = 'neutral';
  let highestScore = 0;

  for (const emotion in expressions) {
    if (expressions[emotion] > highestScore) {
      highestScore = expressions[emotion];
      predominantEmotion = emotion;
    }
  }

  return predominantEmotion;
}

function saveEmotionToServer(emotion) {
  fetch("http://localhost:3000/saveEmotions", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      // Envie `patient_id` em vez de `user_id`
      body: JSON.stringify({ emotion, timestamp: new Date(), patient_id: patientId }),
  })
  .then(response => response.json())
  .then(data => {
      console.log("Resposta do servidor:", data);
  })
  .catch(error => {
      console.error("Erro na requisição:", error);
  });
}