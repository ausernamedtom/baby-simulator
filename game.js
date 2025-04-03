class Game {
    constructor(devMode = false) {
        this.devMode = devMode;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Development mode UI elements
        if (this.devMode) {
            this.setupDevUI();
        }
        
        this.startScreen = document.getElementById('startScreen');
        this.playerNameInput = document.getElementById('playerName');
        this.startButton = document.getElementById('startButton');
        this.stopButton = document.getElementById('stopButton');
        
        this.gameStarted = false;
        this.gameLoopId = null;
        
        this.warningMessage = null;
        this.warningTimeout = null;
        this.warningOpacity = 0;
        this.warningFadeStartTime = 0;
        this.warningFadeDuration = 2000; // 2 seconds fade duration
        
        // Control hint properties
        this.showControlHint = false;
        this.controlHintOpacity = 0;
        this.controlHintFadeInDuration = 500; // 0.5 seconds fade in
        this.controlHintFadeOutDuration = 500; // 0.5 seconds fade out
        this.controlHintFadeStartTime = 0;
        this.controlHintFadeDirection = 'in'; // 'in' or 'out'
        this.controlHintTimeout = null;
        
        // Pickup hint properties
        this.showPickupHint = false;
        this.pickupHintOpacity = 0;
        this.pickupHintFadeInDuration = 500; // 0.5 seconds fade in
        this.pickupHintFadeOutDuration = 500; // 0.5 seconds fade out
        this.pickupHintFadeStartTime = 0;
        this.pickupHintFadeDirection = 'in'; // 'in' or 'out'
        this.pickupHintTimeout = null;
        
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
            isSleeping: true,
            currentFurniture: 'bed'  // Track which furniture the baby is in
        };

        this.parent = {
            x: 100,
            y: 100,
            width: 40,
            height: 80,
            speed: 5,
            name: 'Parent',
            isHoldingBaby: false
        };
        
        // Add E key to key mappings
        this.keys = {
            'ArrowLeft': false,
            'ArrowRight': false,
            'ArrowUp': false,
            'ArrowDown': false,
            'a': false,
            'd': false,
            'w': false,
            's': false,
            ' ': false  // Space key for baby pickup
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Prevent spacebar from scrolling the page
            if (e.key === ' ') {
                e.preventDefault();
            }
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

        // If in dev mode, start the game automatically
        if (this.devMode) {
            this.startGame();
        } else {
            this.showStartScreen();
        }
    }
    
    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.playerNameInput.focus();
    }
    
    startGame() {
        // Generate a random baby name if none is provided or if in dev mode
        const randomNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas'];
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        
        // In dev mode, always use random name. Otherwise, use input value if provided
        const babyName = this.devMode ? randomName : (this.playerNameInput.value || randomName);
        
        // Set the name in the input field and for the baby
        this.playerNameInput.value = babyName;
        this.baby.name = babyName;
        
        // Hide start screen and begin game
        this.startScreen.classList.add('hidden');
        this.gameStarted = true;
        this.gameLoop();
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
        
        // Eyes (closed if sleeping, open if awake)
        if (this.baby.isSleeping) {
            ctx.beginPath();
            ctx.moveTo(x + width/3, y + height/2 - 5);
            ctx.quadraticCurveTo(x + width/3 + 5, y + height/2 - 8, x + width/3 + 10, y + height/2 - 5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + width*2/3 - 10, y + height/2 - 5);
            ctx.quadraticCurveTo(x + width*2/3 - 5, y + height/2 - 8, x + width*2/3, y + height/2 - 5);
            ctx.stroke();
        } else {
            // Open eyes
            ctx.beginPath();
            ctx.arc(x + width/3 + 5, y + height/2 - 5, 2, 0, Math.PI * 2);
            ctx.arc(x + width*2/3 - 5, y + height/2 - 5, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
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
        
        // ZZZ sleep indicator (only when sleeping)
        if (this.baby.isSleeping) {
            ctx.fillStyle = '#9575CD';
            ctx.font = 'bold 20px "Comic Sans MS", cursive';
            for (let i = 0; i < 3; i++) {
                ctx.fillText('z', x + width + 5 + (i * 5), y - 5 - (i * 10));
            }
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
        
        // Expression (smile when holding baby, neutral otherwise)
        if (this.parent.isHoldingBaby) {
            ctx.beginPath();
            ctx.arc(x + width/2, y - 10, 5, 0, Math.PI);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(x + width/2 - 5, y - 10);
            ctx.lineTo(x + width/2 + 5, y - 10);
            ctx.stroke();
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    checkFurnitureCollision() {
        // Check all rooms for furniture collisions
        for (const room of Object.values(this.rooms)) {
            for (const furniture of room.furniture) {
                // Create a collision box for the baby's position
                const babyCollisionBox = {
                    x: this.baby.x,
                    y: this.baby.y,
                    width: this.baby.width,
                    height: this.baby.height
                };
                
                if (this.checkCollision(babyCollisionBox, furniture)) {
                    return furniture;
                }
            }
        }
        return null;
    }

    canInteractWithFurniture(furniture) {
        // Define which furniture types can hold the baby
        const interactableFurniture = ['bed', 'crib', 'sofa'];
        
        // Define dangerous furniture
        const dangerousFurniture = ['fridge', 'stove'];
        
        // Show warning if trying to place baby in dangerous furniture
        if (dangerousFurniture.includes(furniture.type)) {
            this.showWarning(`Don't put the baby in the ${furniture.type}!`);
            return false;
        }
        
        return interactableFurniture.includes(furniture.type);
    }

    placeBabyInFurniture(furniture) {
        // Center the baby in the furniture
        this.baby.x = furniture.x + furniture.width/2 - this.baby.width/2;
        this.baby.y = furniture.y + furniture.height/2 - this.baby.height/2;
        this.baby.currentFurniture = furniture.type;
        
        // Make the baby sleep in bed or crib
        if (furniture.type === 'bed' || furniture.type === 'crib') {
            this.baby.isSleeping = true;
        }
    }

    update() {
        if (!this.gameStarted) return;
        
        // Update warning opacity for fade effect
        if (this.warningMessage) {
            const elapsedTime = Date.now() - this.warningFadeStartTime;
            if (elapsedTime < this.warningFadeDuration) {
                this.warningOpacity = 1.0 - (elapsedTime / this.warningFadeDuration);
            } else {
                this.warningOpacity = 0;
            }
        }
        
        // Update control hint opacity
        if (this.showControlHint) {
            const elapsedTime = Date.now() - this.controlHintFadeStartTime;
            if (this.controlHintFadeDirection === 'in') {
                if (elapsedTime < this.controlHintFadeInDuration) {
                    this.controlHintOpacity = elapsedTime / this.controlHintFadeInDuration;
                } else {
                    this.controlHintOpacity = 1.0;
                }
            } else { // fade out
                if (elapsedTime < this.controlHintFadeOutDuration) {
                    this.controlHintOpacity = 1.0 - (elapsedTime / this.controlHintFadeOutDuration);
                } else {
                    this.controlHintOpacity = 0;
                    this.showControlHint = false;
                }
            }
        }
        
        // Update pickup hint opacity
        if (this.showPickupHint) {
            const elapsedTime = Date.now() - this.pickupHintFadeStartTime;
            if (this.pickupHintFadeDirection === 'in') {
                if (elapsedTime < this.pickupHintFadeInDuration) {
                    this.pickupHintOpacity = elapsedTime / this.pickupHintFadeInDuration;
                } else {
                    this.pickupHintOpacity = 1.0;
                }
            } else { // fade out
                if (elapsedTime < this.pickupHintFadeOutDuration) {
                    this.pickupHintOpacity = 1.0 - (elapsedTime / this.pickupHintFadeOutDuration);
                } else {
                    this.pickupHintOpacity = 0;
                    this.showPickupHint = false;
                }
            }
        }
        
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

        // Check for collision with baby
        const isCollidingWithBaby = this.checkCollision(this.parent, this.baby);
        
        // Handle pickup hint display
        if (isCollidingWithBaby && !this.parent.isHoldingBaby) {
            // Show pickup hint
            if (!this.showPickupHint) {
                this.showPickupHint = true;
                this.pickupHintOpacity = 0;
                this.pickupHintFadeDirection = 'in';
                this.pickupHintFadeStartTime = Date.now();
                
                // Clear existing timeout if there is one
                if (this.pickupHintTimeout) {
                    clearTimeout(this.pickupHintTimeout);
                }
            }
            
            // Handle pickup with Space key
            if (this.keys[' ']) {
                this.parent.isHoldingBaby = true;
                this.baby.isSleeping = false;
                this.baby.currentFurniture = null;
                
                // Hide pickup hint immediately
                this.showPickupHint = false;
                this.pickupHintOpacity = 0;
                
                // Clear any existing timeout
                if (this.pickupHintTimeout) {
                    clearTimeout(this.pickupHintTimeout);
                }
            }
        } else {
            // Hide pickup hint if not colliding or already holding baby
            if (this.showPickupHint) {
                this.pickupHintFadeDirection = 'out';
                this.pickupHintFadeStartTime = Date.now();
                
                // Clear existing timeout if there is one
                if (this.pickupHintTimeout) {
                    clearTimeout(this.pickupHintTimeout);
                }
                
                // Set timeout to hide hint after fade out
                this.pickupHintTimeout = setTimeout(() => {
                    this.showPickupHint = false;
                }, this.pickupHintFadeOutDuration);
            }
        }

        // Update baby position if being held
        if (this.parent.isHoldingBaby) {
            this.baby.x = this.parent.x + this.parent.width/2 - this.baby.width/2;
            this.baby.y = this.parent.y - this.baby.height;
            
            // Check for nearby interactable furniture
            const nearbyFurniture = this.checkFurnitureCollision();
            if (nearbyFurniture && this.canInteractWithFurniture(nearbyFurniture)) {
                // Show control hint
                if (!this.showControlHint) {
                    this.showControlHint = true;
                    this.controlHintOpacity = 0;
                    this.controlHintFadeDirection = 'in';
                    this.controlHintFadeStartTime = Date.now();
                    
                    // Clear existing timeout if there is one
                    if (this.controlHintTimeout) {
                        clearTimeout(this.controlHintTimeout);
                    }
                }
                
                // Handle placement with Space key
                if (this.keys[' ']) {
                    this.placeBabyInFurniture(nearbyFurniture);
                    this.parent.isHoldingBaby = false;
                    
                    // Hide control hint immediately
                    this.showControlHint = false;
                    this.controlHintOpacity = 0;
                    
                    // Clear any existing timeout
                    if (this.controlHintTimeout) {
                        clearTimeout(this.controlHintTimeout);
                    }
                }
            } else {
                // Hide control hint
                if (this.showControlHint) {
                    this.controlHintFadeDirection = 'out';
                    this.controlHintFadeStartTime = Date.now();
                    
                    // Clear existing timeout if there is one
                    if (this.controlHintTimeout) {
                        clearTimeout(this.controlHintTimeout);
                    }
                    
                    // Set timeout to hide hint after fade out
                    this.controlHintTimeout = setTimeout(() => {
                        this.showControlHint = false;
                    }, this.controlHintFadeOutDuration);
                }
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameStarted) {
            // Draw rooms
            Object.values(this.rooms).forEach(room => this.drawRoom(room));
            
            // Draw baby (only if not being held)
            if (!this.parent.isHoldingBaby) {
                this.drawSleepingBaby(this.baby.x, this.baby.y, this.baby.width, this.baby.height);
            }
            
            // Draw parent
            this.drawParent(this.parent.x, this.parent.y, this.parent.width, this.parent.height);
            
            // Draw baby on top of parent if being held
            if (this.parent.isHoldingBaby) {
                this.drawSleepingBaby(this.baby.x, this.baby.y, this.baby.width, this.baby.height);
            }
            
            // Draw names
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.baby.name, this.baby.x + this.baby.width / 2, this.baby.y - 10);
            this.ctx.fillText(this.parent.name, this.parent.x + this.parent.width / 2, this.parent.y - 30);
            
            // Development mode features
            if (this.devMode) {
                this.drawDebugInfo();
            }
            
            // Draw warning message if exists
            if (this.warningMessage) {
                this.ctx.save();
                
                // Create a semi-transparent background for better readability
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.5 * this.warningOpacity})`;
                this.ctx.fillRect(
                    this.canvas.width / 2 - 150, 
                    20, 
                    300, 
                    40
                );
                
                // Draw the warning text with fade effect
                this.ctx.fillStyle = `rgba(255, 0, 0, ${this.warningOpacity})`;
                this.ctx.font = 'bold 24px "Comic Sans MS", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.warningMessage, this.canvas.width / 2, 50);
                
                this.ctx.restore();
            }
            
            // Draw control hint if active
            if (this.showControlHint && this.parent.isHoldingBaby) {
                this.drawControlHint();
            }
            
            // Draw pickup hint if active
            if (this.showPickupHint && !this.parent.isHoldingBaby) {
                this.drawPickupHint();
            }
        }
    }
    
    drawControlHint() {
        const ctx = this.ctx;
        const centerX = this.parent.x + this.parent.width / 2;
        const centerY = this.parent.y + this.parent.height / 2;
        const radius = 50;
        
        // Draw outer circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.controlHintOpacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.controlHintOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw spacebar icon
        ctx.fillStyle = `rgba(255, 255, 255, ${this.controlHintOpacity})`;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SPACE', centerX, centerY - 15);
        
        // Draw action text
        ctx.font = '16px Arial';
        ctx.fillText('Place Baby', centerX, centerY + 15);
        
        ctx.restore();
    }
    
    drawPickupHint() {
        const ctx = this.ctx;
        const centerX = this.baby.x + this.baby.width / 2;
        const centerY = this.baby.y - 30;
        const radius = 40;
        
        // Draw outer circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.pickupHintOpacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.pickupHintOpacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw Space key icon
        ctx.fillStyle = `rgba(255, 255, 255, ${this.pickupHintOpacity})`;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SPACE', centerX, centerY);
        
        // Draw action text
        ctx.font = '16px Arial';
        ctx.fillText('Pick Up Baby', centerX, centerY + 25);
        
        ctx.restore();
    }
    
    drawDebugInfo() {
        // Update debug panel with game state
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            const debugInfo = {
                'Parent Position': `(${Math.round(this.parent.x)}, ${Math.round(this.parent.y)})`,
                'Baby Position': `(${Math.round(this.baby.x)}, ${Math.round(this.baby.y)})`,
                'Baby State': this.baby.isSleeping ? 'Sleeping' : 'Awake',
                'Current Furniture': this.baby.currentFurniture || 'None',
                'Holding Baby': this.parent.isHoldingBaby ? 'Yes' : 'No',
                'FPS': Math.round(1000 / (performance.now() - this._lastFrameTime))
            };
            
            this._lastFrameTime = performance.now();
            
            debugPanel.innerHTML = Object.entries(debugInfo)
                .map(([key, value]) => `${key}: ${value}`)
                .join('<br>');
        }

        // Draw collision boxes in dev mode
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        
        // Parent collision box
        this.ctx.strokeRect(this.parent.x, this.parent.y, this.parent.width, this.parent.height);
        
        // Baby collision box
        this.ctx.strokeRect(this.baby.x, this.baby.y, this.baby.width, this.baby.height);
        
        // Room and furniture collision boxes
        Object.values(this.rooms).forEach(room => {
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
            this.ctx.strokeRect(room.x, room.y, room.width, room.height);
            
            room.furniture.forEach(furniture => {
                this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
                this.ctx.strokeRect(furniture.x, furniture.y, furniture.width, furniture.height);
            });
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
    }

    showWarning(message) {
        this.warningMessage = message;
        this.warningOpacity = 1.0; // Start fully visible
        this.warningFadeStartTime = Date.now();
        
        // Clear existing timeout if there is one
        if (this.warningTimeout) {
            clearTimeout(this.warningTimeout);
        }
        
        // Clear warning after fade duration
        this.warningTimeout = setTimeout(() => {
            this.warningMessage = null;
            this.warningOpacity = 0;
        }, this.warningFadeDuration);
    }

    stopGame() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
        this.gameStarted = false;
        this.startScreen.classList.remove('hidden');
        this.playerNameInput.focus();
    }

    setupDevUI() {
        // Create dev mode indicator
        const devIndicator = document.createElement('div');
        devIndicator.style.position = 'fixed';
        devIndicator.style.top = '10px';
        devIndicator.style.right = '10px';
        devIndicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        devIndicator.style.color = 'white';
        devIndicator.style.padding = '5px 10px';
        devIndicator.style.borderRadius = '5px';
        devIndicator.style.fontFamily = 'Arial, sans-serif';
        devIndicator.style.zIndex = '1000';
        devIndicator.textContent = 'DEV MODE';
        document.body.appendChild(devIndicator);

        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '10px';
        debugPanel.style.right = '10px';
        debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.fontFamily = 'monospace';
        debugPanel.style.zIndex = '1000';
        debugPanel.id = 'debugPanel';
        document.body.appendChild(debugPanel);
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    // Check for development mode in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.has('dev');
    
    // Initialize game with dev mode parameter
    new Game(devMode);
}); 