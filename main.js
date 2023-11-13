const cam = document.querySelector('#video');
let emotions = []; // Array para armazenar emoções

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

async function startVideo() {
  const constraints = { video: true };

  try {
    let stream = await navigator.mediaDevices.getUserMedia(constraints);

    cam.srcObject = stream;
    cam.onloadedmetadata = (e) => {
      cam.play();
    };
  } catch (err) {
    console.error(err);
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

        // Adicionar emoção ao array
        emotions.push(predominantEmotion);
      }

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, detections);
      faceapi.draw.drawFaceExpressions(canvas, detections);
    }, 100);
  });
}

function getPredominantEmotion(expressions) {
    // Objeto que mapeia emoções às suas pontuações
    const emotionScores = {
      'neutral': expressions.neutral,
      'happy': expressions.happy,
      'sad': expressions.sad,
      'angry': expressions.angry,
      'fearful': expressions.fearful,
      'disgusted': expressions.disgusted,
      'surprised': expressions.surprised,
    };
  
    // Saída de log para as pontuações individuais
    console.log('Pontuações de Expressões:', expressions);
  
    // Encontrar a emoção com a pontuação mais alta
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
  

// Adiciona um botão para salvar emoções em um arquivo
document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Salvar Emoções';
  saveButton.addEventListener('click', saveEmotionsToFile);
  document.body.appendChild(saveButton);
});

function saveEmotionsToFile() {
  // Verificar se há emoções para salvar
  if (emotions.length === 0) {
    alert('Nenhuma emoção detectada para salvar.');
    return;
  }

  // Converter o array de emoções em uma string
  const emotionsString = emotions.join('\n');

  // Criar um Blob com o conteúdo da string
  const blob = new Blob([emotionsString], { type: 'text/plain' });

  // Criar um objeto URL para o Blob
  const url = URL.createObjectURL(blob);

  // Criar um link para o download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'emoctions.txt';

  // Adicionar o link ao corpo e simular o clique
  document.body.appendChild(a);
  a.click();

  // Remover o link do corpo
  document.body.removeChild(a);
}
