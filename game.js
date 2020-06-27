//One dim dungeon 
//by lee2sman 2020
//
// Copyleft: This is a free work, you can copy, distribute, and modify it under the terms of the Free Art License http://artlibre.org/licence/lal/en/

//globals
const fs = require('fs');

let hp=8, playerLevel = 1, gold=0, potions = 0, scrolls = 0, floor = 0, debugMode = false;
let dungeon = ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'];
let playerX = 0;
let killed = 0;
let lastMonster = '';
let monsters = [];
let monstersList = {'k':'kobold','j':'jackal','b':'bat','r':'rat','m':'monkey','l':'leprechaun','g':'goblin','f':'flick','e':'floating eyeball','h':'hobgoblin','o':'orc','s':'snake','T':'toad','v':'vampire','w':'werewolf','y':'yeti','a':'fire ant','c':'cockatrice','d':'hell dog','i':'ice demon','n':'wood nymph','p':'iron piercer','q':'quagga','t':'trapper','u':'black unicorn','x':'xorn','z':'elf zombie','A':'archon','B':'vampire bat','C':'centaur','D':'pink dragon','E':'air elemental','F':'animated fungus','G':'gnome king','H':'hill giant','I':'imp','J':'pink jelly','K':'Keystone Kop','L':'arch-lich','M':'mummy','N':'naga','O':'ogre','P':'black pudding','Q':'quacker','R':'rust monster','S':'cave spider','U':'ugly worm','V':'vampire','W':'ring wraith','X':'lil xan','Y':'yowler','Z':'zruty'};

start();
main();


function start(){
  console.log('Welcome to One Dim Dungeon 1dimensional roguelike');
  console.log();
  console.log('Last score:');
  const lastHighScore = fs.readFileSync('highscore.txt', 'utf8');
  console.log(lastHighScore);

  resetDungeon();
}

function resetDungeon(){
  monsters = [];
  dungeon = ['.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'];
  dungeon[playerX] = '@'
}

function main(){
  const readline = require('readline');
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {

    //clear screen
    console.log('\033[2J');

    increaseHealth();

    checkKeys(str, key);

    moveMonsters();

    if (Math.random()<0.02){
       //spawn gold
       spawnGold();
    }

    if (Math.random()<0.10){ //10% chance of spawn a monster each move
      spawnMonster();
    }
    
    checkHealth();

    levelUp();

    drawScreen();

  });
  console.log('Press any key...');
}

function checkKeys(str, key){
   if (key.ctrl && key.name === 'c') {
      end();
    } else if ((key.name === 'left' || key.name === 'h') && playerX > 0){

          let monsterPresence = false;
	  for (monster in monsters){
             if (monsters[monster].x == (playerX-1)){
	        monsterPresence = true;
                hitMonster(monsters,monster);
	     }
      
	  }

        if (dungeon[playerX-1] == '*'){
	   tempGold = Math.ceil(Math.random()*20);
	   console.log('You found '+tempGold+' gold.');
	   gold+=tempGold;
	}

	if (!(monsterPresence)){ //no monster there
	    dungeon[playerX] = '.';
	    playerX--;
	    dungeon[playerX] = '@';
	}
          
    } else if ((key.name === 'right' || key.name === 'l') && playerX < dungeon.length-1){

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

    } else if ((key.sequence === '.') || (key.name === 'space')){

    } else if (key.name === 'q' && potions > 0){

    } else if (key.name === 'r'){

    } else if (key.name === 'i'){

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

function help(str, key){
  console.log('potions: '+potions+' scrolls: '+scrolls+' killed: '+killed);
      console.log();
      console.log('Motion: LEFT        REST       RIGHT');
      console.log();
      console.log('        h OR ← | . OR (space) | r OR → ');
      console.log();
      console.log('Commands:');
      console.log();
      console.log('(?) help (this menu)');
      console.log('(i) inventory');
      console.log('(q) quaff');
      console.log('(r) read scroll');
      console.log('(d) debug mode toggle on/off');
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
  if (Math.random()<0.25){ //25% chance of player's life increasing
    if (hp<(8*playerLevel)){ //can't increase life above a limit
      hp+=Math.round(Math.random()*playerLevel)
    }
  }
}

function spawnMonster(){
      if ((dungeon[0].toLowerCase() == dungeon[0].toUpperCase()) || (dungeon[dungeon.length-1].toLowerCase() == dungeon[dungeon.length-1].toUpperCase())) { //is there room for a monster to spawn on left or right?
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
	    hitMonster(monsters, monster);

	  } else if (monsters[monster].x>(playerX+1)){
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
	    hitMonster(monsters, monster);
	  }

      }

    }
}

function hitMonster(monsters,monster){
    monsters[monster].hp-=playerLevel;

	    if (monsters[monster].hp<=0){
	      dungeon[monsters[monster].x] = '.';
	      killed++;
	      //remove monster
              monsters.splice(monster, 1);
	    }
}

function drawScreen(){

    //DRAW SCREEN
    var printdungeon = ''

    for (var index in dungeon){ //loop through all spaces

      if (dungeon[index] == '.'){ //there's nothing there
	  printdungeon+='.'; //so add a dot
      } 

      if (dungeon[index] == '*'){
          printdungeon+='*';
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
   playerLevel = Math.floor(killed/7+1);
}

function checkHealth(){
  console.log('hp: '+hp);
  if (hp <= 0){
    end();
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
      console.log('You killed: '+killed+' monsters and found '+gold+' gold.');
  //write to file
  //
  let score = 'Level: '+playerLevel+' Killed: '+killed+' Gold: '+gold;
  fs.writeFileSync('highscore.txt', score, (err) => {
    // throws an error, you could also catch it here
    if (err) throw err;
});
      console.log();
      console.log('goodbye');
      process.exit();
}


class Monster {
 constructor() {
   let char = 'kjbrmlgfehosTvwyacdinpqtuxzABCDEFGHIJKLMNOPQRSUVWXYZ';
  
   this.name = char.charAt(Math.floor(Math.random()*(playerLevel*2)));
   this.hp = Math.ceil(Math.random()*hp); 
   this.attack = Math.ceil(Math.random()*(this.hp/3)); //attack is based on monster's hp
   this.aggression = Math.random();

//choose x location
   if ((dungeon[0].toLowerCase() == dungeon[0].toUpperCase()) && (dungeon[dungeon.length-1].toLowerCase() == dungeon[dungeon.length-1].toUpperCase())) { //there is no monster on left AND no monster on right
       if (Math.random()<0.5){
           this.x = 0; //spawn on left
       } else {
           this.x = dungeon.length - 1; //spawn on right
       }
   } else if (dungeon[0].toLowerCase() == dungeon[0].toUpperCase()) { //there is room for monster on left
          this.x = 0; //spawn on left
   } else {   //otherwise there is room for monster on right
          this.x = dungeon.length - 1;
   }

   //put monster in dungeon in position
    dungeon[this.x] = this.name;

 }

}
