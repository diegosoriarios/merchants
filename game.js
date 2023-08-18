const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}
canvas.height = 768;
canvas.width = 1024;

/*update frame (movement of tetris element) */
let dropCounter=0;
let dropInterval=100;
let lastTime=0;
let encounterTime = 60 * 5;

const STATES = {
  GAME: "GAME",
  BATTLE1: "BATTLE1",
  TETRIS: "TETRIS",
  CATCH: "CATCH",
};

let battleTime = 5 * 60;

let state = STATES.GAME;

function printMousePos(event) {
  console.log(event.offsetX, event.offsetY);
}
let hour = 22;
let minutes = 0;
let eventTime = 0;
let myGradient;
let keyUp,
  keyDown,
  keyLeft,
  keyRight = false;

let clouds = [];
let horseSpriteIndex = 0
let spriteTimer = 0;
const SpriteHorse = [[0, 0], [64, 0], [128, 0], [0, 64], [64, 64], [128, 64], [0, 128], [64, 128]];

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2 + 150,
  color: "white",
  size: 10,
  health: 20,
  speed: 2,
};

const attacks = [];

const generateAttack1 = () => {};

const generateAttacks = () => {
  if (STATES.BATTLE1) {
    const type = Math.round(randomNumber(0, 3));
    if (type === 1) {
      [...Array(3)].forEach((attack, index) => {
        const minX = canvas.width / 2 - 125;
        const maxX = canvas.width / 2 - 125 + 250 - player.size;
        let y = canvas.height / 2;
        let x = randomNumber(minX, maxX);
        if (index == 1) {
          x = player.x;
        }

        attacks.push({
          index,
          type,
          x,
          y,
          color: "red",
          size: 25,
          speed: 5,
        });
      });
    } else if (type === 2) {
      [...Array(4)].forEach((attack, index) => {
        const minY = canvas.height / 2 + 50;
        const maxY = canvas.height / 2 + 50 + 250 - player.size;
        let direction = index % 2 == 0;
        let x = direction ? canvas.width / 2 + 500 : canvas.width / 2 - 500;
        let y = randomNumber(minY, maxY);
        if (index == 1) {
          y = player.y;
        }

        attacks.push({
          index,
          type,
          x,
          y,
          direction,
          color: "red",
          size: 25,
          speed: 5,
        });
      });
    } else if (type === 3) {
      [...Array(3)].forEach((attack, index) => {
        const minY = canvas.height / 2 + 75;
        const maxY = canvas.height / 2 + 285 - player.size;
        let directionX = index % 2 == 0;
        let x = directionX ? canvas.width / 2 + 100 : canvas.width / 2 - 120;
        let y = randomNumber(minY, maxY);
        if (index == 1) {
          y = player.y;
        }

        attacks.push({
          index,
          subType: 0,
          type,
          x,
          y,
          directionX,
          directionY: 0,
          color: directionX ? "red" : "blue",
          size: 25,
          speed: randomNumber(2, 5),
        });
      });
      [...Array(2)].forEach((attack, index) => {
        const minY = canvas.height / 2 + 50;
        const maxY = canvas.height / 2 + 285 - player.size;
        let direction = index % 2 == 0;
        let x = canvas.width/2//direction ? canvas.width / 2 + 500 : canvas.width / 2 - 500;
        let y = maxY//randomNumber(minY, maxY);
        if (index == 1) {
          y = player.y;
        }

        attacks.push({
          index,
          subType: 1,
          type,
          x,
          y,
          direction,
          color: "green",
          size: 25,
          speed: 5,
        });
      });
    }
  }
};

const handleKeyPress = (event) => {
  const code = event.code;

  if (state === STATES.TETRIS) {
    switch (code) {
      case "KeyA":
        playerTetrisMove(-1);
        break;
      case "KeyD":
        playerTetrisMove(+1);
        break;
      case "KeyW":
        keyUp = false;
        break;
      case "KeyS":
        playerTetrisDrop();
        break;
      case "KeyQ":
        playerTetrisRotate(-1)
        break;
      case "KeyE":
        playerTetrisRotate(1)
        break;
      default:
        break;
    }
  }

  switch (code) {
    case "KeyM":
      state = STATES.MAP;
      break;
    case "KeyA":
      keyLeft = true;
      break;
    case "KeyD":
      keyRight = true;
      break;
    case "KeyW":
      keyUp = true;
      break;
    case "KeyS":
      keyDown = true;
      break;
    default:
      break;
  }
};

const handleKeyRelease = (event) => {
  const code = event.code;

  switch (code) {
    case "KeyA":
      keyLeft = false;
      break;
    case "KeyD":
      keyRight = false;
      break;
    case "KeyW":
      keyUp = false;
      break;
    case "KeyS":
      keyDown = false;
      break;
    default:
      break;
  }
};

document.addEventListener("keydown", handleKeyPress, false);
document.addEventListener("keyup", handleKeyRelease, false);

let currentCity = 0;

document.addEventListener("click", printMousePos);
const colorsOfSky = [
  ["#00000c"],
  ["#020111", "#191621"],
  ["#020111", "#20202c"],
  ["#020111", "#3a3a52"],
  ["#20202c", "#515175"],
  ["#40405c", "#6f71aa", "#8a76ab"],
  ["#4a4969", "#7072ab", "#cd82a0"],
  ["#757abf", "#8583be", "#eab0d1"],
  ["#82addb", "#ebb2b1"],
  ["#94c5f8", "#a6e6ff", "#b1b5ea"],
  ["#b7eaff", "#94dfff"],
  ["#9be2fe", "#67d1fb"],
  ["#90dffe", "#38a3d1"],
  ["#57c1eb", "#246fa8"],
  ["#2d91c2", "#1e528e"],
  ["#2473ab", "#1e528e", "#5b7983"],
  ["#1e528e", "#265889", "#9da671"],
  ["#1e528e", "#728a7c", "#e9ce5d"],
  ["#154277", "#576e71", "#e1c45e ", "#b26339"],
  ["#163C52", "#4F4F47", "#C5752D ", "#B7490F ", " #2F1107"],
  ["#071B26", "#071B26", "#8A3B12 ", "#240E03"],
  ["#010A10", "#59230B", "#2F1107"],
  ["#090401", "#4B1D06"],
  ["#00000c", "#150800"],
  ["#00000c"],
];

generateClouds = () => {
  let types = [0, 1];
  return {
    x: canvas.width + 100,
    y: Math.floor(Math.random() * (canvas.height / 2 - 200)),
    w: 150,
    h: 76,
    speed: Math.floor(Math.random() * 6 + 2),
    types: Math.floor(Math.random() * types.length),
  };
};

changeColorSky = (hour) => {
  myGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  colorsOfSky[hour].forEach((colors, i) => {
    myGradient.addColorStop(i / colorsOfSky[hour].length, colors);
  });
};

changeCloudsAlpha = (hour) => {
  const values = [
    0.1, 0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1, 1, 1, 1, 1, 1, 0.7, 0.6,
    0.5, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1,
  ];
  return values[hour];
};

const woodGradient = ctx.createRadialGradient(
  canvas.width / 2 - 50,
  canvas.height / 2,
  100,
  25,
  20,
  150
);
woodGradient.addColorStop(0, "#87674f");
woodGradient.addColorStop(0.5, "#563232");
woodGradient.addColorStop(1, "#87674f");

horseImage = new Image();
horseImage.src = "./assets/horse.png";
cloudImage1 = new Image();
cloudImage1.src = "./assets/clouds/1.png";
cloudImage2 = new Image();
cloudImage2.src = "./assets/clouds/2.png";

const draw = () => {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
  ctx.fillStyle = myGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height / 2 + 50);
  ctx.fillStyle = "green";
  ctx.fillRect(0, canvas.height / 2 + 50, canvas.width, canvas.height / 4);
  ctx.fillStyle = "black";
  ctx.fillRect(
    0,
    canvas.height / 2 + canvas.height / 4,
    canvas.width,
    canvas.height / 4
  );

  ctx.drawImage(horseImage, SpriteHorse[horseSpriteIndex][0], SpriteHorse[horseSpriteIndex][1], 64, 64, canvas.width / 2 - 64, canvas.height / 2 - 78, 128, 128);

  clouds.forEach((cloud) => {
    ctx.globalAlpha = changeCloudsAlpha(hour);
    if (cloud.types === 1) {
      ctx.drawImage(cloudImage1, cloud.x, cloud.y);
    } else {
      ctx.drawImage(cloudImage2, cloud.x, cloud.y);
    }
  });
  ctx.globalAlpha = 1;
};

const drawBattle1 = () => {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(canvas.width / 2 - 125, canvas.height / 2 + 50, 250, 250);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  attacks.forEach((attack) => {
    ctx.fillStyle = attack.color;
    ctx.fillRect(attack.x, attack.y, attack.size, attack.size);
  });
};

const update = (time = 0) => {
  switch (state) {
    case STATES.GAME: {
      draw();
      minutes += 1 / 180;
      spriteTimer += 1;
      encounterTime--;

      if (encounterTime===0) {
        eventTime = 1;
        encounterTime = 60 * 5
      }
      if (spriteTimer > 30) {
        horseSpriteIndex++;
        if (horseSpriteIndex === SpriteHorse.length) {
          horseSpriteIndex = 0
        }
        
        spriteTimer = 0;
      }

      if (eventTime === 1) {
        const events = randomNumber(0, 2)
        console.log(events);
          switch (Math.floor(events)) {
            case 0:
              state = STATES.BATTLE1
              break;
            case 1:
              state = STATES.TETRIS
              break
            default:
              state = STATES.GAME
              break;
          }
        eventTime = 0;
      }
    
      if (Math.floor(minutes) === 2.0) {
        hour++;
        if (hour === 24) {
          hour -= 24;
          //day++;
        }
        changeColorSky(hour);
        minutes = 0;
      }
      clouds.forEach((cloud, i) => {
        if (cloud.x + cloud.w > -150) {
          cloud.x -= cloud.speed;
        } else {
          clouds[i] = generateClouds();
        }
      });
      break;
    }
    case STATES.TETRIS: {
      const deltaTime=time-lastTime;
      lastTime=time;

      dropCounter+=deltaTime;
      if(dropCounter>dropInterval){
          playerTetrisDrop()
      }
      drawTetris();
      break;
    }
    case STATES.BATTLE1: {
      if (battleTime <= 1) {
        state = STATES.GAME;
      }
      battleTime -= battleTime / 60;
      drawBattle1();

      attacks.forEach((attack) => {
        if (attack.type === 1) {
          attack.y += attack.speed;
          if (attack.y > canvas.height) {
            const minX = canvas.width / 2 - 125;
            const maxX = canvas.width / 2 - 125 + 250 - player.size;
            let y = canvas.height / 2;
            let x = randomNumber(minX, maxX);
            attack.y = y;
            if (attack.index === 1) {
              attack.x = player.x;
            } else attack.x = x;
          }
        } else if (attack.type === 2) {
          attack.x += attack.direction ? -attack.speed : attack.speed;
          if (
            attack.x < canvas.width / 2 - 250 ||
            attack.x + attack.size > canvas.width / 2 + 250
          ) {
            const minY = canvas.height / 2 + 50;
            const maxY = canvas.height / 2 + 50 + 250 - player.size;
            let x = attack.direction
              ? canvas.width / 2 + 200
              : canvas.width / 2 - 200;
            let y = randomNumber(minY, maxY);
            attack.x = x;
            if (attack.index == 1) {
              y = player.y;
            } else {
              attack.y = y;
            }
          }
        } else if (attack.type === 3) {
          if (!attack.subType) {
            attack.x += attack.directionX ? -attack.speed : attack.speed;
            attack.y += attack.directionY ? -attack.speed : attack.speed;
            if (
              attack.y <= canvas.height / 2 + 50 ||
              attack.y + attack.size >= canvas.height / 2 + 300
            ) {
              attack.directionY = !attack.directionY;
            }
            if (
              attack.x <= canvas.width / 2 - 125 ||
              attack.x + attack.size >= canvas.width / 2 + 125
            ) {
              attack.directionX = !attack.directionX;
            }
          } else {
            attack.x += attack.direction ? -attack.speed : attack.speed;
          if (
            attack.x < canvas.width / 2 - 250 ||
            attack.x + attack.size > canvas.width / 2 + 250
          ) {
            const minY = canvas.height / 2 + 50;
            const maxY = canvas.height / 2 + 50 + 250 - player.size;
            let x = attack.direction
              ? canvas.width / 2 + 200
              : canvas.width / 2 - 200;
            let y = randomNumber(minY, maxY);
            attack.x = x;
            if (attack.index == 1) {
              y = player.y;
            } else {
              attack.y = y;
            }
          }
          }
        }
      });

      if (keyLeft)
        if (state == STATES.BATTLE1) {
          if (player.x > canvas.width / 2 - 125) player.x -= player.speed;
        }
      if (keyRight)
        if (state == STATES.BATTLE1) {
          if (player.x + player.size < canvas.width / 2 - 125 + 250)
            player.x += player.speed;
        }
      if (keyUp)
        if (state == STATES.BATTLE1) {
          if (player.y > canvas.height / 2 + 50) player.y -= player.speed;
        }
      if (keyDown)
        if (state == STATES.BATTLE1) {
          if (player.y + player.size < canvas.height / 2 + 50 + 250)
            player.y += player.speed;
        }
    }
  }
  requestAnimationFrame(update);
};

const init = () => {
  generateAttacks();
  changeColorSky(hour);
  for (let i = 0; i < 5; i++) {
    clouds.push(generateClouds());
  }
  update();
};
init();
