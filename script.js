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
const vaultGameContainer = document.getElementById('vaultGameContainer');

// --- Sonidos ---
const spinSound = document.getElementById('spinSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const assDestructionSound = document.getElementById('assDestructionSound');
const backgroundMusic = document.getElementById('backgroundMusic');

// --- Variables del Juego ---
let assDollars = 10000;
let buttCollection = {};
let vaultAssDollars = 0;
let vaultGamePlayedThisSession = false;

const buttTypes = [
    { name: 'Glúteo Común', img: 'assets/butt_common.png', value: 50, rarity: 'common' },
    { name: 'Glúteo Raro', img: 'assets/butt_rare.png', value: 150, rarity: 'rare' },
    { name: 'Glúteo Legendario', img: 'assets/butt_legendary.png', value: 500, rarity: 'legendary' },
    { name: 'Ass Destruction', img: 'assets/butt_destruction.png', value: -200, rarity: 'destruction' }
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
}

function getRandomButtType() {
    const rand = Math.random();
    if (rand < 0.05) return buttTypes.find(b => b.rarity === 'destruction');
    if (rand < 0.25) return buttTypes.find(b => b.rarity === 'legendary');
    if (rand < 0.65) return buttTypes.find(b => b.rarity === 'rare');
    return buttTypes.find(b => b.rarity === 'common');
}

function spinReel(reelElement, resultButt) {
    return new Promise(resolve => {
        reelElement.classList.remove('result');
        reelElement.innerHTML = '';
        const spinningImage = document.createElement('img');
        spinningImage.src = 'assets/butt_spinning.png';
        spinningImage.alt = 'Girando...';
        reelElement.appendChild(spinningImage);
        reelElement.classList.remove('stop');

        spinSound.currentTime = 0;
        spinSound.play();

        setTimeout(() => {
            reelElement.classList.add('stop');
            reelElement.innerHTML = '';
            const resultImage = document.createElement('img');
            resultImage.src = resultButt.img;
            resultImage.alt = resultButt.name;
            reelElement.appendChild(resultImage);
            reelElement.classList.add('result');
            resolve();
        }, 1000 + Math.random() * 500);
    });
}

async function spin() {
    if (assDollars < 100) {
        messageDisplay.textContent = '¡No tienes suficientes AssDólares para girar!';
        speak('¡Pobre! ¡Necesitas más AssDólares para jugar!');
        return;
    }

    assDollars -= 100;
    updateDisplay();
    spinButton.disabled = true;

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
}

function handleLoss() {
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
}

function handleAssDestruction() {
    assDollars = Math.max(0, assDollars - 500);
    buttCollection = {};
    updateDisplay();
    assDestructionSound.play();
    messageDisplay.textContent = '¡¡¡ASS DESTRUCTION!!! ¡Has perdido 500 AssDólares y toda tu colección de glúteos!';
    speak(phrases.assDestruction[Math.floor(Math.random() * phrases.assDestruction.length)]);
}

function showCollection() {
    buttCollectionList.innerHTML = '';
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
    vaultGamePlayedThisSession = false;
    document.getElementById('vaultAssDollarsCount').textContent = vaultAssDollars;

    const vaultGameContainer = document.getElementById('vaultGameContainer');
    if (!vaultGamePlayedThisSession) {
        vaultGameContainer.innerHTML = '<button id="startVaultGameButton">JUGAR</button>';
        document.getElementById('startVaultGameButton').onclick = startVaultGame;
    } else {
        vaultGameContainer.innerHTML = '<p>Ya has jugado el mini-juego en esta sesión de la bóveda. ¡Vuelve a girar en la tragamonedas!</p>';
    }

    document.getElementById('depositButton').onclick = depositAssDollars;
    document.getElementById('withdrawButton').onclick = withdrawAssDollars;
}

function depositAssDollars() {
    const amountInput = document.getElementById('assDollarsToMove');
    const amount = parseInt(amountInput.value);
    const vaultMessage = document.getElementById('vaultMessage');

    if (isNaN(amount) || amount <= 0 || amount > assDollars) {
        vaultMessage.textContent = '¡Ass Dominator se burla de tus intentos! Ingresa una cantidad válida.';
        return;
    }

    assDollars -= amount;
    vaultAssDollars += amount;
    updateDisplay();
    amountInput.value = '';
    document.getElementById('vaultAssDollarsCount').textContent = vaultAssDollars;
    vaultMessage.textContent = `¡Has guardado ${amount} AssDólares en la bóveda! ¡Protegidos!`;
    speak('¡Más culos guardados! ¡Perfecto!');
}

function withdrawAssDollars() {
    const amountInput = document.getElementById('assDollarsToMove');
    const amount = parseInt(amountInput.value);
    const vaultMessage = document.getElementById('vaultMessage');

    if (isNaN(amount) || amount <= 0 || amount > vaultAssDollars) {
        vaultMessage.textContent = '¡La bóveda está vacía! ¡No hay nada que retirar!';
        return;
    }

    assDollars += amount;
    vaultAssDollars -= amount;
    updateDisplay();
    amountInput.value = '';
    document.getElementById('vaultAssDollarsCount').textContent = vaultAssDollars;
    vaultMessage.textContent = `¡Has retirado ${amount} AssDólares de la bóveda! ¡Vuelve a apostar!`;
    speak('¡Es hora de que esos AssDólares vuelvan a trabajar!');
}

function startVaultGame() {
    vaultGameContainer.innerHTML = '';

    const allButts = [
        buttTypes.find(b => b.rarity === 'common'),
        buttTypes.find(b => b.rarity === 'common'),
        buttTypes.find(b => b.rarity === 'common'),
        buttTypes.find(b => b.rarity === 'legendary')
    ];
    allButts.sort(() => Math.random() - 0.5);

    allButts.forEach((butt, index) => {
        const img = document.createElement('img');
        img.src = butt.img;
        img.className = 'vault-game-butt';
        img.dataset.isLegendary = (butt.rarity === 'legendary');
        vaultGameContainer.appendChild(img);
    });

    const vaultMessage = document.getElementById('vaultMessage');
    vaultMessage.textContent = '¡Ass Dominator oculta el glúteo legendario! ¡Memoriza su posición!';
    speak('¡Memoriza bien! ¡Si fallas, te burlaré hasta la dominación total!');

    setTimeout(() => {
        const gameButts = document.querySelectorAll('.vault-game-butt');
        gameButts.forEach(butt => {
            butt.src = 'assets/butt_mystery.png';
            butt.classList.add('vault-game-hidden');
            butt.onclick = () => {
                const isLegendary = butt.dataset.isLegendary === 'true';
                endVaultGame(isLegendary);
            };
        });
        vaultMessage.textContent = '¡Ahora adivina! ¡Haz clic en el glúteo legendario!';
        speak('¡El momento de la verdad! ¡Elige!');
    }, 2500);
}

function endVaultGame(win) {
    vaultGamePlayedThisSession = true;
    const vaultMessage = document.getElementById('vaultMessage');

    const gameButts = document.querySelectorAll('.vault-game-butt');
    gameButts.forEach(butt => {
        butt.onclick = null;
        if (butt.dataset.isLegendary === 'true') {
            butt.src = 'assets/butt_legendary.png';
            butt.classList.remove('vault-game-hidden');
        } else {
            butt.src = 'assets/butt_common.png';
            butt.classList.remove('vault-game-hidden');
        }
    });

    if (win) {
        assDollars += 250;
        updateDisplay();
        vaultMessage.textContent = '¡GANASTE! ¡Ass Dominator te premia con 250 AssDólares!';
        speak('¡Impresionante! ¡Mis respetos! Por ahora...');
    } else {
        vaultMessage.textContent = '¡PERDISTE! ¡Ass Dominator se ríe de tu falta de memoria!';
        speak('¡Qué patético! ¡Un verdadero dominador lo habría adivinado!');
    }

    setTimeout(() => {
        vaultGameContainer.innerHTML = '<p>Ya has jugado el mini-juego en esta sesión de la bóveda. ¡Vuelve a girar en la tragamonedas!</p>';
    }, 3000);
}


// --- Event Listeners ---
spinButton.addEventListener('click', spin);
viewCollectionButton.addEventListener('click', showCollection);
vaultButton.addEventListener('click', showVault);

closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.closest('.modal').style.display = 'none';
        vaultGamePlayedThisSession = false;
    });
});

window.addEventListener('click', (event) => {
    if (event.target == collectionModal) {
        collectionModal.style.display = 'none';
    }
    if (event.target == vaultModal) {
        vaultModal.style.display = 'none';
        vaultGamePlayedThisSession = false;
    }
});

// --- Inicialización del Juego ---
window.onload = () => {
    updateDisplay();
    speak(phrases.initial[Math.floor(Math.random() * phrases.initial.length)]);
    buttTypes.forEach(butt => {
        const img = new Image();
        img.src = butt.img;
    });
    const spinningImg = new Image();
    spinningImg.src = 'assets/butt_spinning.png';
};