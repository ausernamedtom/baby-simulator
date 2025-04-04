class Game {
    constructor(devMode = false) {
        this.devMode = devMode;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to match container
        const container = document.getElementById('game-container');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        
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
        
        // Time system properties
        this.gameStartTime = new Date();
        this.gameStartTime.setHours(8, 0, 0, 0); // Set initial time to 8:00 AM
        this.timeMultiplier = 384; // 384 times faster than real life
        this.currentHour = 8; // Set initial hour to 8
        this.isNight = false;
        this.nightOpacity = 0;
        this.nightFadeDuration = 2000; // 2 seconds for day/night transition
        
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
        
        // Cooldown properties
        this.placeCooldown = 150; // 150ms cooldown
        this.pickupCooldown = 150; // 150ms cooldown
        this.lastPickupTime = 0;
        this.lastPlaceTime = 0;
        this.showCooldownIndicator = false;
        this.cooldownIndicatorOpacity = 0;
        this.cooldownIndicatorFadeInDuration = 300;
        this.cooldownIndicatorFadeOutDuration = 300;
        this.cooldownIndicatorFadeStartTime = 0;
        this.cooldownIndicatorFadeDirection = 'in';
        
        // Baby state properties
        this.babyWakeUpInterval = null;
        this.babyWakeUpChance = 0.001; // 0.1% chance per frame to wake up
        this.babyCryDuration = 5000; // 5 seconds of crying
        this.babyCryStartTime = 0;
        this.babyIsCrying = false;
        
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
            currentFurniture: 'bed',  // Track which furniture the baby is in
            happiness: 100,  // Add happiness property starting at 100%
            hunger: 0  // Add hunger property starting at 0
        };

        this.parent = {
            x: 500,  // Start in living room
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
        
        window.addEventListener('resize', () => {
            const container = document.getElementById('game-container');
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        });
        
        this.startButton.addEventListener('click', () => this.startGame());
        this.stopButton.addEventListener('click', () => this.stopGame());
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
        
        // Set initial game time
        this.gameStartTime = new Date();
        this.gameStartTime.setHours(8, 0, 0, 0); // Set initial time to 8:00 AM
        this.currentHour = 8; // Set initial hour to 8
        
        // Hide start screen and show canvas
        this.startScreen.style.display = 'none';
        this.canvas.classList.remove('hidden');
        
        // Begin game
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
        
        // Draw clock in living room
        if (room.label === 'Living Room') {
            this.drawClock(room.x + room.width - 100, room.y + 30);
        }
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

        // Draw happiness bar
        this.drawHappinessBar(x, y + height + 10, width);
    }
    
    drawHappinessBar(x, y, width) {
        const ctx = this.ctx;
        const barHeight = 8;
        const padding = 2;
        const spacing = 4; // Space between bars
        
        // Draw happiness bar
        // Determine bar color based on happiness
        let happinessColor;
        if (this.baby.happiness >= 70) {
            happinessColor = '#4CAF50'; // Green for high happiness
        } else if (this.baby.happiness >= 30) {
            happinessColor = '#FFC107'; // Yellow for medium happiness
        } else {
            happinessColor = '#F44336'; // Red for low happiness
        }
        
        // Draw happiness background
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(x, y, width, barHeight);
        
        // Draw happiness level
        ctx.fillStyle = happinessColor;
        const happinessWidth = (width - padding * 2) * (this.baby.happiness / 100);
        ctx.fillRect(x + padding, y + padding, happinessWidth, barHeight - padding * 2);
        
        // Draw happiness border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, barHeight);

        // Draw hunger bar below happiness bar
        // Determine bar color based on hunger (inverse of happiness)
        let hungerColor;
        if (this.baby.hunger >= 70) {
            hungerColor = '#F44336'; // Red for high hunger
        } else if (this.baby.hunger >= 30) {
            hungerColor = '#FFC107'; // Yellow for medium hunger
        } else {
            hungerColor = '#4CAF50'; // Green for low hunger
        }
        
        // Draw hunger background
        ctx.fillStyle = '#E0E0E0';
        ctx.fillRect(x, y + barHeight + spacing, width, barHeight);
        
        // Draw hunger level
        ctx.fillStyle = hungerColor;
        const hungerWidth = (width - padding * 2) * (this.baby.hunger / 100);
        ctx.fillRect(x + padding, y + barHeight + spacing + padding, hungerWidth, barHeight - padding * 2);
        
        // Draw hunger border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y + barHeight + spacing, width, barHeight);
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
        
        // Update time of day
        const realTimeElapsed = new Date() - this.gameStartTime;
        const gameTimeElapsed = realTimeElapsed * this.timeMultiplier;
        const gameDate = new Date(this.gameStartTime.getTime() + gameTimeElapsed);
        this.currentHour = gameDate.getHours();
        
        // Update night state and opacity
        const isNewNight = this.currentHour >= 20 || this.currentHour < 6;
        if (isNewNight !== this.isNight) {
            this.isNight = isNewNight;
            this.nightFadeStartTime = Date.now();
        }
        
        // Update night overlay opacity
        if (this.nightFadeStartTime) {
            const elapsedTime = Date.now() - this.nightFadeStartTime;
            if (elapsedTime < this.nightFadeDuration) {
                this.nightOpacity = this.isNight ? 
                    (elapsedTime / this.nightFadeDuration) : 
                    (1 - elapsedTime / this.nightFadeDuration);
            } else {
                this.nightOpacity = this.isNight ? 1 : 0;
                this.nightFadeStartTime = null;
            }
        }
        
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

        // Update cooldown indicator opacity
        if (this.showCooldownIndicator) {
            const elapsedTime = Date.now() - this.cooldownIndicatorFadeStartTime;
            if (this.cooldownIndicatorFadeDirection === 'in') {
                if (elapsedTime < this.cooldownIndicatorFadeInDuration) {
                    this.cooldownIndicatorOpacity = elapsedTime / this.cooldownIndicatorFadeInDuration;
                } else {
                    this.cooldownIndicatorOpacity = 1.0;
                }
            } else { // fade out
                if (elapsedTime < this.cooldownIndicatorFadeOutDuration) {
                    this.cooldownIndicatorOpacity = 1.0 - (elapsedTime / this.cooldownIndicatorFadeOutDuration);
                } else {
                    this.cooldownIndicatorOpacity = 0;
                    this.showCooldownIndicator = false;
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
        
        // Get the current furniture the baby is in or near
        const nearbyFurniture = this.checkFurnitureCollision();
        
        // Define which furniture types can hold the baby
        const interactableFurniture = ['bed', 'crib', 'sofa'];
        
        // Handle pickup with Space key
        const spacePressed = this.keys[' '];
        const isColliding = isCollidingWithBaby;
        const isHolding = this.parent.isHoldingBaby;
        const canPickup = Date.now() - this.lastPlaceTime >= this.pickupCooldown;
        const canPlace = Date.now() - this.lastPickupTime >= this.placeCooldown;
        
        if (spacePressed) {
            // If showing pickup hint and not holding baby, try to pick up
            if (this.showPickupHint && !isHolding && isColliding && canPickup) {
                this.parent.isHoldingBaby = true;
                this.baby.isSleeping = false;
                this.baby.currentFurniture = null;
                this.lastPickupTime = Date.now();
                
                // Hide pickup hint immediately
                this.showPickupHint = false;
                this.pickupHintOpacity = 0;
                
                // Clear any existing timeout
                if (this.pickupHintTimeout) {
                    clearTimeout(this.pickupHintTimeout);
                }
            }
            // If showing control hint and holding baby, try to place
            else if (this.showControlHint && isHolding && nearbyFurniture && interactableFurniture.includes(nearbyFurniture.type) && canPlace) {
                this.placeBabyInFurniture(nearbyFurniture);
                this.parent.isHoldingBaby = false;
                this.lastPlaceTime = Date.now();
                
                // Hide control hint immediately
                this.showControlHint = false;
                this.controlHintOpacity = 0;
                
                // Clear any existing timeout
                if (this.controlHintTimeout) {
                    clearTimeout(this.controlHintTimeout);
                }
            }
        }

        // Handle pickup hint display
        if (!this.parent.isHoldingBaby) {
            // Show pickup hint if colliding with baby
            if (isCollidingWithBaby) {
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
            } else {
                // Hide pickup hint if not colliding
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
        }

        // Update baby position if being held
        if (this.parent.isHoldingBaby) {
            // Position baby above parent's head
            this.baby.x = this.parent.x + this.parent.width/2 - this.baby.width/2;
            this.baby.y = this.parent.y - this.baby.height;
            
            // Check for nearby interactable furniture
            if (nearbyFurniture && interactableFurniture.includes(nearbyFurniture.type)) {
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
            } else {
                // Hide control hint if not near interactable furniture
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

        // Handle baby wake-up and crying
        if (this.baby.isSleeping && !this.parent.isHoldingBaby) {
            // Random chance to wake up
            if (Math.random() < this.babyWakeUpChance) {
                this.baby.isSleeping = false;
                this.babyIsCrying = true;
                this.babyCryStartTime = Date.now();
                console.log('Baby woke up and started crying!');
            }
        }
        
        // Handle crying duration
        if (this.babyIsCrying) {
            const cryTimeElapsed = Date.now() - this.babyCryStartTime;
            if (cryTimeElapsed >= this.babyCryDuration) {
                this.babyIsCrying = false;
                this.baby.isSleeping = true;
                console.log('Baby stopped crying and went back to sleep');
            }
        }

        // Update baby hunger based on state
        if (this.baby.isSleeping) {
            // Slow hunger increase while sleeping
            this.baby.hunger = Math.min(100, this.baby.hunger + 0.005);
        } else if (this.parent.isHoldingBaby) {
            // Check if parent is in kitchen
            const kitchen = this.rooms.kitchen;
            const isInKitchen = this.parent.x >= kitchen.x && 
                               this.parent.x <= kitchen.x + kitchen.width &&
                               this.parent.y >= kitchen.y && 
                               this.parent.y <= kitchen.y + kitchen.height;
            
            if (isInKitchen) {
                // Decrease hunger while in kitchen
                this.baby.hunger = Math.max(0, this.baby.hunger - 0.1);
            } else {
                // Normal hunger increase while awake and held
                this.baby.hunger = Math.min(100, this.baby.hunger + 0.02);
            }
        } else {
            // Faster hunger increase while awake
            this.baby.hunger = Math.min(100, this.baby.hunger + 0.02);
        }

        // Update baby happiness based on state
        if (this.baby.isSleeping) {
            if (this.baby.hunger < 50) {
                // Increase happiness while sleeping and not hungry
                this.baby.happiness = Math.min(100, this.baby.happiness + 0.1);
            } else {
                // Decrease happiness while sleeping and hungry
                this.baby.happiness = Math.max(0, this.baby.happiness - 0.05);
            }
        } else if (this.parent.isHoldingBaby) {
            // Maintain high happiness while being held
            this.baby.happiness = Math.min(100, this.baby.happiness + 0.05);
        } else if (this.babyIsCrying) {
            // Decrease happiness while crying
            this.baby.happiness = Math.max(0, this.baby.happiness - 0.2);
        } else {
            // Slowly decrease happiness when awake and not being held
            this.baby.happiness = Math.max(0, this.baby.happiness - 0.05);
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
            
            // Draw night overlay if it's night time
            if (this.nightOpacity > 0) {
                this.ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * this.nightOpacity})`;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
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

            // Draw crying animation if baby is crying
            if (this.babyIsCrying && !this.parent.isHoldingBaby) {
                this.drawCryingAnimation();
            }
        } else {
            // Draw start screen
            this.drawStartScreen();
        }
    }
    
    drawControlHint() {
        const ctx = this.ctx;
        const centerX = this.parent.x + this.parent.width / 2;
        const centerY = this.parent.y + this.parent.height / 2;
        const radius = 50;
        
        ctx.save();
        
        // Draw semi-transparent background
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * this.controlHintOpacity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outer circle
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
        
        ctx.save();
        
        // Draw semi-transparent background
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * this.pickupHintOpacity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw outer circle
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
                'Colliding with Baby': this.checkCollision(this.parent, this.baby) ? 'Yes' : 'No',
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
    
    drawCooldownIndicator() {
        const ctx = this.ctx;
        const centerX = this.parent.x + this.parent.width / 2;
        const centerY = this.parent.y - 50;
        const radius = 20;
        
        ctx.save();
        
        // Draw semi-transparent background
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * this.cooldownIndicatorOpacity})`;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cooldown circle
        const elapsedTime = Date.now() - this.lastPickupTime;
        const progress = Math.min(1, elapsedTime / this.placeCooldown);
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (progress * Math.PI * 2);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.cooldownIndicatorOpacity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw remaining time
        const remainingTime = Math.ceil((this.placeCooldown - elapsedTime) / 1000);
        if (remainingTime > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.cooldownIndicatorOpacity})`;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(remainingTime.toString(), centerX, centerY);
        }
        
        ctx.restore();
    }
    
    drawClock(x, y) {
        const ctx = this.ctx;
        const radius = 40;
        const centerX = x + radius;
        const centerY = y + radius;
        
        ctx.save();
        
        // Draw clock background based on AM/PM
        if (this.currentHour >= 12) {
            // PM - Night sky with stars
            ctx.fillStyle = '#1a237e';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw stars
            ctx.fillStyle = 'white';
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const starX = centerX + Math.cos(angle) * (radius * 0.7);
                const starY = centerY + Math.sin(angle) * (radius * 0.7);
                ctx.beginPath();
                ctx.arc(starX, starY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // AM - Day sky with sun
            ctx.fillStyle = '#4fc3f7';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw sun
            ctx.fillStyle = '#ffeb3b';
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw sun rays
            ctx.strokeStyle = '#ffeb3b';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const startX = centerX + Math.cos(angle) * (radius * 0.3);
                const startY = centerY + Math.sin(angle) * (radius * 0.3);
                const endX = centerX + Math.cos(angle) * (radius * 0.6);
                const endY = centerY + Math.sin(angle) * (radius * 0.6);
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
        }
        
        // Draw clock face
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw hour indicator
        const hour = this.currentHour % 12 || 12; // Convert to 12-hour format
        const hourAngle = (hour / 12) * Math.PI * 2 - Math.PI / 2;
        const hourLength = radius * 0.6;
        
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(hourAngle) * hourLength,
            centerY + Math.sin(hourAngle) * hourLength
        );
        ctx.stroke();
        
        // Draw center dot
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawCryingAnimation() {
        const ctx = this.ctx;
        const centerX = this.baby.x + this.baby.width / 2;
        const centerY = this.baby.y - 20;
        
        ctx.save();
        
        // Draw crying mouth
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI);
        ctx.stroke();
        
        // Draw tears
        ctx.strokeStyle = '#4FC3F7';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const tearX = centerX - 5 + (i * 5);
            ctx.beginPath();
            ctx.moveTo(tearX, centerY + 5);
            ctx.lineTo(tearX, centerY + 15);
            ctx.stroke();
        }
        
        // Draw "WAAH!" text
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 16px "Comic Sans MS", cursive';
        ctx.textAlign = 'center';
        ctx.fillText('WAAH!', centerX, centerY - 30);
        
        ctx.restore();
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
        
        // Show start screen and hide canvas
        this.startScreen.style.display = 'block';
        this.canvas.classList.add('hidden');
        this.playerNameInput.focus();
        
        // Clear baby wake-up interval
        if (this.babyWakeUpInterval) {
            clearInterval(this.babyWakeUpInterval);
            this.babyWakeUpInterval = null;
        }
    }

    setupDevUI() {
        // Create dev mode indicator
        const devIndicator = document.createElement('div');
        devIndicator.className = 'fixed top-2.5 right-2.5 bg-red-500/70 text-white px-2.5 py-1.5 rounded font-sans z-50';
        devIndicator.textContent = 'DEV MODE';
        document.body.appendChild(devIndicator);

        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.className = 'fixed bottom-2.5 right-2.5 bg-black/80 text-white p-2.5 rounded font-mono z-50';
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