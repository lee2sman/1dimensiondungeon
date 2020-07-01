# One Dimension Dungeon

by lee2sman 2020

![1 dim dungeon](1dimdungeon.gif)  

### Dependencies

- node.js
- chalk package (for color)

## To install

Download (or clone) and run ```npm install``` to install chalk via npm 

## To launch

```
node game.js
```

To launch with debug mode on:

```node game.js --debug``` OR ```node game.js -d```

To launch with vertical orientation:

```node game.js --vertical``` OR ```node game.js -v```

To launch game in flip-flop mode (orientation switches every level):

```node game.js --flip-flop``` OR ```node game.js -f```

## Controls

```
Motion:    ARROW KEYS or Vim-keys
           space or . to rest one turn

Commands:

(?)        help (this menu)
(<)        descend stairs/retrieve amulet
(q) or (p) quaff potion
(d)        debug mode toggle on/off
(v         toggle horizontal/vertical orientation
(Q)        Quit
```

## Goal

Collect gold. Descend 16 levels through the dungeon and retrieve the amulet of Yendor. Avoid getting killed.

## Potions

#### Good 
- Regeneration 
- Health potion
- Potion of luck

#### Bad 
- Cloak of darkness 
- Poison
- Summon demon

#### Who knows?
- Dissolving dust

## About 

I hacked together the original (buggy) version in a day, then took a few days to add features, refactor, and track down annoying bugs. There may still be more!

You can now also change the orientation!

**Read much more about it (and other 1-dimensional roguelikes and dungeon crawlers) on my Nosebook blog [here](http://leetusman.com/nosebook/one-dimensional-dungeons).**

## Roadmap

Yes, I have ideas on further ways to expand gameplay!

See [ROADMAP](ROADMAP.md)

### License

Copyleft GNU Affero General Public License v3 (AGPL-3.0).
