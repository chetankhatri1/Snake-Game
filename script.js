// Game constants
const GRID_SIZE = 20;
const GAME_SPEED = 100; // milliseconds
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Game variables
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let currentBgColor = '#e8e8e8'; // Store current background color

// DOM elements
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');

// Initialize high score display
highScoreElement.textContent = highScore;

// Event listeners
startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
document.addEventListener('keydown', handleKeyPress);

// Initialize the game
function initGame() {
    // Create initial snake (3 segments)
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    // Set initial direction
    direction = 'right';
    nextDirection = 'right';
    
    // Reset background color
    currentBgColor = '#e8e8e8';
    
    // Generate first food
    generateFood();
    
    // Reset score
    score = 0;
    scoreElement.textContent = score;
    
    // Draw initial state
    draw();
}

// Start the game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, GAME_SPEED);
        startButton.textContent = 'Pause';
    } else {
        gameRunning = false;
        clearInterval(gameInterval);
        startButton.textContent = 'Resume';
    }
}

// Reset the game
function resetGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    startButton.textContent = 'Start Game';
    initGame();
}

// Main game loop
function gameLoop() {
    update();
    draw();
}

// Generate a random color for background
function getRandomColor() {
    // Generate pastel colors that are light enough for good contrast
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
}

// Update game state
function update() {
    // Update direction
    direction = nextDirection;
    
    // Get current head position
    const head = { ...snake[0] };
    
    // Move head based on direction
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Check for collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head to snake
    snake.unshift(head);
    
    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreElement.textContent = score;
        
        // Update high score if needed
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // Change background color
        currentBgColor = getRandomColor();
        
        // Generate new food
        generateFood();
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
}

// Draw game elements
function draw() {
    // Clear canvas with current background color
    ctx.fillStyle = currentBgColor;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw snake
    snake.forEach((segment, index) => {
        // Head is a different color
        if (index === 0) {
            ctx.fillStyle = '#2E8B57'; // Sea green for head
        } else {
            ctx.fillStyle = '#3CB371'; // Medium sea green for body
        }
        
        ctx.fillRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
        
        // Add border to segments
        ctx.strokeStyle = '#e8e8e8';
        ctx.strokeRect(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
        );
    });
    
    // Draw food
    ctx.fillStyle = '#FF6347'; // Tomato red
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw grid (optional)
    drawGrid();
}

// Draw grid lines
function drawGrid() {
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
        ctx.stroke();
    }
}

// Generate food at random position
function generateFood() {
    // Create random coordinates
    let newFood;
    
    // Make sure food doesn't spawn on snake
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
}

// Check for collisions
function checkCollision(head) {
    // Check wall collision
    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= GRID_SIZE ||
        head.y >= GRID_SIZE
    ) {
        return true;
    }
    
    // Check self collision (skip the last element as it will be removed)
    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Handle keyboard input
function handleKeyPress(event) {
    // Prevent arrow keys from scrolling the page
    if ([37, 38, 39, 40].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // Update direction based on key pressed
    switch (event.keyCode) {
        case 38: // Up arrow
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 40: // Down arrow
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 37: // Left arrow
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 39: // Right arrow
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
        case 32: // Space bar (alternative control for start/pause)
            startGame();
            break;
    }
}

// Game over function
function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    startButton.textContent = 'Start Game';
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 15);
    ctx.fillText('Press Reset to play again', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 45);
}

// Initialize the game on load
initGame();
