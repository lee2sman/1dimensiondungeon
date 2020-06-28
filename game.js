//One dim dungeon 
//by lee2sman 2020
//
// Copyleft: This is a free work, you can copy, distribute, and modify it under the terms of the Free Art License http://artlibre.org/licence/lal/en/

//globals
const fs = require('fs');

let hp=4, playerLevel = 0, gold=0, potions = 0, scrolls = 0, floor = 0, debugMode = false;
let playerX = 0;
let stairsX;
let killed = 0;
let lastMonster = '';
let monsters = [], dungeon = [], dungeonStartLength=24;
let monstersList = {'k':'kobold','j':'jackal','b':'bat','r':'rat','m':'monkey','l':'leprechaun','g':'goblin','f':'flick','e':'floating eyeball','h':'hobgoblin','o':'orc','s':'snake','T':'toad','v':'vampire','w':'werewolf','y':'yeti','a':'fire ant','c':'cockatrice','d':'hell dog','i':'ice demon','n':'wood nymph','p':'iron piercer','q':'quagga','t':'trapper','u':'black unicorn','x':'xorn','z':'elf zombie','A':'archon','B':'vampire bat','C':'centaur','D':'pink dragon','E':'air elemental','F':'animated fungus','G':'gnome king','H':'hill giant','I':'imp','J':'pink jelly','K':'Keystone Kop','L':'arch-lich','M':'mummy','N':'naga','O':'ogre','P':'black pudding','Q':'quacker','R':'rust monster','S':'cave spider','U':'ugly worm','V':'vampire','W':'ring wraith','X':'lil xan','Y':'yowler','Z':'zruty'};


class Monster {
 constructor() {
   let char = 'kjbrmlgfehosTvwyacdinpqtuxzABCDEFGHIJKLMNOPQRSUVWXYZ';
  
   this.name = char.charAt(Math.floor(Math.random()*(playerLevel*2)));
   this.hp = Math.ceil(Math.random()*hp); 
   this.attack = Math.ceil(Math.random()*(this.hp)); //attack is based on monster's hp
   this.aggression = Math.random();

//choose x location
       if ((dungeon[dungeon.length-1] !== '@' && dungeon[0] !== '@') && (dungeon[dungeon.length-1].toLowerCase() !== dungeon[dungeon.length-1].toUpperCase()) && (dungeon[0].toLowerCase() !== dungeon[0].toUpperCase())    ){//edges are free, so can spawn anywhere
	if (Math.random()<0.5){this.x = 0;} else {this.x = dungeon.length-1;}
       }
   else if (dungeon[dungeon.length-1] == '@' || (dungeon[dungeon.length-1].toLowerCase() !== dungeon[dungeon.length-1].toUpperCase())  ){ //check to see if player or a monster on right
           this.x = 0; //spawn on left
       }
     else {
           this.x = dungeon.length - 1; //spawn on right
     }


   //put monster in dungeon in position
    dungeon[this.x] = this.name;

 }

}


start();
main();


function start(){
  //clear screen to start
    console.log('\033[2J');

  console.log('Welcome to One Dim Dungeon 1dimensional roguelike');
  console.log();
  console.log('Last score:');
  const lastHighScore = fs.readFileSync('.highscore.txt', 'utf8');
  console.log(lastHighScore);

  resetDungeon();
}

function resetDungeon(){
  playerLevel++;
  monsters = [];
  dungeon = [];
  //
  dungeonStartLength = Math.ceil(Math.random()*20)+6; //dungeons are 6 - 26 in length

  for (let i = 0; i < dungeonStartLength; i++){
    dungeon.push('.');
  }

  //spawn gold potentially, 25% chance
    if (Math.random()<0.25){
       //spawn gold
       spawnGold();
    }

  spawnStairs();

  //spawn 2 monsters
  spawnMonster();
  spawnMonster();

  //place player
  playerX = Math.ceil(Math.random()*(dungeon.length-1))
  dungeon[playerX] = '@';
}


function spawnStairs(){
  do {
    stairsX = Math.ceil(Math.random()*(dungeon.length-2))
  }
  while (stairsX === playerX);

  if (playerLevel < 16){
    dungeon[stairsX] = '<';
  } else {
    dungeon[stairsX] = '%'; //spawn amulet, retrieve to leave!
  }
}

function main(){
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {

    //clear screen
    console.log('\033[2J');

    increaseHealth();

    //redraw stairs
    if (playerLevel < 16){
      dungeon[stairsX]='<';
    } else {
      dungeon[stairsX]='%';
    }

    //redraw goldX?

    checkKeys(str, key);

    moveMonsters();

    if (Math.random()<0.30){ //30% chance of spawn a monster each move
      spawnMonster();
    }
    
    checkHealth();

    levelUp();

    drawScreen();

    checkIfWon();

  });
  console.log('Press any key...');
  console.log('(?) for help');
}

function checkKeys(str, key){
   if (key.ctrl && key.name === 'c') {
      end();

     //MOVE LEFT SECTION / IF you are not on left-most visible square
    } else if ((key.name === 'left' || key.name === 'h') && playerX > 1){

          let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX-1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }

        if (dungeon[playerX-1] == '*'){
	   tempGold = Math.ceil(Math.random()*(10*playerLevel));
	   console.log('You found '+tempGold+' gold.');
	   gold+=tempGold;
	}


	if (!(monsterPresence)){ //no monster there
	    dungeon[playerX] = '.';
	    playerX--;
	    dungeon[playerX] = '@';
	}
          
    } else if ((key.name === 'left' || key.name === 'h') && playerX == 1){
   //player on left most visible space wants to move left. move whole board to left

      let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX-1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }


         for (monster in monsters){ //loop through all monsters to see if they were on right
	     if (monsters[monster].x == dungeon.length-1){ //if it was on right, remove it from monsters array
	       monsters.splice(monster,1);
	     } else { //otherwise, change its saved x position
	       monsters[monster].x++;
	     }
	  }

      //PLAYER IS AT FAR LEFT and wants to move left
	if (!(monsterPresence)){ //no monster there
	  dungeon[playerX] = '.'; //replace player current space with blank
          dungeon[playerX-1] = '@'; //move player left one space
	  dungeon.unshift('.'); //add space to beginning of array
	  dungeon.splice(-1,1); //rm last dungeon space from end
	}

      //MOVE RIGHT IF you are not on the most right visible space
    } else if ((key.name === 'right' || key.name === 'l') && playerX < dungeon.length-2){
      let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX+1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }

        if (dungeon[playerX+1] == '*'){
	   tempGold = Math.ceil(Math.random()*20);
	   console.log('You found '+tempGold+' gold.');
	   gold+=tempGold;
	}


	if (!(monsterPresence)){ //no monster there
          dungeon[playerX] = '.';
          playerX++;
          dungeon[playerX] = '@';
	}

    } else if ((key.name === 'right' || key.name === 'l') && (playerX == dungeon.length-2)){

         for (monster in monsters){ //loop through all monsters to see if they were on left
	     if (monsters[monster].x == 0){ //if it was on left, remove it from monsters array
	       monsters.splice(monster,1);
	     } else { //otherwise, change its saved x position
	       monsters[monster].x--;
	     }
	  }

      let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX+1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
	  }


      //PLAYER IS AT FAR RIGHT and wants to move right
      //
      //TODO: CHECK IF MONSTER IS TO THE RIGHT BEFORE MOVING ASWELL
	if (!(monsterPresence)){ //no monster there
	  dungeon[playerX] = '.'; //replace player current space with blank
	  dungeon[playerX+1] = '@'; //move player right a space
	  dungeon.push('.'); //add space to end
	  dungeon.splice(0,1); //rm 0th dungeon space from left
	}
	           
   } else if ((key.sequence === '.') || (key.name === 'space')){

    } else if (key.name === 'q' && potions > 0){

    } else if (key.sequence === 'Q'){ //quit
      end();
    } else if (key.name === 'r'){

    } else if (key.sequence === '<'){
      if (playerX == stairsX){
        //add some hp when you descend
        hp+=Math.round(Math.random()*(playerLevel/4))
        //draw new floor
        resetDungeon();
      }
    } else if (key.name === 'i'){
       inventory();
    } else if (key.name === 'd'){
      debugMode=!debugMode;
      if (debugMode){
        console.log('debug mode is on');
      } else {
        console.log('debug mode is off');
      }
    } else if (key.sequence === '?'){
       help(str, key);

    } else {
      //
      console.log('not a command');
      console.log();
      help(str, key);
        }
}

function inventory(){
  console.log('potions: '+potions+' scrolls: '+scrolls+' gold: '+gold);
  console.log();
}

function help(str, key){
      console.log('Motion: LEFT        REST       RIGHT');
      console.log();
      console.log('        h OR ← | . OR (space) | r OR → ');
      console.log();
      console.log('Commands:');
      console.log();
      console.log('(?) help (this menu)');
      console.log('(<) descend stairs (or retrieve amulet)');
      //console.log('(i) inventory');
      //console.log('(q) quaff');
      //console.log('(r) read scroll');
      console.log('(d) debug mode toggle on/off');
      console.log('(Q) Quit');
  //USEFUL FOR DEBUGGING
  if (debugMode){
      console.log(key);

      console.log(`You pressed the "${str}" key`);
    }

}

function spawnGold(){
  goldX = Math.floor(Math.random()*dungeon.length);
  dungeon[goldX] = '*';
}

function increaseHealth(){
  //regeneration
  if (Math.random()<0.2){ //20% chance of player's life increasing
    if (hp<(4*playerLevel)){ //can't increase life above a limit
      hp+=Math.round(Math.random()*playerLevel)
    }
  }
}

function spawnMonster(){
      if ((dungeon[0].toLowerCase() == dungeon[0].toUpperCase()) || (dungeon[dungeon.length-1].toLowerCase() == dungeon[dungeon.length-1].toUpperCase()) && (dungeon[0] !== '@' || dungeon[dungeon.length-1] !== '@')) { //is there room for a monster to spawn on left or right?
	//spawn monster
	monster = new Monster();
	monsters.push(monster);
	if (debugMode){
	  console.log('created a monster!');
	  console.log(monsters);
	}
      }

}

function moveMonsters(){
    for (var monster in monsters){
      if (Math.random()<monsters[monster].aggression){ //is monster provoked?
	if (debugMode){
          console.log(monsters[monster].name+' is angry!');
	}

	  if (monsters[monster].x<(playerX-1)){ //if monster to left and more than 1 away
	    dungeon[monsters[monster].x] = '.';
	    monsters[monster].x++;
	    dungeon[monsters[monster].x] = monsters[monster].name;
	  } else if (monsters[monster].x == (playerX-1)){
            console.log('The '+monstersList[monsters[monster].name]+ ' hit you!');
	    lastMonster=monsters[monster].name;
	    //player loses some hp
	    hp-=monsters[monster].attack;
	    //console.log('player hp: '+hp);
	    //monster loses some hp
	    //hitMonster(monsters, monster);

	  } else if (monsters[monster].x>(playerX+1)){ //if monster more than 1 space away to right
	     dungeon[monsters[monster].x] = '.';
             monsters[monster].x--;
	     dungeon[monsters[monster].x] = monsters[monster].name;
	  } else if (monsters[monster].x == playerX+1){
            console.log('The '+monstersList[monsters[monster].name]+ ' hit you!');
	    lastMonster=monsters[monster].name;
	    //player loses some hp
	    hp-=monsters[monster].attack;
	    //console.log('player hp: '+hp);
	    //monster loses some hp
	    //hitMonster(monsters, monster);
	  }

      }

    }
}

function hitMonster(monsters,monster){
    monsters[monster].hp-=playerLevel;
    console.log('You hit the '+ monstersList[monsters[monster].name]);

	    if (monsters[monster].hp<=0){
	      dungeon[monsters[monster].x] = '.';
	      killed++;
	      console.log('You killed the '+monstersList[monsters[monster].name]+'!');
	      //remove monster
              monsters.splice(monster, 1);
	    }
}

function drawScreen(){

    //DRAW SCREEN
    var printdungeon = ''

    //for (var index in dungeon){ //loop through all spaces
    for (let index = 1; index < dungeon.length - 1; index++){ //loop through all spaces except 0th and last (so player can't see ends)

      if (dungeon[index] == '.'){ //there's nothing there
	  printdungeon+='.'; //so add a dot
      } 

      if (dungeon[index] == '*'){
          printdungeon+='*';
      }

      if (dungeon[index] == '<'){
          printdungeon+='<';
      }
      if (dungeon[index] == '%'){
          printdungeon+='%';
      }

      for (var monster in monsters){ //loop through monsters in array
            if (monsters[monster].x == index){ //if monster is at that position
               printdungeon+=monsters[monster].name; //add it there
	    }
      }

      if (playerX == index){
	if (hp>0){
	  printdungeon+='@';
	} else {
          printdungeon+='⚰️';
	}
      }
    }

    //print it out
  //USEFUL IN DEBUGGING
    //console.log(dungeon);
    //console.log('dungeon: ');
    
    //print floor
    console.log('floor: '+floor);
    console.log()

    console.log(printdungeon);
 
}

function levelUp(){
  console.log('level: '+playerLevel);
   //playerLevel = Math.floor(killed/7+1);
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
    console.log('You are one of the very few adventures to make it out alive!');
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
      console.log('You killed '+killed+' monsters, '+hp+'hp and found '+gold+' gold.');
  //write to file
  //
  let score = 'Level: '+playerLevel+' Killed: '+killed+' Gold: '+gold;
  fs.writeFileSync('.highscore.txt', score, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
});
      console.log();
      console.log('goodbye');
      process.exit();

}


