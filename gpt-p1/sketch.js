let player;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let shooting = false;
let moveLeft = false;
let moveRight = false;
let shootSound, explosionSound, gameOverSound;

function preload() {
    shootSound = loadSound('assets/shoot.mp3');
    explosionSound = loadSound('assets/explosion.mp3');
    gameOverSound = loadSound('assets/game-over.mp3');
}

function setup() {
    createCanvas(600, 400);
    player = new Player();
}

function draw() {
    background(0);
    
    if (!gameOver) {
        if (moveLeft) {
            player.move(-1);
        } else if (moveRight) {
            player.move(1);
        }
        
        player.update();
        player.show();
        
        for (let bullet of bullets) {
            bullet.update();
            bullet.show();
        }
        
        if (frameCount % 80 === 0) { // Slower enemy spawn rate
            enemies.push(new Enemy());
        }
        
        for (let enemy of enemies) {
            enemy.update();
            enemy.show();
        }
        
        checkCollisions();
        displayScore();

        if (shooting && frameCount % 10 === 0) { // Continuous firing with delay
            bullets.push(new Bullet(player.x, player.y));
            shootSound.play();
        }
    } else {
        displayGameOver();
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        moveLeft = true;
    } else if (keyCode === RIGHT_ARROW) {
        moveRight = true;
    } else if (key === ' ') {
        shooting = true;
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        moveLeft = false;
    } else if (keyCode === RIGHT_ARROW) {
        moveRight = false;
    } else if (key === ' ') {
        shooting = false;
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i] && enemies[j] && bullets[i].hits(enemies[j])) {
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score++;
                explosionSound.play();
                break;
            }
        }
    }
    
    for (let enemy of enemies) {
        if (enemy.hits(player)) {
            gameOver = true;
            gameOverSound.play();
        }
    }
}

function displayScore() {
    fill(255);
    textSize(20);
    text(`Score: ${score}`, 10, 30);
}

function displayGameOver() {
    fill(255, 0, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2);
}

class Player {
    constructor() {
        this.x = width / 2;
        this.y = height - 40;
        this.size = 20;
    }
    
    update() {
        this.x = constrain(this.x, 0, width);
    }
    
    show() {
        fill(0, 255, 0);
        triangle(this.x - this.size, this.y + this.size, this.x + this.size, this.y + this.size, this.x, this.y - this.size);
    }
    
    move(dir) {
        this.x += dir * 5; // Smooth continuous movement
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 5;
        this.speed = 4; // Slower bullet speed
    }
    
    update() {
        this.y -= this.speed;
    }
    
    show() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.size * 2);
    }
    
    hits(enemy) {
        let d = dist(this.x, this.y, enemy.x, enemy.y);
        return d < this.size + enemy.size;
    }
}

class Enemy {
    constructor() {
        this.x = random(20, width - 20);
        this.y = 0;
        this.size = 20;
        this.speed = 1.5; // Slower enemy speed
    }
    
    update() {
        this.y += this.speed;
        if (this.y > height) {
            gameOver = true;
            gameOverSound.play();
        }
    }
    
    show() {
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.size * 2);
    }
    
    hits(player) {
        let d = dist(this.x, this.y, player.x, player.y);
        return d < this.size + player.size;
    }
}