// Constants for game dimensions and speeds
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 50;
const ENEMY_SIZE = 50;
const BULLET_SIZE = 5;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;
const BULLET_SPEED = -10; // Negative for upward movement
const ENEMY_SPAWN_INTERVAL = 50; // Frames between enemy spawns
const SHOOT_COOLDOWN = 10; // Frames between shots

// Game variables
let player;
let enemies = [];
let bullets = [];
let score = 0;
let gameOver = false;
let moveLeft = false;
let moveRight = false;
let gameOverSoundPlayed = false;
let lastShotFrame = 0;

// Asset variables
let playerImage;
let enemyImage;
let shootSound;
let explosionSound, gameOverSound;

function preload() {
    // Load images and sounds (ensure these files are in your assets folder)
    playerImage = loadImage('assets/player.png');
    enemyImage = loadImage('assets/enemy.jpeg');
    shootSound = loadSound('assets/shoot.mp3');
    explosionSound = loadSound('assets/explosion.mp3');
    gameOverSound = loadSound('assets/game-over.mp3');
}

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    resetGame(); // Start the game initially
}

function draw() {
    background(0); // Black background

    if (!gameOver) {
        // Update and display player
        player.update();
        player.show();

        // Handle shooting
        if (keyIsDown(32) && frameCount - lastShotFrame >= SHOOT_COOLDOWN) { // Spacebar
            shoot();
        }

        // Update and display bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].update();
            bullets[i].show();
            if (bullets[i].offscreen()) {
                bullets.splice(i, 1);
            }
        }

        // Spawn enemies periodically
        if (frameCount % ENEMY_SPAWN_INTERVAL === 0) {
            enemies.push(new Enemy(random(0, CANVAS_WIDTH - ENEMY_SIZE), -ENEMY_SIZE));
        }

        // Update and display enemies, check collisions
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].update();
            enemies[i].show();

            // Check if enemy reaches bottom
            if (enemies[i].y + ENEMY_SIZE >= CANVAS_HEIGHT) {
                gameOver = true;
                break;
            }

            // Check collision with player
            if (rectanglesOverlap(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE, 
                                  enemies[i].x, enemies[i].y, ENEMY_SIZE, ENEMY_SIZE)) {
                gameOver = true;
                break;
            }

            // Check collision with bullets
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (circleRectangleCollision(bullets[j].x, bullets[j].y, BULLET_SIZE / 2, 
                                            enemies[i].x, enemies[i].y, ENEMY_SIZE, ENEMY_SIZE)) {
                    explosionSound.play(); // Play explosion sound
                    enemies.splice(i, 1); // Remove enemy
                    bullets.splice(j, 1); // Remove bullet
                    score += 1; // Increase score
                    break;
                }
            }
        }

        // Display score
        fill(255);
        textSize(20);
        text(`Score: ${score}`, 10, 30);
    } else { 
        fill(255);
        textSize(40);
        textAlign(CENTER, CENTER);
        text("Game Over", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        textSize(20);
        text(`Final Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

        // NEW: Draw the "Play Again" button
        textSize(20);
        text("Play Again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

        if (!gameOverSoundPlayed) {
            gameOverSound.play();
            gameOverSoundPlayed = true;
        }
    }
}

// NEW: Reset the game to start over
function resetGame() {
    player = new Player(CANVAS_WIDTH / 2 - PLAYER_SIZE / 2, CANVAS_HEIGHT - PLAYER_SIZE - 10);
    enemies = [];
    bullets = [];
    score = 0;
    gameOver = false;
    gameOverSoundPlayed = false;
    lastShotFrame = 0;
    moveLeft = false;
    moveRight = false;
}

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        image(playerImage, this.x, this.y, PLAYER_SIZE, PLAYER_SIZE);
    }

    update() {
        if (moveLeft && this.x > 0) {
            this.x -= PLAYER_SPEED;
        }
        if (moveRight && this.x < CANVAS_WIDTH - PLAYER_SIZE) {
            this.x += PLAYER_SPEED;
        }
    }
}

// Bullet class
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        fill(255);
        noStroke();
        ellipse(this.x, this.y, BULLET_SIZE);
    }

    update() {
        this.y += BULLET_SPEED;
    }

    offscreen() {
        return this.y < 0;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        image(enemyImage, this.x, this.y, ENEMY_SIZE, ENEMY_SIZE);
    }

    update() {
        this.y += ENEMY_SPEED;
    }
}

// Shooting function
function shoot() {
    bullets.push(new Bullet(player.x + PLAYER_SIZE / 2, player.y));
    shootSound.play(); // Play shooting sound
    lastShotFrame = frameCount; // Update last shot frame for cooldown
}

// Collision detection functions
function rectanglesOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (x1 + w1 < x2 || x2 + w2 < x1) return false;
    if (y1 + h1 < y2 || y2 + h2 < y1) return false;
    return true;
}

function circleRectangleCollision(cx, cy, radius, rx, ry, rw, rh) {
    let closestX = constrain(cx, rx, rx + rw);
    let closestY = constrain(cy, ry, ry + rh);
    let distanceX = cx - closestX;
    let distanceY = cy - closestY;
    let distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared <= radius * radius;
}

// Input handling
function keyPressed() {
    if (keyCode === LEFT_ARROW) moveLeft = true;
    if (keyCode === RIGHT_ARROW) moveRight = true;
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) moveLeft = false;
    if (keyCode === RIGHT_ARROW) moveRight = false;
}

// NEW: Check if the "Play Again" button is clicked
function mousePressed() {
    if (gameOver) {
        // Define the button area (approx. 100x40 pixels centered at CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60)
        let buttonX = CANVAS_WIDTH / 2 - 50; // Left edge
        let buttonY = CANVAS_HEIGHT / 2 + 40; // Top edge (a bit above the text for better click area)
        let buttonWidth = 100;
        let buttonHeight = 40;

        if (mouseX >= buttonX && mouseX <= buttonX + buttonWidth &&
            mouseY >= buttonY && mouseY <= buttonY + buttonHeight) {
            resetGame(); // Restart the game
        }
    }
}