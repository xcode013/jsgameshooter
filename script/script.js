const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

const bgLayer1 = new Image();
bgLayer1.src = 'assets/imageSprite/layer-1.png';
const bgLayer2 = new Image();
bgLayer2.src = 'assets/imageSprite/layer-2.png';
const bgLayer3 = new Image();
bgLayer3.src = 'assets/imageSprite/layer-3.png';
const bgLayer4 = new Image();
bgLayer4.src = 'assets/imageSprite/layer-4.png';
const bgLayer5 = new Image();
bgLayer5.src = 'assets/imageSprite/layer-5.png';

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let gameOver = false;
let score = 0;
ctx.font = '30px impact';
let gameSpeed = 5;

class BackgroundLayer{
    constructor(image, speedModifier){
        this.x = 0;
        this.y = 0;
        this.image = image;
        this.speedModifier = speedModifier;
        this.width = canvas.width + 500;
        this.height = canvas.height;
        this.speed = gameSpeed * this.speedModifier;
    }
    update(){
        this.speed = gameSpeed * this.speedModifier;
        if(this.x <= -this.width){
            this.x = 0;
        }
        this.x = Math.floor(this.x - this.speed);
    }
    lukis(){
        ctx.drawImage(this.image,this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image,this.x + this.width, this.y, this.width, this.height);
    }
}

let ravens = [];

class Raven {
    constructor(){
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.4 + 0.15;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 2 + 2;
        this.directionY = Math.random() * 2 - 1.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = 'assets/imageSprite/raven.png';
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = `rgb(${this.randomColor[0]} , ${this.randomColor[1]} , ${this.randomColor[2]})`;
        this.hasTrail = Math.random() > 0.5;
    }
    
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }

        this.x -= this.directionX;
        this.y += this.directionY;
        if(this.x < 0 - this.width) this.markedForDeletion = true;

        this.timeSinceFlap += deltaTime;

        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame) this.frame = 0;
            else this.frame++;
            this.timeSinceFlap = 0;  
            if(this.hasTrail){
                for(let i = 0; i < 5; i++){
                    particles.push(new Particle(this.x, this.y, this.width, this.color));
                }
            }
        }

        if (this.x < 0 - this.width) gameOver = true;
    }

    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x,this.y,this.width, this.height);
        ctx.drawImage(this.image,this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion{
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'assets/imageSprite/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.audioFx = new Audio();
        this.audioFx.src = 'assets/soundfx/hit_soundfx.mp3';
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
    }

    update(deltaTime){
        if(this.frame === 0) this.audioFx.play();
        this.timeSinceLastFrame += deltaTime;
        if(this.timeSinceLastFrame > this.frameInterval){
            this.frame++;
            if(this.frame > 5) this.markedForDeletion = true;
        }
    }

    draw(){
        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth, this.spriteHeight,this.x, this.y, this.size, this.size);
    }
}

let particles = [];
class Particle {
    constructor(x, y, size, color){
        this.size = size;
        this.x = x + this.size/2;
        this.y = y + this.size/3;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 35;
        this.color = color;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
    }
    update(){
        this.x += this.speedX;
        this.radius += 0.5;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


function drawScore(){
    ctx.fillStyle = 'black';
    ctx.fillText('Score : ' + score, 12, 32);
    ctx.fillStyle = 'gold';
    ctx.fillText('Score : ' + score, 10, 30);
}

function drawGameOver (){
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over : ' + score, (canvas.width/2) + 3, (canvas.height/2) + 3);
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over : ' + score, (canvas.width/2) - 3, (canvas.height/2) - 3);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over : ' + score, canvas.width/2, canvas.height/2);
}

const backgroundLayer1 = new BackgroundLayer(bgLayer1, 0.2);
const backgroundLayer2 = new BackgroundLayer(bgLayer2, 0.4);
const backgroundLayer3 = new BackgroundLayer(bgLayer3, 0.6);
const backgroundLayer4 = new BackgroundLayer(bgLayer4, 0.8);
const backgroundLayer5 = new BackgroundLayer(bgLayer5, 1);

const gameBackgrouds = [backgroundLayer1, backgroundLayer2, backgroundLayer3, backgroundLayer4, backgroundLayer5];

window.addEventListener('click', function(e){
    const detectionPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
    const pixelColor = detectionPixelColor.data;
    ravens.forEach( object => {
        if(object.randomColor[0] == pixelColor[0] && object.randomColor[1] == pixelColor[1] && object.randomColor[2] == pixelColor[2]){
            object.markedForDeletion = true;
            score++;
            explosions.push(new Explosion(object.x, object.y, object.width));
        }
    })
    
})

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    collisionCtx.clearRect(0,0,canvas.width, canvas.height);
    gameBackgrouds.forEach(layer =>{
        layer.update();
        layer.lukis();
    })
    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextRaven += deltaTime;
    if(timeToNextRaven > ravenInterval){
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function(a,b){
            return a.width - b.width;
        })
    }
    drawScore();
    [...particles ,...ravens, ...explosions].forEach(object => object.update(deltaTime));
    [...particles ,...ravens, ...explosions].forEach(object => object.draw());

    ravens = ravens.filter(object => !object.markedForDeletion);
    explosions = explosions.filter(object => !object.markedForDeletion);
    particles = particles.filter(object => !object.markedForDeletion);
    

    // requestAnimationFrame(animate);
    if (!gameOver) requestAnimationFrame(animate);
    if(gameOver) drawGameOver();
}

animate(0);