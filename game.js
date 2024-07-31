const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const groundHeight = 150;
const sandHeight = 50;

const character = {
    x: 50,
    y: canvas.height - groundHeight - 100,
    width: 100,
    height: 100,
    dy: 0,
    gravity: 1,
    jumpPower: -23,
    onGround: true,
    img: new Image(),
    imgSrc: 'images/character1.gif',

    draw() {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    },

    jump() {
        if (this.onGround) {
            this.dy = this.jumpPower;
            this.onGround = false;
        }
    },

    update(deltaTime) {
        this.dy += this.gravity * (deltaTime / 16.67);
        this.y += this.dy * (deltaTime / 16.67);
        if (this.y + this.height >= canvas.height - groundHeight) {
            this.y = canvas.height - groundHeight - this.height;
            this.dy = 0;
            this.onGround = true;
        }
    }
};

const cacti = [];
let frame = 0;
let score = 0;
let gameOver = false;
let highScore = parseInt(localStorage.getItem('highScore'), 10) || 0;

const cactusImg = new Image();
cactusImg.src = 'images/cactus.png';

character.img.src = character.imgSrc;
character.img.onload = () => {
    console.log("Character image loaded successfully");
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    showScreen('startScreen');
    document.getElementById('preloader').style.display = 'none';
};

character.img.onerror = () => console.error("Failed to load character image");
cactusImg.onload = () => console.log("Cactus image loaded successfully");
cactusImg.onerror = () => console.error("Failed to load cactus image");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    character.y = canvas.height - groundHeight - 100; // Correct character position on resize
}

function showScreen(screenId) {
    const screens = ['startScreen', 'characterSelectionScreen', 'resultScreen', 'gameCanvas'];
    screens.forEach(id => {
        document.getElementById(id).style.display = (id === screenId) ? 'flex' : 'none';
    });
}

function drawCactus(cactus) {
    ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);
}

function updateCacti(deltaTime) {
    if (frame % 150 === 0) {
        const cactusHeight = 60 + Math.random() * 40;
        const cactusWidth = 50;
        cacti.push({
            x: canvas.width,
            y: canvas.height - groundHeight - cactusHeight,
            width: cactusWidth,
            height: cactusHeight
        });
    }

    cacti.forEach((cactus, index) => {
        cactus.x -= 5 * (deltaTime / 16.67);
        if (cactus.x + cactus.width < 0) {
            cacti.splice(index, 1);
            score++;
        }
        if (
            character.x < cactus.x + cactus.width &&
            character.x + character.width > cactus.x &&
            character.y < cactus.y + cactus.height &&
            character.y + character.height > cactus.y
        ) {
            gameOver = true;
        }
    });
}

function drawGround() {
    ctx.fillStyle = '#C2B280'; // Sand color
    ctx.fillRect(0, canvas.height - sandHeight, canvas.width, sandHeight);

    ctx.fillStyle = '#8B4513'; // Ground color
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight - sandHeight);
}

function drawScore() {
    ctx.fillStyle = '#000';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Счёт: ${score}`, canvas.width / 2, 50); // Position the score at the top
}

function resetGame() {
    cacti.length = 0;
    frame = 0;
    score = 0;
    character.y = canvas.height - groundHeight - 100;
    character.dy = 0;
    character.onGround = true;
    gameOver = false;
    showScreen('gameCanvas');
    lastTime = performance.now();
    gameLoop(lastTime);
}

let lastTime = 0;

function gameLoop(timestamp) {
    if (gameOver) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        document.getElementById('finalScore').innerText = `Ваш счёт: ${score}`;
        document.getElementById('highScore').innerText = `Рекорд: ${highScore}`;
        showScreen('resultScreen');
    } else {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        character.update(deltaTime);
        character.draw();
        updateCacti(deltaTime);
        drawScore();
        cacti.forEach(drawCactus);
        frame++;
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        character.jump();
    }
});

canvas.addEventListener('touchstart', () => {
    character.jump();
});

document.getElementById('restartButton').addEventListener('click', resetGame);

document.getElementById('startButton').addEventListener('click', () => {
    showScreen('characterSelectionScreen');
});

let selectedCharacter = 'images/character1.gif';

document.getElementById('character1').addEventListener('click', () => {
    document.querySelectorAll('.character-image').forEach(img => img.classList.remove('selected'));
    document.getElementById('character1').classList.add('selected');
    selectedCharacter = 'images/character1.gif';
});

document.getElementById('character2').addEventListener('click', () => {
    document.querySelectorAll('.character-image').forEach(img => img.classList.remove('selected'));
    document.getElementById('character2').classList.add('selected');
    selectedCharacter = 'images/character2.gif';
});

document.getElementById('confirmCharacterButton').addEventListener('click', () => {
    character.imgSrc = selectedCharacter;
    character.img.src = character.imgSrc;
    // Ensure the image is loaded before starting the game
    character.img.onload = () => {
        showScreen('gameCanvas');
        lastTime = performance.now();
        gameLoop(lastTime);
    };
});

document.getElementById('highScore').innerText = `Рекорд: ${highScore}`;
