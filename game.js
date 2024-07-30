const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const character = {
    x: 50,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    dy: 0,
    gravity: 1,
    jumpPower: -20,  // Увеличиваем высоту прыжка
    onGround: true,
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    jump() {
        if (this.onGround) {
            this.dy = this.jumpPower;
            this.onGround = false;
        }
    },
    update() {
        this.dy += this.gravity;
        this.y += this.dy;
        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.onGround = true;
        }
    }
};

const cacti = [];
let frame = 0;
let score = 0;
let gameOver = false;

function drawCactus(x, y, width, height) {
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, width, height);
}

function updateCacti() {
    if (frame % 120 === 0) {
        const cactusHeight = 30 + Math.random() * 30;  // Уменьшаем высоту кактусов
        cacti.push({
            x: canvas.width,
            y: canvas.height - cactusHeight,
            width: 20,
            height: cactusHeight
        });
    }

    cacti.forEach((cactus, index) => {
        cactus.x -= 5;
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

function resetGame() {
    cacti.length = 0;
    frame = 0;
    score = 0;
    character.y = canvas.height - 60;
    character.dy = 0;
    character.onGround = true;
    gameOver = false;
    document.getElementById('gameCanvas').style.display = 'block';
    document.getElementById('resultScreen').style.display = 'none';
    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('resultScreen').style.display = 'flex';
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        character.update();
        character.draw();
        updateCacti();
        cacti.forEach(cactus => drawCactus(cactus.x, cactus.y, cactus.width, cactus.height));
        frame++;
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        character.jump();
    }
});

canvas.addEventListener('touchstart', (e) => {
    character.jump();
});

window.onload = function() {
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    gameLoop();
};

document.getElementById('restartButton').addEventListener('click', resetGame);
