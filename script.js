// --- Elementos del DOM ---
const assDollarsSpan = document.getElementById('assDollars');
const assCountSpan = document.getElementById('assCount');
const characterSpeech = document.getElementById('characterSpeech');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinButton = document.getElementById('spinButton');
const viewCollectionButton = document.getElementById('viewCollectionButton');
const vaultButton = document.getElementById('vaultButton');
const messageDisplay = document.getElementById('messageDisplay');

const collectionModal = document.getElementById('collectionModal');
const buttCollectionList = document.getElementById('buttCollectionList');
const vaultModal = document.getElementById('vaultModal');
const closeButtons = document.querySelectorAll('.close-button');

// --- Sonidos ---
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const assDestructionSound = document.getElementById('assDestructionSound');

// --- Variables del Juego ---
let assDollars = 1000;
let buttCollection = {}; // Objeto para almacenar la colección de glúteos (nombre: cantidad)

const buttTypes = [
    { name: 'Glúteo Común', img: 'assets/butt_common.png', value: 50, rarity: 'common' },
    { name: 'Glúteo Raro', img: 'assets/butt_rare.png', value: 150, rarity: 'rare' },
    { name: 'Glúteo Legendario', img: 'assets/butt_legendary.png', value: 500, rarity: 'legendary' },
    { name: 'Ass Destruction', img: 'assets/butt_destruction.png', value: -200, rarity: 'destruction' } // Valor negativo para pérdida
];

const phrases = {
    initial: [
        '¡Bienvenidos, mortales! ¡Apostemos esos culos!',
        '¡Siento el olor a riqueza y... a glúteos!',
        '¡Prepárense para la dominación anal!'
    ],
    win: [
        '¡ESOS CULOS SON MÍOOOOOS!',
        '¡Dominación total! ¡Más glúteos para mi colección!',
        '¡Tus glúteos ahora son míos, jajaja!'
    ],
    lose: [
        '¡NOOOOOO! ¡Cómo osas resistirte!',
        '¡Me has quitado mis preciados glúteos! ¡RÁPIDO, DAME MÁS!',
        '¡Mis glúteos! ¡Los quiero de vuelta AHOOOORA!'
    ],
    assDestruction: [
        '¡AAAAAAAAAAH! ¡ASS DESTRUCTION! ¡Todo se ha ido a la mierda!',
        '¡EL HORROR! ¡HEMOS PERDIDO TODO! ¡MALDITOS SEAN LOS GLÚTEOS!'
    ]
};

// --- Funciones del Juego ---

function updateDisplay() {
    assDollarsSpan.textContent = assDollars;
    const totalButts = Object.values(buttCollection).reduce((sum, count) => sum + count, 0);
    assCountSpan.textContent = totalButts;
}

function speak(message) {
    characterSpeech.textContent = message;
    // Podrías añadir animaciones aquí para el Ass Dominator
}

function getRandomButtType() {
    // Simula las probabilidades
    const rand = Math.random();
    if (rand < 0.05) return buttTypes.find(b => b.rarity === 'destruction'); // 5% Ass Destruction
    if (rand < 0.25) return buttTypes.find(b => b.rarity === 'legendary');  // 20% Glúteo Legendario (0.25 - 0.05)
    if (rand < 0.65) return buttTypes.find(b => b.rarity === 'rare');       // 40% Glúteo Raro (0.65 - 0.25)
    return buttTypes.find(b => b.rarity === 'common');                      // 35% Glúteo Común
}

function spinReel(reelElement, resultButt) {
    return new Promise(resolve => {
        // Reinicia la animación y asegura que la imagen de resultado no se muestre inicialmente
        reelElement.classList.remove('result');
        reelElement.innerHTML = ''; // Limpia el contenido anterior

        // Añade una imagen de un glúteo genérico o animado para el efecto de giro
        const spinningImage = document.createElement('img');
        spinningImage.src = 'assets/butt_spinning.png'; // Una imagen de glúteo genérica o un icono de giro
        spinningImage.alt = 'Girando...';
        reelElement.appendChild(spinningImage);
        reelElement.classList.remove('stop'); // Asegura que la animación de giro esté activa

        spinSound.currentTime = 0; // Reinicia el sonido si ya está sonando
        spinSound.play();

        setTimeout(() => {
            reelElement.classList.add('stop'); // Detiene la animación de giro
            reelElement.innerHTML = ''; // Limpia la imagen de giro
            const resultImage = document.createElement('img');
            resultImage.src = resultButt.img;
            resultImage.alt = resultButt.name;
            reelElement.appendChild(resultImage);
            reelElement.classList.add('result'); // Aplica la animación de mostrar resultado
            resolve();
        }, 1000 + Math.random() * 500); // Duración de giro aleatoria para cada reel
    });
}

async function spin() {
    if (assDollars < 100) { // Cuesta 100 AssDólares por giro
        messageDisplay.textContent = '¡No tienes suficientes AssDólares para girar!';
        speak('¡Pobre! ¡Necesitas más AssDólares para jugar!');
        return;
    }

    assDollars -= 100;
    updateDisplay();
    spinButton.disabled = true; // Deshabilita el botón mientras giran los carretes

    messageDisplay.textContent = '¡Girando la rueda del destino de glúteos...!';
    speak('¡La rueda gira! ¡Siento la emoción!');

    const results = [getRandomButtType(), getRandomButtType(), getRandomButtType()];

    await Promise.all([
        spinReel(reel1, results[0]),
        spinReel(reel2, results[1]),
        spinReel(reel3, results[2])
    ]);

    processResult(results);
    spinButton.disabled = false;
}

function processResult(results) {
    const [res1, res2, res3] = results;

    // Verificar si los tres glúteos son iguales
    if (res1.name === res2.name && res2.name === res3.name) {
        if (res1.rarity === 'destruction') {
            handleAssDestruction();
        } else {
            handleWin(res1);
        }
    } else {
        handleLoss();
    }
}

function handleWin(buttWon) {
    const multiplier = buttWon.rarity === 'legendary' ? 5 : (buttWon.rarity === 'rare' ? 3 : 1);
    const assDollarsGained = buttWon.value * multiplier;

    assDollars += assDollarsGained;
    if (buttCollection[buttWon.name]) {
        buttCollection[buttWon.name]++;
    } else {
        buttCollection[buttWon.name] = 1;
    }

    updateDisplay();
    winSound.play();
    messageDisplay.textContent = `¡GANASTE! ¡Obtuviste un ${buttWon.name} y ${assDollarsGained} AssDólares!`;
    speak(phrases.win[Math.floor(Math.random() * phrases.win.length)]);
    characterSpeech.classList.add('animate-win');
    setTimeout(() => characterSpeech.classList.remove('animate-win'), 1000); // Remover clase después de la animación
}

function handleLoss() {
    // Si pierde, Ass Dominator roba un glúteo si el jugador tiene alguno
    let buttStolen = false;
    if (Object.keys(buttCollection).length > 0) {
        const buttNames = Object.keys(buttCollection);
        const randomButtName = buttNames[Math.floor(Math.random() * buttNames.length)];
        if (buttCollection[randomButtName] > 0) {
            buttCollection[randomButtName]--;
            if (buttCollection[randomButtName] === 0) {
                delete buttCollection[randomButtName];
            }
            buttStolen = true;
        }
    }

    updateDisplay();
    loseSound.play();
    if (buttStolen) {
        messageDisplay.textContent = '¡PERDISTE! El Ass Dominator te ha robado un glúteo!';
        speak('¡NOOOO! ¡Cómo osas resistirte! ¡Dame tus glúteos!');
    } else {
        messageDisplay.textContent = '¡PERDISTE! El Ass Dominator se burla de tu falta de glúteos.';
        speak('¡No tienes nada que robar, patético!');
    }
    characterSpeech.classList.add('animate-lose');
    setTimeout(() => characterSpeech.classList.remove('animate-lose'), 1000); // Remover clase después de la animación
}

function handleAssDestruction() {
    assDollars = Math.max(0, assDollars - 500); // Pierde 500 AssDólares o se queda en 0
    buttCollection = {}; // Pierde todos los glúteos
    updateDisplay();
    assDestructionSound.play();
    messageDisplay.textContent = '¡¡¡ASS DESTRUCTION!!! ¡Has perdido 500 AssDólares y toda tu colección de glúteos!';
    speak(phrases.assDestruction[Math.floor(Math.random() * phrases.assDestruction.length)]);
    characterSpeech.classList.add('animate-destruction');
    setTimeout(() => characterSpeech.classList.remove('animate-destruction'), 1000); // Remover clase después de la animación
}

function showCollection() {
    buttCollectionList.innerHTML = ''; // Limpiar la lista
    if (Object.keys(buttCollection).length === 0) {
        buttCollectionList.innerHTML = '<li>Aún no tienes glúteos en tu colección. ¡A girar!</li>';
    } else {
        for (const buttName in buttCollection) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${buttName}</strong>: ${buttCollection[buttName]}`;
            buttCollectionList.appendChild(listItem);
        }
    }
    collectionModal.style.display = 'flex';
}

function showVault() {
    vaultModal.style.display = 'flex';
}

// --- Event Listeners ---
spinButton.addEventListener('click', spin);
viewCollectionButton.addEventListener('click', showCollection);
vaultButton.addEventListener('click', showVault);

closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.closest('.modal').style.display = 'none';
    });
});

// Cerrar modales haciendo clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target == collectionModal) {
        collectionModal.style.display = 'none';
    }
    if (event.target == vaultModal) {
        vaultModal.style.display = 'none';
    }
});


// --- Inicialización del Juego ---
window.onload = () => {
    updateDisplay();
    speak(phrases.initial[Math.floor(Math.random() * phrases.initial.length)]);
    // Precargar imágenes de los glúteos para evitar el parpadeo en el primer giro
    buttTypes.forEach(butt => {
        const img = new Image();
        img.src = butt.img;
    });
    const spinningImg = new Image();
    spinningImg.src = 'assets/butt_spinning.png';
};