const s = s => document.querySelector(s);
let canvas_height = innerHeight, canvas_width = innerWidth;
let canvas,ctx,bird,
    gamespeed = 2.5,hue = 0,
    particles = [],pipes = [],
    frames = 0,buttons,
    score,scores = 0,birdcollided = false,
    images = 0,
    image = new Image(), image2 = new Image();

let scoresnd = new Audio("https://dl.dropbox.com/s/vupnrhb1sb4q0h5/mario-coin-sound-effect.mp3?dl=0");
var audio = new Audio("https://www.dropbox.com/s/qxukfvbbg25qkdd/solo%20.mp3?dl=1");
scoresnd.volume = .25;
audio.volume = .5;
let alpha = 1;
let one = 1;
window.onload = () => {

canvas = document.getElementById('canvas');

ctx = canvas.getContext('2d');

canvas.height = canvas_height;

canvas.width = canvas_width;

score = document.getElementById('score');

buttons = document.getElementsByClassName('btn');

buttons[0].addEventListener('click',function(){
initialize();
buttons[0].style.visibility = "hidden";   
});

document.addEventListener('keypress',function(){
    if(event.keyCode === 13 && one){
        one = 0;
        
        initialize();
    }
    else if(event.keyCode === 13 && birdcollided){
        reset();
    }
    buttons[0].style.visibility = "hidden";   
});

buttons[1].addEventListener('click',function(){
reset();     });

bgImage = document.getElementById("bgImage"); 

image2.width = (bgImage.height = canvas_width);
image2.height = (bgImage.width = canvas_height);

image.src = "https://dl.dropbox.com/s/tqd19quzwr6az54/flappy_bird_copy_188x144.png?dl=0";

image2.src = "https://dl.dropbox.com/s/vg27bpwfddv0g7g/background%20-%20flappy%20bird.png?dl=0";

 
image.onload=() =>{
images++;
start();}

image2.onload = () =>{
images++;
bgImage.append(image2);
start();
}
}

function start(){
if(images == 2){
document.getElementById('loading').style.visibility = "hidden";
buttons[0].style.visibility = "visible";}
}

class Bird{
constructor(x,y){
this.x = x;
this.y = y;
this.dy = 0;
this.radius = 25;
this.gravity = 0.2;
this.falling = false;
this.draw();  }

draw(){
   ctx.drawImage(image,this.x-this.radius,this.y-this.radius,this.radius*2,this.radius*2);
  
   }

fall(){
   if(birdcollided){ return;}
   if(this.y > canvas.height - this.radius){
     this.y = canvas.height - this.radius;
     this.dy = 0;
     birdcollided = true;
   }
  else if(this.y - this.radius < 0){
     this.y = 0 + this.radius;
     this.dy = 0;
   
  }
   else{
   this.dy += this.gravity;
   this.y += this.dy; }
}
fly(){
   this.dy = 0;
   this.dy -= 7;
}
}

function initialize(){

  bird = new Bird(150,canvas.width/10);

canvas.addEventListener('click',function(){
if(!birdcollided){
  bird.fly();
  }
   });
 
document.addEventListener('keypress',function(){
  if(event.keyCode === 32){bird.fly();}  });
 
  play();
  audio.play();
 
}

function play(){

ctx.clearRect(0,0,canvas.width,canvas.height);
handlePipes();
handleParticles();
bird.fall();
bird.draw();
score.innerText = scores;
frames++;
if(birdcollided){
gamespeed = 0;
ctx.font = "50px Verdana";
let txt = "Gameover";
let w = ctx.measureText(txt).width;
ctx.fillStyle = "black";
ctx.fillText(txt,canvas.width/2-w/2,180);
ctx.font = "20px Verdana";
txt = "your score is "+ scores;
  w =  ctx.measureText(txt).width;
  ctx.fillText(txt,canvas.width/2-w/2,220);
  audio.pause();
    buttons[1].style.visibility = "visible";
    return;
}
requestAnimationFrame(play);
}
class Particle {
   
  constructor(color){
  this.x = bird.x;
  this.y = bird.y;
  this.r = Math.random()*15 + 5;
  this.v = Math.random()-0.5;
  this.color = color||`hsl(${hue},100%,50%,0.8)`;
  }
  draw(){
     ctx.beginPath();
     ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
     ctx.fillStyle = this.color;
     ctx.fill();
  }
  update(){
      this.x -= gamespeed+0.5;
      this.y += this.v*2;
      if(this.r > 1){
        this.r -= 0.3;
      }
  }
 
}

function handleParticles(){
if(!birdcollided){
if(scores%5 == 0){
particles.unshift(new Particle("rgba(255,255,255,0.8)"));}
else particles.unshift(new Particle());

}
for(let i = 0;i<particles.length;i++){
    particles[i].update();
    particles[i].draw();
}

if(particles.length > 80){
  for(let i = 0;i<particles.length-80;i++){
     particles.pop();
  }
}   
  hue++;
  if(hue == 360){hue = 0;}
}

class Pipe {
 
  constructor(){
    this.x = canvas.width;
    this.y = 0;
    this.height = Math.random()*(canvas.height/3) + 100;
    this.width = 80;
    this.color = "#006a4e";
    this.counted = false;
  }
  draw(){
   ctx.fillStyle = this.color;
   ctx.fillRect(this.x,this.y,this.width,this.height);
ctx.fillRect(this.x,this.height+200,this.width,canvas.height - this.height+200);  
  }
 
  update(){
    this.x -= gamespeed;
    if(!this.counted && this.x < bird.x){
    scores++;
    if(!birdcollided){
    scoresnd.currentTime = 0;
    scoresnd.play();}
    this.counted = true;
    }
  } 
}

function handlePipes(){

if(frames > 260/gamespeed){
pipes.unshift(new Pipe());
frames = 0;
if(gamespeed < 4){
gamespeed += .1;} }

for(let i = 0;i<pipes.length;i++){
pipes[i].update();
pipes[i].draw();

let bottomPipe = {
x:pipes[i].x,
y:pipes[i].height+200,
width:pipes[i].width,
height:canvas.height - pipes[i].height+200
};
if(checkCollision(bird,pipes[i])){
  birdcollided = true;
  audio.pause();
 
}
if(checkCollision(bird,bottomPipe)){
  birdcollided = true;
  audio.pause();
}


if(pipes[i].x + pipes[i].width < 0){
   pipes.pop(); }
  }
}

function checkCollision(circle,rect){
let distX = Math.abs(circle.x - rect.x-rect.width/2);
let distY = Math.abs(circle.y - rect.y-rect.height/2);
if (distX > (rect.width/2 + circle.radius)) { return false; }
if (distY > (rect.height/2 + circle.radius)) { return false; }
if (distX <= (rect.width/2)) { return true; }
if (distY <= (rect.height/2)) { return true; }
let dx=distX-rect.width/2;
let dy=distY-rect.height/2;
return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}

function reset(){
particles.length = 0;
pipes.length = 0;
hue = 0;
frames = 0;
birdcollided = false;
gamespeed = 2.5;
scores = 0;
buttons[1].style.visibility = "hidden";
initialize();
}
