#!/usr/bin/env node
//One dim dungeon 
//by lee2sman 2020
//welcome to my spaghetti code
//
// AGPL-3.0 License 

//globals
const fs = require('fs');
const chalk = require('chalk');

let lastScore, highScore;
let hp=6, playerLevel = 0, gold=0, potions = 0, floor = 0, debugMode = false, vertical = false, flipflop = false, blind = false, blindness = 5, hallucinate = false, tripCounter = 0, archCounter = 0, potionsUsed = 0;
let playerX = 0;
let stairsX, goldX = 0, potionX = 0;
let conduct = "Adventurer";
let killed = 0;
let lastMonster = '';
let monsters = [], dungeonStartLength=24;
let monstersList = {
  "monsters": [
    {
      "name":"jackal",
      "char":"j",
      "hp": 2,
      "aggression": 0.55,
      "attack": 2,
      "minLevel": 0,
      "color": "white",
      "code": ""
    }, 
    {
      "name":"kobold",
      "char":"k",
      "hp": 3,
      "aggression": 0.70,
      "attack": 2,
      "minLevel": 0,
      "color": "white",
      "code": ""
    }, 
    {
      "name":"bat",
      "char":"b",
      "hp":1,
      "aggression":0.35,
      "attack":1,
      "minLevel": 0,
      "color":"white",
      "code":"console.log('the bat picked you up and dropped you!');playerX = Math.ceil(Math.random()*(dungeon.length-2))"
      //move somewhere else randomly in level, doesn't check for collision, probably should be fixed"
    },
    {
      "name":"rat",
      "char":"r",
      "hp":3,
      "aggression":0.85,
      "attack":2,
      "minLevel": 1,
      "color":"grey",
      "code":"if(potions>0){console.log('the rat stole a potion!');potions--}"
    },
    {
      "name":"monkey",
      "char":"m",
      "hp":2,
      "aggression":0.25,
      "attack":2,
      "minLevel": 2,
      "color":"white",
      "code":"if(gold>0){console.log('the monkey stole some gold');gold-=(Math.ceil(Math.random()))}"
    },
    {
      "name":"snake",
      "char":"s",
      "hp":4,
      "aggression":0.75,
      "attack":3,
      "minLevel": 2,
      "color":"white",
      "code":"console.log('ssssssssssssss')"
    },
    {
      "name":"hobgoblin",
      "char":"H",
      "hp":7,
      "aggression":0.82,
      "attack":4,
      "minLevel": 3,
      "color":"magenta",
      "code":""
    },
    {
      "name":"cockatrice",
      "char":"c",
      "hp":6,
      "aggression":0.72,
      "attack":4,
      "minLevel": 3,
      "color":"white",
      "code":""
    },
    {
      "name":"toad",
      "char":"t",
      "hp":3,
      "aggression":0.7,
      "attack":3,
      "minLevel": 4,
      "color":"green",
      "code":"hallucinate=true;console.log('The toad hit you. You are hallucinating');tripCounter++"
    },
    {
      "name":"hell dog",
      "char":"d",
      "hp":4,
      "aggression":0.72,
      "attack":7,
      "minLevel": 4,
      "color":"red",
      "code":""
    },
    {
      "name":"orc",
      "char":"o",
      "hp":8,
      "aggression":0.72,
      "attack":2,
      "minLevel": 5,
      "color":"cyan",
      "code":""
    },
    {
      "name":"quagga",
      "char":"q",
      "hp":5,
      "aggression":0.72,
      "attack":3,
      "minLevel": 6,
      "color":"white",
      "code":""
    },
    {
      "name":"archon",
      "char":"a",
      "hp":8,
      "aggression":0.55,
      "attack":7,
      "minLevel": 7,
      "color":"yellow",
      "code":""
    },

    {
      "name":"yeti",
      "char":"y",
      "hp":8,
      "aggression":0.5,
      "attack":5,
      "minLevel": 7,
      "color":"cyan",
      "code":""
    },
    {
      "name":"vampire",
      "char":"y",
      "hp":10,
      "aggression":0.85,
      "attack":12,
      "minLevel": 10,
      "color":"red",
      "code":""
    },
    {
      "name":"floating eyeball",
      "char":"e",
      "hp":10,
      "aggression":0.45,
      "attack":12,
      "minLevel": 9,
      "color":"blue",
      "code":"console.log('floating eyeball blinds you');turnOnDarkness();"
    },
    {
      "name":"centaur",
      "char":"C",
      "hp":12,
      "aggression":0.90,
      "attack":14,
      "minLevel": 10,
      "color":"yellow",
      "code":""
    },
    {
      "name":"naga",
      "char":"N",
      "hp":12,
      "aggression":0.90,
      "attack":14,
      "minLevel": 11,
      "color":"cyan",
      "code":""
    },
    {
      "name":"xorn",
      "char":"x",
      "hp":19,
      "aggression":0.80,
      "attack":17,
      "minLevel": 12,
      "color":"magenta",
      "code":""
    },
    {
      "name":"arch lich",
      "char":"L",
      "hp":21,
      "aggression":0.65,
      "attack":20,
      "minLevel": 13,
      "color":"white",
      "code":""
    },
    {
      "name":"dragon",
      "char":"D",
      "hp":24,
      "aggression":0.75,
      "attack":21,
      "minLevel": 13,
      "color":"yellow",
      "code":""
    }
  ]
}


class Monster {
 constructor(pos=null) {
   let _monster;

   do {
     _monster 	= Math.floor(Math.random()*monstersList.monsters.length)
   } while (monstersList.monsters[_monster].minLevel > playerLevel) //spawns monster of appropriate strength

   this.char       = monstersList.monsters[_monster].char;
   this.name       = monstersList.monsters[_monster].name;
   this.hp    	   = monstersList.monsters[_monster].hp;
   this.attack	   = monstersList.monsters[_monster].attack;
   this.aggression = monstersList.monsters[_monster].aggression;
   this.color      = monstersList.monsters[_monster].color;
   this.code       = monstersList.monsters[_monster].code;

//choose x location
   if (pos !== null){
     this.x = pos;
   }
   else {
     do {
	this.x = Math.ceil(Math.random()*(dungeon.length-1));
     } while (this.x == playerX)
   }
 }
}

//-START GAME-
start();
main();
//COLOR TESTS
//let tempC = chalk.keyword(monstersList.monsters[0].color);
//console.log(tempC(monstersList.monsters[0].name +' is char '+monstersList.monsters[0].char));
/*
for (let i = 0; i < monstersList.monsters.length; i++){

    let tempC = chalk.keyword(monstersList.monsters[i].color);

    console.log(tempC(monstersList.monsters[i].char+' is a '+monstersList.monsters[i].hp+'hp '+monstersList.monsters[i].name+' that attacks for '+monstersList.monsters[i].attack+' and is '+monstersList.monsters[i].aggression));
}
*/

function start(){
  //clear screen to start
    console.log('\033[2J');

  checkFlags();
  checkTerminal();

  console.log('Welcome to One Dim Dungeon 1dimensional roguelike');
  console.log('Version 0.2');
  console.log();
  lastScore = fs.readFileSync('.lastscore.txt', 'utf8');
  highScore = fs.readFileSync('.highscore.txt', 'utf8');
  console.log('Last score: '+lastScore+' gold');
  console.log('High score: '+highScore+' gold');

  resetDungeon();
}

function resetDungeon(){
  playerLevel++;
  monsters = [];
  dungeon = [];
  goldX = 0;
  //potionX = dungeonStartLength - 1;
  potionX = 0;

  dungeonStartLength = Math.ceil(Math.random()*20)+6; //dungeons are 7 - 26 in length, edges hidden

  //superfluous?
  for (let i = 0; i < dungeonStartLength; i++){
    dungeon.push('.');
  }

  //place player
  playerX = Math.ceil(Math.random()*(dungeon.length-2))

  spawnStairs();

  //spawn gold potentially, 25% chance
    if (Math.random()<0.25){
       spawnGold();
    }
  
  //spawn potion, 23% chance
    if (Math.random()<0.23){
       spawnPotion();
    }

  //spawn monsters 
  /*
  if (playerLevel<02){
    spawnMonster();
    spawnMonster();
  } else if (playerLevel<8){
    spawnMonster();
    spawnMonster();
    spawnMonster();
  } else {

  }
*/
  for (let i = 0; i < playerLevel; i+=2){
    spawnMonster();
  }

  if (dungeonStartLength>16){ //then spawn another
    spawnMonster();     
  }

}


function spawnStairs(){
  do {
    stairsX = Math.ceil(Math.random()*(dungeon.length-2))
  }
  while (stairsX === playerX);
}

function main(){
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {

    //clear screen
    console.log('\033[2J');

    increaseHealth();

    checkKeys(str, key, legitMove = false);

    moveMonsters(legitMove);

    if (Math.random()<0.30){ //30% chance of spawn a monster each move
      if (Math.random()<0.5){ //spawn left
        spawnMonster(0);
      } else { //spawn right
        spawnMonster(dungeon.length-1);
      }
    }

    checkBlindness();
    checkHallucinate();

    printStats();
    drawScreen();

    checkIfWon();
  });
  console.log();
  console.log('Press any key...');
  console.log('(?) for help');
}

function checkTerminal(){
  if (process.stdout.columns<48 || process.stdout.rows<22){
    console.log();
    console.log('WARNING:');
    console.log('1dim dungeon recommends a min width of 48 and height of 22.');
    console.log();
  }
}

function checkKeys(str, key){
   if (key.ctrl && key.name === 'c') {
      end();

     //MOVE LEFT OR UP, if player not all the way to the left
    } else if (((!vertical && key.name === 'left') || (!vertical && key.name === 'h') || (vertical && key.name === 'up') || (vertical && key.name === 'k')) && playerX > 1){ 
        legitMove = true;
        moveLeft();      
      //MOVE RIGHT OR DOWN, if player not all the way to the right
    } else if (((!vertical && key.name === 'right') || (!vertical && key.name === 'l') || (vertical && key.name === 'down') || (vertical && key.name === 'j')) && playerX < dungeon.length-2){
      legitMove = true;
      moveRight();
   } else if ((key.sequence === '.') || (key.name === 'space')){ //rest
          legitMove = true;
    } else if ((key.name === 'q' && potions>0) || (key.name === 'p' && potions>0)){
           usePotion();
    } else if (key.sequence === 'Q'){ //quit, case-sensitive
      end();
    } else if (key.name === 'r'){
          legitMove = true;
    } else if (key.sequence === '<'){
	if (playerX == stairsX){
	  descendStairs();
	}
    } else if (key.name === 'd'){
        toggleDebugMode();
    } else if (key.name === 'v'){
        toggleOrientation();
    } else if (key.sequence === '?'){
       help(str, key);
    } else {
      //
      console.log('not a command');
      console.log();
      help(str, key);
     }
}

function checkFlags(){
    for (arg in process.argv){
      if (process.argv[arg] == '-d' || process.argv[arg] == '--debug'){
	toggleDebugMode();
      }
      if (process.argv[arg] == '-v' || process.argv[arg] == '--vertical'){
	toggleOrientation();
      }
      if (process.argv[arg] == '-f' || process.argv[arg] == '--flip-flop'){
	flipflop = true;
	console.log('Flip-flop orientation mode');
      }
    }
}

function toggleDebugMode(){
    debugMode=!debugMode;
    if (debugMode){
      console.log('Debug mode: ON');
    } else {
      console.log('Debug mode: OFF');
    }
}

function toggleOrientation(){
    vertical=!vertical;
    if (vertical){
      console.log('Vertical orientation');
    } else {
      console.log('Horizontal orientation');
    }
}

function moveLeft(){
          let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX-1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }

        if ((playerX-1)==goldX){ 
	   tempGold = Math.ceil(Math.random()*(10*playerLevel));
	   console.log('You found '+tempGold+' gold.');
	  goldX=0;
	   gold+=tempGold;
	}

        if ((playerX - 1) == potionX){
	   potions++;
	   potionX=0;
	   console.log('You found a potion!');
	}

	  if (!(monsterPresence)){ //no monster there
	    playerX--;
	}
   
}

function moveRight(){
      let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX+1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }

        if ((playerX + 1) == goldX){
	   tempGold = Math.ceil(Math.random()*20);
	   console.log('You found '+tempGold+' gold.');
	  goldX=0;
	   gold+=tempGold;
	}
        if ((playerX + 1) == potionX){
	   potions++;
	   potionX=0;
	   console.log('You found a potion!');
	}

	if (!(monsterPresence)){ //no monster there
          playerX++;
	}
}

function descendStairs(){
    //add some hp when you descend
    hp+=Math.round(Math.random()*(playerLevel/4))

    //draw new floor
    if (flipflop)(toggleOrientation()) 

    resetDungeon();
}

function help(str, key){
      console.log('Motion:    ARROW KEYS or Vim-keys');
      console.log('           space or . to rest one turn');
      console.log();
      console.log('Commands:');
      console.log();
      console.log('(?)        help (this menu)');
      console.log('(<)        descend stairs/retrieve amulet');
      console.log('(q) or (p) quaff potion');
      console.log('(d)        debug mode toggle on/off');
      console.log('(v         toggle horizontal/vertical orientation ');
      console.log('(Q)        Quit');
  //USEFUL FOR DEBUGGING
  if (debugMode){
      console.log(key);

      console.log(`You pressed the "${str}" key`);
    }

}

function spawnGold(){
  do {
    goldX = Math.floor(Math.random()*dungeon.length);
  }  while ((goldX == playerX) || (goldX == stairsX));
}

function spawnPotion(){
  do {
    potionX = Math.floor(Math.random()*dungeon.length);
  } while ((potionX == goldX) || (potionX == playerX) || (potionX == stairsX))
}

function increaseHealth(){
  //regeneration
  if (Math.random()<0.2){ //20% chance of player's life increasing
    if (hp<(4*playerLevel)){ //can't increase life above a limit
      hp+=Math.round(Math.random()*playerLevel)
    }
  }
}

function usePotion(){
  if (potions>0){
    potionX = 0;
    potions--;
    potionsUsed++;

    let result = Math.random();
    if (result<0.2){
      if (hp<(4*playerLevel)){ //can't increase life above a limit //GOOD
	console.log('You drink a potion of regeneration.');
	hp+=Math.round(Math.random()*playerLevel);
      }
    } else if (result<0.3){ //BAD
      console.log('A cloak of darkness temporarily blinds you'); 
      turnOnDarkness();
    } else if (result<0.5){//increase health, no limit! 6 is a magic number
	console.log('You drink a health potion'); //GOOD
	hp+=Math.round(Math.random()*(playerLevel/2)+6); 
    } else if (result<0.6){
       console.log('You were poisoned!');
       hp-=Math.round(Math.random()*playerLevel);
    } else if (result<0.7){
      hallucinate=true;
      console.log('You are hallucinating');
      tripCounter++;
    } else if ((result<0.8)&&(playerLevel<16)){ //can't fall through final floor
      console.log('Dissolving dust. You fall through the floor. Ooof.'); //OK
       hp-=Math.round(playerLevel/3);
      resetDungeon();
    } else if (result<0.9){ //GOOD
      console.log('You cast a potion of luck');
      gold+=Math.ceil(Math.random()*playerLevel+10);
    } else {
      console.log('Potion of summoning. You summon a demon.'); //BAD
      spawnMonster();
    }
  } else {
    console.log('You have no potions!');
  }
}

function checkBlindness(){
  if (blind){
    blindness--;
  }
  if (blindness<=0)(blind=false)
}

function turnOnDarkness(){
  blind = true;
  blindness = Math.ceil(Math.random()*6+2); //3 to 8 turns
}

function checkHallucinate(){
  if (Math.random()<0.1){ //10% chance of it ending! 
    hallucinate = false;
  }
}


function spawnMonster(pos){
  let allowSpawn = true;
  for (monster in monsters){
    if ((monsters[monster].x == 0)||(monsters[monster].x == dungeon.length-1)){
      allowSpawn = false;
    }
  }

  if (allowSpawn){

	//spawn monster
	monster = new Monster(pos);
	monsters.push(monster);
	if (debugMode){
	  console.log('created a monster!');
	  console.log(monsters);
	}
      }

}

function moveMonsters(legitMove){
  if (legitMove){
    for (var monster in monsters){
      if (Math.random()<monsters[monster].aggression){ //is monster provoked?
	if (debugMode){
          console.log(monsters[monster].name+' is angry!');
	}

	  if (monsters[monster].x<(playerX-1)){ //if monster to left and player more than 1 away
	    let noMonsterAdjacent = true;
	    for (otherMonster in monsters){
                if (monsters[otherMonster].x == monsters[monster].x + 1){
		  noMonsterAdjacent = false;
		}
	    }
	      if (noMonsterAdjacent){//no monster to immediate right, move right
		monsters[monster].x++;
	      }
	  } else if (monsters[monster].x == (playerX-1)){
	    lastMonster=monsters[monster].name; //save monster's name for stats output
            console.log('The '+lastMonster+ ' hit you!');

	    if (monsters[monster].code){ //check to see if there's any special code to run
	      eval(monsters[monster].code);
	    }

	    //player loses some hp
	    hp-=monsters[monster].attack;

	  } else if (monsters[monster].x>(playerX+1)){ //if monster more than 1 space away to right of player
              
	    let noMonsterAdjacent = true;
		for (otherMonster in monsters){
		    if (monsters[otherMonster].x == monsters[monster].x - 1){
		      noMonsterAdjacent = false;
		    }
		}

	      if (noMonsterAdjacent){//no monster is to immediate left so move monster left
		 monsters[monster].x--;
	      }

	  } else if (monsters[monster].x == playerX+1){
            //console.log('The '+monsters[monster].name+ ' hit you!');
	    lastMonster=monsters[monster].name;
            console.log('The '+lastMonster+ ' hit you!');

	    if (monsters[monster].code){ //check to see if there's any special code to run
	      eval(monsters[monster].code);
	    }

	    //player loses some hp
	    hp-=monsters[monster].attack;
	  }
      }
    }
  }
}

function hitMonster(monsters,monster){
    monsters[monster].hp-=playerLevel;
    console.log('You hit the '+ monsters[monster].name);

	    if (monsters[monster].hp<=0){

	      killed++;
	      console.log('You killed the '+monsters[monster].name+'!');

               if (monsters[monster].name = "arch lich"){
                   archCounter++;
	       }

	      //remove monster
              monsters.splice(monster, 1);
	    }
}

function drawScreen(){

    console.log();

    //DRAW SCREEN
    let printdungeon = '';
    let dungeonColors = [];

    for (let index = 1; index < dungeon.length - 1; index++){ //loop through all spaces except 0th and last (so player can't see ends)

      //BUILD UP THE DUNGEON STRING
      let currentChar = '';
      let currentColor;

      let monsterPresent = false;
      for (monster in monsters){
         if (monsters[monster].x == index){
	    monsterPresent = true;
            currentChar = monsters[monster].char;
	    currentColor = monsters[monster].color;

	      //if hallucinating
	      if (hallucinate){
		let randNum = Math.floor(Math.random()*57 + 65);
		currentChar = String.fromCharCode(randNum);
		currentColor = "white";
	      }

	   //DEBUG
	      if (debugMode){
		console.log(monsters[monster].char+' on index: '+index);
	      }
	 }
      }

      if (monsterPresent){
	//was set above
      } else if (playerX == index){
	currentChar = '@';
	currentColor = "yellow";
	} 
      else if (goldX == index){
        currentChar = '*';
	currentColor = "green";
	hallucinateItem();
      } else if (potionX == index){
        currentChar = '!';
	currentColor = "magenta";
	hallucinateItem();
      } else if (stairsX == index){
	  if (playerLevel>15){
	    currentChar = '%'; //on last level
	  } else {
	    currentChar = '<';
	  }
	  currentColor = "yellow";
	  hallucinateItem();
      }  else {  //otherwise, nothing's there
        currentChar = '.';
	currentColor = "white";
      }
      
      if (blind&&!(index==playerX)){
	currentChar = ' ';
	currentColor = "white";
      } 


      printdungeon+=currentChar; //string of current dungeon
      dungeonColors.push(currentColor); //array of colors for current dungeon
    }

//USEFUL IN DEBUGGING
    //console.log(dungeon);

       //DEBUG
	  if (debugMode){
	    console.log('playerX: '+playerX);
	    console.log('goldX: '+goldX);
	    console.log('potionX: '+potionX);
	    console.log('stairsX: '+stairsX);
	  }

    console.log()
   //console.log('dungeon.length: '+dungeon.length);
    let castlewall='#';
    for (let i = 0; i < (dungeon.length-1); i++){
       castlewall+='#'
    }
    if (vertical){
      if (!blind){
	if (!hallucinate){
	  console.log(chalk.green.bgBlue.bold('#')+chalk.cyan.bgBlue.bold('~')+chalk.green.bgBlue.bold('#'));
	} else {
	  console.log(chalk.yellow.bgMagenta.bold('#')+chalk.red.bgGreen.bold('~')+chalk.yellow.bgMagenta.bold('#'));
	}
	  for (let i = 0; i < dungeon.length-2; i++){

	      let chalkColor = chalk.keyword(dungeonColors[i])
	     console.log(chalk.green.bgBlue.bold('#')+chalkColor(Array.from(printdungeon)[i])+chalk.green.bgBlue.bold('#'));
	  }
	console.log(chalk.green.bgBlue.bold('#')+chalk.cyan.bgBlue.bold('~')+chalk.green.bgBlue.bold('#'));
      } else { //you're blind! antipattern!
	console.log();
	  for (let i = 0; i < dungeon.length-2; i++){
	    console.log(' '+printdungeon[i]+' ');
	  }
	console.log();
      }
    } else { //horizontal
        if (!blind){
	  //
	  let dungeonString = "";
	  for (let i = 0; i < dungeon.length-2; i++){

	      let chalkColor = chalk.keyword(dungeonColors[i])
	      dungeonString+=chalkColor(Array.from(printdungeon)[i])
	  }
	if (!hallucinate){
	  console.log(chalk.green.bgBlue.bold(castlewall));
	} else {
	  console.log(chalk.yellow.bgRed.bold(castlewall));
	}
	  console.log(chalk.green.bgBlue.bold('[')+dungeonString+chalk.green.bgBlue.bold(']'));
	if (!hallucinate){
	  console.log(chalk.green.bgBlue.bold(castlewall));
	} else {
	  console.log(chalk.yellow.bgRed.bold(castlewall));
	}


	}  else { //you're blind! antipattern!
	   console.log();
	   console.log(printdungeon);
	   console.log();
        }

      }
}

function hallucinateItem(){
    //if hallucinating
    if (hallucinate){
      let randNum = Math.floor(Math.random()*12 + 35);
      currentChar = String.fromCharCode(randNum);
      currentColor = "red";
    }
}

function printStats(){
  levelUp();
  checkGold();
  checkPotions();
  checkHealth();
}

function levelUp(){
  console.log('level: '+playerLevel);
}

function checkPotions(){
  console.log('potions: '+potions);
}

function checkGold(){
  console.log('gold: '+gold);
}

function checkHealth(){
  console.log('hp: '+hp);
  if (hp <= 0){
    end();
  }
}

function checkIfWon(){
  if (playerLevel>16){
    console.log('\033[2J');
    console.log('Congratulations on your success braving the Dim Dungeon!');
    console.log('You are one of the very few adventurers to make it out alive!');
    console.log('Your name will be forever written into the history books!');
    printOutAndQuit();  
  }
}

function checkConduct(){
   if (killed==0){
     conduct="Pacifist";
   } else if (potions>3){
     conduct="Hoarder";
   } else if (gold<1){
     conduct="Pauper";
   } else if (tripCounter>3){
     conduct="Tripper";
   } else if (archCounter>3){
     conduct="ArchLicker";
   } else if (potionsUsed > 5){
     conduct="Drinker";
   } else {
     conduct="Adventurer";
   }
}

function end(){

    //clear screen
    console.log('\033[2J');

    console.log(`
                  _\\<
                 (   >
                 __)(
           _____/  //  ___
          /        \\\\ /  \\\\__
          |  _     //  \     ||
          | | \\    \\\\  / _   ||
          | |  |    \\/  | \\  ||
          | |_/     |/  |  | ||
          | | \\     /|  |_/  ||
          | |  \\    \\|  |     >_ )
          | |   \\. _|\\  |    < _|=
          |          /_.| .  \\/
  *       | *   **  / * **  |\)/)    **
   \\))ejm97/.,(//,,..,,\\||(,wo,\\ ).((//
                             -  \\)`);
      console.log('You died!');
      console.log('You were killed by a '+lastMonster+' on level '+playerLevel);
      checkConduct();
      printOutAndQuit();
}

function printOutAndQuit(){
      console.log('You killed '+killed+' monsters and found '+gold+' gold.');
      console.log('Conduct: '+conduct);
  //write to file
  let score = gold.toString();
  fs.writeFileSync('.lastscore.txt', score, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
});
if (gold>highScore){
  console.log('Congratulations, new high score! '+gold+' gold.');
   fs.writeFileSync('.highscore.txt', score, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
  });
}

      console.log();
      console.log('goodbye');
      process.exit();
}
