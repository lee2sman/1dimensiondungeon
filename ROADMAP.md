# Roadmap

## To implement
- None currently. Accomplished all my goals. Likely only further work would be refactoring of code and balancing mechanics of monsters. 

## Added
- [X] stairs
- [X] scrolling!  (note: currently eliminated when concept of stairs was added. see earlier git tag 'dungeon-scrolling' for previous sample code)
- [X] potions 
  - [X] teleport
  - [X] get sick ('You were poisoned' and decrease player hp)
  - [X] cloak of darkness - cannot see actual board, they are rendered as empty spaces - would need clock feature
  - [X] spawn a random enemy
  - [X] agitate monsters (increase their aggression)
  - [X] dissolving spell. fall through floor
- [X] implement monster dictionary (json) so they have preset character differences
  - [X] special monsters abilities
  - [X] monsters have specified attack and ```hp``` set at spawn rather than randomly rolled 
  - [X] monsters have specific colors
- [X] vertical orientation option
- [X] better core mechanics
- [X] number of monsters spawned on dungeonreset tied to level so difficulty increases? (something like + ceil(level/4))
- [X] varied enemy behaviors including attacks, 'hallucination' (like toads in Brogue) - would need clock feature, generating minions, freezing, etc
  - [X] simple clock timeout feature
- [X] choose different font, use color (background and on font)
- [X] Add conduct

## Under consideration
- [ ] game also output graphically - tiles and/or also runs on web
- [ ] pink poison slime (or gelatinous cube) - you can stand on it (like potion or gold) but it reduces hp - potentially it expands

### Further iterations

I think I may later use this as a basis of creating a walking game with generative conversations with characters the player comes across instead of or in addition to the hack and slash approach...

Also currently planning a hardware port using a fork of this codebase.
