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
        
        // Define rooms first so we can reference them for baby position
        this.rooms = {
            bedroom: { 
                x: 50, 
                y: 50, 
                width: 300, 
                height: 200, 
                color: '#E8F5E9',
                label: 'Bedroom',
                furniture: [
                    { type: 'bed', x: 70, y: 100, width: 100, height: 60 },
                    { type: 'crib', x: 200, y: 100, width: 80, height: 60 },
                    { type: 'dresser', x: 70, y: 170, width: 80, height: 30 }
                ]
            },
            livingRoom: { 
                x: 400, 
                y: 50, 
                width: 350, 
                height: 200, 
                color: '#E3F2FD',
                label: 'Living Room',
                furniture: [
                    { type: 'sofa', x: 420, y: 100, width: 120, height: 40 },
                    { type: 'table', x: 550, y: 100, width: 60, height: 60 },
                    { type: 'tv', x: 420, y: 150, width: 80, height: 50 }
                ]
            },
            kitchen: { 
                x: 50, 
                y: 300, 
                width: 300, 
                height: 250, 
                color: '#FFF3E0',
                label: 'Kitchen',
                furniture: [
                    { type: 'counter', x: 70, y: 350, width: 200, height: 30 },
                    { type: 'fridge', x: 70, y: 390, width: 60, height: 80 },
                    { type: 'stove', x: 150, y: 390, width: 60, height: 60 },
                    { type: 'sink', x: 230, y: 390, width: 40, height: 40 }
                ]
            },
            bathroom: { 
                x: 400, 
                y: 300, 
                width: 350, 
                height: 250, 
                color: '#E0F7FA',
                label: 'Bathroom',
                furniture: [
                    { type: 'bathtub', x: 420, y: 350, width: 100, height: 60 },
                    { type: 'toilet', x: 550, y: 350, width: 40, height: 60 },
                    { type: 'sink', x: 420, y: 420, width: 40, height: 40 }
                ]
            }
        };
        
        // Position baby in the bed
        const bed = this.rooms.bedroom.furniture.find(item => item.type === 'bed');
        this.baby = {
            x: bed.x + bed.width/2 - 30,
            y: bed.y + bed.height/2 - 30,
            width: 60,
            height: 60,
            name: '',
            isSleeping: true
        };

        this.parent = {
            x: 100,
            y: 100,
            width: 40,
            height: 80,
            speed: 5,
            name: 'Parent'
        };
        
        this.keys = {};
        this.setupEventListeners();
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
            this.baby.name = name;
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
    
    drawRoom(room) {
        const ctx = this.ctx;
        
        // Draw room background
        ctx.fillStyle = room.color;
        ctx.fillRect(room.x, room.y, room.width, room.height);
        
        // Draw room border with thick lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Draw room label with cartoon style
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText(room.label, room.x + room.width / 2, room.y + 25);
        
        // Draw furniture
        room.furniture.forEach(item => this.drawFurniture(item));
    }
    
    drawFurniture(item) {
        const ctx = this.ctx;
        
        // Set default line width for cartoon style
        ctx.lineWidth = 3;
        
        switch(item.type) {
            case 'bed':
                // Bed frame
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Mattress
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
                // Pillow
                ctx.fillStyle = '#B0BEC5';
                ctx.fillRect(item.x + 10, item.y + 10, 20, 15);
                // Cartoon outline
                ctx.strokeStyle = '#5D4037';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'crib':
                // Crib frame
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Crib bars
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 3;
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.moveTo(item.x + 10 + (i * 15), item.y);
                    ctx.lineTo(item.x + 10 + (i * 15), item.y + item.height);
                    ctx.stroke();
                }
                // Mattress
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(item.x + 5, item.y + item.height - 10, item.width - 10, 10);
                // Cartoon outline
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'dresser':
                // Dresser body
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Drawers
                ctx.strokeStyle = '#5D4037';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.strokeRect(item.x + 5, item.y + 5 + (i * 8), item.width - 10, 6);
                }
                // Cartoon outline
                ctx.lineWidth = 3;
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'sofa':
                // Sofa base
                ctx.fillStyle = '#5C6BC0';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Sofa back
                ctx.fillRect(item.x, item.y - 20, item.width, 20);
                // Cushions
                ctx.fillStyle = '#7986CB';
                ctx.fillRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
                // Cartoon outline
                ctx.strokeStyle = '#3949AB';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                ctx.strokeRect(item.x, item.y - 20, item.width, 20);
                break;
                
            case 'table':
                // Table top
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(item.x, item.y, item.width, 10);
                // Table legs
                ctx.fillRect(item.x + 5, item.y + 10, 5, item.height - 10);
                ctx.fillRect(item.x + item.width - 10, item.y + 10, 5, item.height - 10);
                ctx.fillRect(item.x + 5, item.y + item.height - 5, item.width - 10, 5);
                // Cartoon outline
                ctx.strokeStyle = '#5D4037';
                ctx.strokeRect(item.x, item.y, item.width, 10);
                ctx.strokeRect(item.x + 5, item.y + 10, 5, item.height - 10);
                ctx.strokeRect(item.x + item.width - 10, item.y + 10, 5, item.height - 10);
                ctx.strokeRect(item.x + 5, item.y + item.height - 5, item.width - 10, 5);
                break;
                
            case 'tv':
                // TV frame
                ctx.fillStyle = '#424242';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // TV screen
                ctx.fillStyle = '#212121';
                ctx.fillRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
                // TV stand
                ctx.fillStyle = '#424242';
                ctx.fillRect(item.x + item.width/2 - 10, item.y + item.height, 20, 10);
                // Cartoon outline
                ctx.strokeStyle = '#212121';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                ctx.strokeRect(item.x + item.width/2 - 10, item.y + item.height, 20, 10);
                break;
                
            case 'counter':
                // Counter top
                ctx.fillStyle = '#8D6E63';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Counter base
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(item.x, item.y + item.height, item.width, 10);
                // Cartoon outline
                ctx.strokeStyle = '#5D4037';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                ctx.strokeRect(item.x, item.y + item.height, item.width, 10);
                break;
                
            case 'fridge':
                // Fridge body
                ctx.fillStyle = '#ECEFF1';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Fridge door
                ctx.strokeStyle = '#90A4AE';
                ctx.lineWidth = 3;
                ctx.strokeRect(item.x + 5, item.y + 5, item.width - 10, item.height - 10);
                // Handle
                ctx.fillStyle = '#90A4AE';
                ctx.fillRect(item.x + item.width - 8, item.y + 10, 3, 20);
                // Cartoon outline
                ctx.strokeStyle = '#78909C';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'stove':
                // Stove body
                ctx.fillStyle = '#424242';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Burners
                ctx.fillStyle = '#757575';
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.arc(item.x + 15 + (i * 15), item.y + 15, 5, 0, Math.PI * 2);
                    ctx.fill();
                    // Burner outline
                    ctx.strokeStyle = '#616161';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                // Cartoon outline
                ctx.strokeStyle = '#212121';
                ctx.lineWidth = 3;
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'sink':
                // Sink basin
                ctx.fillStyle = '#ECEFF1';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Faucet
                ctx.fillStyle = '#90A4AE';
                ctx.fillRect(item.x + item.width/2 - 2, item.y - 5, 4, 10);
                // Cartoon outline
                ctx.strokeStyle = '#78909C';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'bathtub':
                // Bathtub
                ctx.fillStyle = '#ECEFF1';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Faucet
                ctx.fillStyle = '#90A4AE';
                ctx.fillRect(item.x + item.width/2 - 2, item.y - 5, 4, 10);
                // Cartoon outline
                ctx.strokeStyle = '#78909C';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                break;
                
            case 'toilet':
                // Toilet bowl
                ctx.fillStyle = '#ECEFF1';
                ctx.fillRect(item.x, item.y, item.width, item.height);
                // Toilet seat
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(item.x - 5, item.y, item.width + 10, 10);
                // Cartoon outline
                ctx.strokeStyle = '#78909C';
                ctx.strokeRect(item.x, item.y, item.width, item.height);
                ctx.strokeRect(item.x - 5, item.y, item.width + 10, 10);
                break;
        }
    }
    
    drawSleepingBaby(x, y, width, height) {
        const ctx = this.ctx;
        
        // Body (oval shape)
        ctx.fillStyle = '#FFE0B2';
        ctx.beginPath();
        ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#FFB74D';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Blanket
        ctx.fillStyle = '#81D4FA';
        ctx.beginPath();
        ctx.ellipse(x + width/2, y + height/2 + 5, width/2, height/3, 0, 0, Math.PI);
        ctx.fill();
        
        // Blanket outline
        ctx.strokeStyle = '#4FC3F7';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Face
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 3;
        
        // Closed eyes
        ctx.beginPath();
        ctx.moveTo(x + width/3, y + height/2 - 5);
        ctx.quadraticCurveTo(x + width/3 + 5, y + height/2 - 8, x + width/3 + 10, y + height/2 - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x + width*2/3 - 10, y + height/2 - 5);
        ctx.quadraticCurveTo(x + width*2/3 - 5, y + height/2 - 8, x + width*2/3, y + height/2 - 5);
        ctx.stroke();
        
        // Rosy cheeks
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(x + width/3, y + height/2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + width*2/3, y + height/2, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Peaceful smile
        ctx.beginPath();
        ctx.arc(x + width/2, y + height/2, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        
        // ZZZ sleep indicator
        ctx.fillStyle = '#9575CD';
        ctx.font = 'bold 20px "Comic Sans MS", cursive';
        for (let i = 0; i < 3; i++) {
            ctx.fillText('z', x + width + 5 + (i * 5), y - 5 - (i * 10));
        }
    }
    
    drawParent(x, y, width, height) {
        const ctx = this.ctx;
        
        // Body
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x, y, width, height);
        
        // Body outline
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Head
        ctx.fillStyle = '#FFE0B2';
        ctx.beginPath();
        ctx.arc(x + width/2, y - 10, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Head outline
        ctx.strokeStyle = '#FFB74D';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Face
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        
        // Eyes
        ctx.beginPath();
        ctx.arc(x + width/2 - 5, y - 15, 2, 0, Math.PI * 2);
        ctx.arc(x + width/2 + 5, y - 15, 2, 0, Math.PI * 2);
        ctx.stroke();
        
        // Smile
        ctx.beginPath();
        ctx.arc(x + width/2, y - 10, 5, 0, Math.PI);
        ctx.stroke();
    }
    
    update() {
        if (!this.gameStarted) return;
        
        // Parent movement
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.parent.x = Math.max(0, this.parent.x - this.parent.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.parent.x = Math.min(this.canvas.width - this.parent.width, this.parent.x + this.parent.speed);
        }
        if (this.keys['ArrowUp'] || this.keys['w']) {
            this.parent.y = Math.max(0, this.parent.y - this.parent.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['s']) {
            this.parent.y = Math.min(this.canvas.height - this.parent.height, this.parent.y + this.parent.speed);
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameStarted) {
            // Draw rooms
            Object.values(this.rooms).forEach(room => this.drawRoom(room));
            
            // Draw baby
            this.drawSleepingBaby(this.baby.x, this.baby.y, this.baby.width, this.baby.height);
            
            // Draw parent
            this.drawParent(this.parent.x, this.parent.y, this.parent.width, this.parent.height);
            
            // Draw names
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.baby.name, this.baby.x + this.baby.width / 2, this.baby.y - 10);
            this.ctx.fillText(this.parent.name, this.parent.x + this.parent.width / 2, this.parent.y - 30);
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