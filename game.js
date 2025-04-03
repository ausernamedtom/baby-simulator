class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.startScreen = document.getElementById('startScreen');
        this.playerNameInput = document.getElementById('playerName');
        this.startButton = document.getElementById('startButton');
        
        this.gameStarted = false;
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 50,
            height: 50,
            speed: 5,
            color: '#e74c3c',
            name: ''
        };
        
        this.keys = {};
        this.setupEventListeners();
        
        // Don't start the game loop until the start screen is dismissed
        this.showStartScreen();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        this.startButton.addEventListener('click', () => this.startGame());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.playerNameInput.focus();
    }
    
    startGame() {
        const name = this.playerNameInput.value.trim();
        if (name) {
            this.player.name = name;
            this.startScreen.classList.add('hidden');
            this.gameStarted = true;
            this.gameLoop();
        } else {
            this.playerNameInput.classList.add('error');
            setTimeout(() => {
                this.playerNameInput.classList.remove('error');
            }, 500);
        }
    }
    
    update() {
        if (!this.gameStarted) return;
        
        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameStarted) {
            // Draw player
            this.ctx.fillStyle = this.player.color;
            this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
            
            // Draw player name
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.player.name, this.player.x + this.player.width / 2, this.player.y - 10);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    new Game();
}); 