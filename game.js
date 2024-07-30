const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Высота горизонта
const groundHeight = 150;  // Увеличена высота горизонта над нижним краем экрана
const sandHeight = 50;  // Увеличена высота уровня с песком

const character = {
    x: 50,
    y: canvas.height - groundHeight - 100,  // Изменено положение персонажа
    width: 100,  // Увеличен размер персонажа
    height: 100,  // Увеличен размер персонажа
    dy: 0,
    gravity: 1,
    jumpPower: -23,  // Увеличена сила прыжка персонажа
    onGround: true,
    img: new Image(),
    imgSrc: 'images/character.gif',

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
        this.dy += this.gravity * (deltaTime / 16.67);  // Нормализация гравитации
        this.y += this.dy * (deltaTime / 16.67);  // Нормализация скорости падения
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
let highScore = localStorage.getItem('highScore') || 0;  // Загружаем рекорд из localStorage

const cactusImg = new Image();
cactusImg.src = 'images/cactus.png';  // Путь к пользовательскому изображению кактуса

character.img.src = character.imgSrc;
character.img.onload = function() {
    console.log("Image loaded successfully");
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    lastTime = performance.now();
    gameLoop(lastTime);
};

character.img.onerror = function() {
    console.error("Failed to load image");
};

cactusImg.onload = function() {
    console.log("Cactus image loaded successfully");
};

cactusImg.onerror = function() {
    console.error("Failed to load cactus image");
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawCactus(cactus) {
    ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);
}

function updateCacti(deltaTime) {
    if (frame % 150 === 0) {  // Увеличен интервал появления кактусов
        const cactusHeight = 60 + Math.random() * 40;  // Средняя высота кактусов
        const cactusWidth = 50;  // Увеличена ширина кактусов
        cacti.push({
            x: canvas.width,
            y: canvas.height - groundHeight - cactusHeight,
            width: cactusWidth,
            height: cactusHeight
        });
    }

    cacti.forEach((cactus, index) => {
        cactus.x -= 5 * (deltaTime / 16.67);  // Нормализация скорости перемещения кактусов
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
    // Рисуем уровень с песком
    ctx.fillStyle = '#C2B280';  // Цвет песка
    ctx.fillRect(0, canvas.height - sandHeight, canvas.width, sandHeight);

    // Рисуем горизонт выше уровня с песком
    ctx.fillStyle = '#8B4513';  // Цвет горизонта (например, коричневый)
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight - sandHeight);
}

function drawScore() {
    const scoreFontSize = 36;  // Размер шрифта для счётчика
    ctx.fillStyle = '#000';  // Цвет текста (черный)
    ctx.font = `${scoreFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Отображение счётчика немного выше центра экрана
    ctx.fillText(`${score}`, canvas.width / 2, canvas.height / 2 - 100);
}

function resetGame() {
    cacti.length = 0;
    frame = 0;
    score = 0;
    character.y = canvas.height - groundHeight - 100;
    character.dy = 0;
    character.onGround = true;
    gameOver = false;
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    lastTime = performance.now();
    gameLoop(lastTime);
}

let lastTime = 0;

function gameLoop(timestamp) {
    if (gameOver) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);  // Сохраняем рекорд в localStorage
        }
        document.getElementById('finalScore').innerText = `Ваш счёт: ${score}`;
        document.getElementById('highScore').innerText = `Рекорд: ${highScore}`;
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'flex';
    } else {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGround();
        character.update(deltaTime);
        character.draw();
        updateCacti(deltaTime);
        drawScore();  // Отображение счётчика
        cacti.forEach(cactus => drawCactus(cactus));
        frame++;
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        character.jump();
    }
});

// Обработчик клавиши Enter для перезапуска игры
document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter' && gameOver) {
        resetGame();
    }
});

canvas.addEventListener('touchstart', (e) => {
    character.jump();
});

document.getElementById('restartButton').addEventListener('click', resetGame);

// Отображение рекорда на экране результата
document.getElementById('highScore').innerText = `Рекорд: ${highScore}`;
