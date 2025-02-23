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
            if (rectanglesOverlap(player.x, player.y, PLAYER