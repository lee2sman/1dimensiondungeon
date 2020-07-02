//One dim dungeon 
//by lee2sman 2020
//welcome to my spaghetti code
//
// AGPL-3.0 License 

//globals
const fs = require('fs');
const chalk = require('chalk');

let lastScore, highScore;
let hp=6, playerLevel = 0, gold=0, potions = 0, scrolls = 0, floor = 0, debugMode = false, vertical = false, flipflop = false, blind = false, blindness = 5;
let playerX = 0;
let stairsX, goldX = 0, potionX = 0;
let killed = 0;
let lastMonster = '';
let monsters = [], dungeonStartLength=24;
let monstersList = {'k':'kobold','j':'jackal','b':'bat','r':'rat','m':'monkey','l':'leprechaun','g':'goblin','f':'flick','e':'floating eyeball','h':'hobgoblin','o':'orc','s':'snake','T':'toad','v':'vampire','w':'werewolf','y':'yeti','a':'fire ant','c':'cockatrice','d':'hell dog','i':'ice demon','n':'wood nymph','p':'iron piercer','q':'quagga','t':'trapper','u':'black unicorn','x':'xorn','z':'elf zombie','A':'archon','B':'vampire bat','C':'centaur','D':'pink dragon','E':'air elemental','F':'animated fungus','G':'gnome king','H':'hill giant','I':'imp','J':'pink jelly','K':'Keystone Kop','L':'arch-lich','M':'mummy','N':'naga','O':'ogre','P':'black pudding','Q':'quacker','R':'rust monster','S':'cave spider','U':'ugly worm','V':'vampire','W':'ring wraith','X':'lil xan','Y':'yowler','Z':'zruty'};


class Monster {
 constructor(pos=null) {
   let char = 'kjbrmlgfehosTvwyacdinpqtuxzABCDEFGHIJKLMNOPQRSUVWXYZ';
  
   this.name = char.charAt(Math.floor(Math.random()*(playerLevel*2)));
   this.hp = Math.ceil(Math.random()*(hp/2)) + Math.round(playerLevel/2); 
   this.attack = Math.ceil(Math.random()*(this.hp)); 
   this.aggression = Math.random();

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

function start(){
  //clear screen to start
    console.log('\033[2J');

  checkFlags();
  checkTerminal();

  console.log('Welcome to One Dim Dungeon 1dimensional roguelike');
  console.log('Version 0.1.1');
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
  
  //spawn potion, 30% chance
    if (Math.random()<0.30){
       spawnPotion();
    }

  //spawn monsters 
  spawnMonster();
  spawnMonster();
  spawnMonster();
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
  } while ((potionX == goldX) && (potionX == playerX) && (potionX == stairsX))
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

    let result = Math.random();
    if (result<0.2){
      if (hp<(4*playerLevel)){ //can't increase life above a limit //GOOD
	console.log('You drink a potion of regeneration.');
	hp+=Math.round(Math.random()*playerLevel);
      }
    } else if (result<0.3){ //BAD
      console.log('A cloak of darkness temporarily blinds you'); 
      blind = true;
      blindness = Math.ceil(Math.random()*6+2); //3 to 8 turns
    } else if (result<0.5){//increase health, no limit! 6 is a magic number
	console.log('You drink a health potion'); //GOOD
	hp+=Math.round(Math.random()*(playerLevel/2)+6); 
    } else if (result<0.6){
       console.log('You were poisoned!');
       hp-=Math.round(Math.random()*playerLevel);
    } else if (result<0.8){
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
            console.log('The '+monstersList[monsters[monster].name]+ ' hit you!');
	    lastMonster=monsters[monster].name; //save monster's for stats output
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
            console.log('The '+monstersList[monsters[monster].name]+ ' hit you!');
	    lastMonster=monsters[monster].name;
	    //player loses some hp
	    hp-=monsters[monster].attack;
	  }

      }

    }
  }
}

function hitMonster(monsters,monster){
    monsters[monster].hp-=playerLevel;
    console.log('You hit the '+ monstersList[monsters[monster].name]);

	    if (monsters[monster].hp<=0){

	      killed++;
	      console.log('You killed the '+monstersList[monsters[monster].name]+'!');
	      //remove monster
              monsters.splice(monster, 1);
	    }
}

function drawScreen(){

    console.log();

    //DRAW SCREEN
    let printdungeon = '';

    for (let index = 1; index < dungeon.length - 1; index++){ //loop through all spaces except 0th and last (so player can't see ends)

      //BUILD UP THE DUNGEON STRING
      let currentChar = '';

      let monsterPresent = false;
      for (monster in monsters){
         if (monsters[monster].x == index){
	    monsterPresent = true;
            currentChar = monsters[monster].name;
	   //DEBUG
	      if (debugMode){
		console.log(monsters[monster].name +': '+index);
	      }
	 }
      }

      if (monsterPresent){
	//was set above
      } else if (playerX == index){
	currentChar = '@';
	} 
      else if (goldX == index){
        currentChar = '*';
      } else if (potionX == index){
        currentChar = '!';
      } else if (stairsX == index){
	  if (playerLevel>15){
	    currentChar = '%'; //on last level
	  } else {
	    currentChar = '<';
	  }
      }  else {  //otherwise, nothing's there
        currentChar = '.';
      }
      
      if (blind&&!(index==playerX)){currentChar = ' ';} 

      printdungeon+=currentChar;
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
	console.log(chalk.green.bgBlue.bold('#')+chalk.cyan.bgBlue.bold('~')+chalk.green.bgBlue.bold('#'));
	  for (let i = 0; i < dungeon.length-2; i++){
	   console.log(chalk.green.bgBlue.bold('#')+chalk.gray.bgMagenta(Array.from(printdungeon)[i])+chalk.green.bgBlue.bold('#'));
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
	  console.log(chalk.green.bgBlue.bold(castlewall));
	  console.log(chalk.cyan.bgBlue.bold('[')+chalk.gray.bgMagenta(printdungeon)+chalk.green.bgBlue.bold(']'));
	  console.log(chalk.green.bgBlue.bold(castlewall));
	}  else { //you're blind! antipattern!
	   console.log();
	   console.log(printdungeon);
	   console.log();
        }

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
      console.log('You were killed by a '+monstersList[lastMonster]+' on level '+playerLevel);
      printOutAndQuit();
}

function printOutAndQuit(){
      console.log('You killed '+killed+' monsters and found '+gold+' gold.');
  //write to file
  let score = gold;
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
