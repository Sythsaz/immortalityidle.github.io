import { Component, OnInit } from '@angular/core';
import { ActivityLoopEntry } from '../game-state/activity';
import { Character } from '../game-state/character';
import { GameStateService } from '../game-state/game-state.service';
import { Home } from '../game-state/home';
import { MainLoopService } from '../main-loop.service';

@Component({
  selector: 'app-time-panel',
  templateUrl: './time-panel.component.html',
  styleUrls: ['./time-panel.component.less']
})
export class TimePanelComponent implements OnInit {
  character: Character;
  home: Home;

  currentLoopEntry?: ActivityLoopEntry = undefined;
  currentIndex = 0;
  currentTickCount = 0;
  loopEntries: ActivityLoopEntry[];

  constructor(
    private mainLoopService: MainLoopService,
    gameStateService: GameStateService
  ) {
    this.loopEntries = gameStateService.gameState.activityLoop;
    this.character = gameStateService.gameState.characterState;
    this.home = gameStateService.gameState.home;
  }

  ngOnInit(): void {
    this.mainLoopService.tickSubject.subscribe(
      (next) => {
        if (this.loopEntries.length > 0) {
          this.currentLoopEntry = this.loopEntries[this.currentIndex];
          this.currentLoopEntry.activity.consequence();
          this.home.consequence();
          this.character.age++;
          console.log("You spend the day doing " + this.currentLoopEntry.activity.name);
          // check for death
          if (this.character.status.health.value <= 0 || this.character.age >= this.character.lifespan){
            console.log("You have failed to achieve immortality and your life has ended. Don't worry, I'm sure you'll achieve immortality in your next life.");
            //TODO: call reincarnation function
          }
          // check for exhaustion
          if (this.character.status.stamina.value < 0){
            // take 5 days to recover, regain stamina, restart loop
            console.log("You collapse to the ground, completely exhausted. It takes you 5 days to recover enough to work again.");
            this.character.age += 5;
            this.character.status.stamina.value = this.character.status.stamina.max;
            this.currentTickCount = 0;
            this.currentIndex = 0;
          }
          if (this.currentTickCount < this.currentLoopEntry.repeatTimes - 1) {
            this.currentTickCount++;
          } else {
            this.currentIndex++;
            this.currentTickCount = 0;
            if (this.currentIndex == this.loopEntries.length) {
              this.currentIndex = 0;
            }
          }
        }
      }
    )
  }

  onPlusClick(entry: ActivityLoopEntry): void{
    entry.repeatTimes++;
  }

  onMinusClick(entry: ActivityLoopEntry): void{
    entry.repeatTimes--;
  }

  onUpClick(entry: ActivityLoopEntry): void{
    let index = this.loopEntries.indexOf(entry);
    if (index != 0 && this.loopEntries.length > 1){
      let swapper = this.loopEntries[index - 1];
      this.loopEntries[index - 1] = entry;
      this.loopEntries[index] = swapper;
    }
  }

  onDownClick(entry: ActivityLoopEntry): void{
    let index = this.loopEntries.indexOf(entry);
    if (index != this.loopEntries.length - 1 && this.loopEntries.length > 1){
      let swapper = this.loopEntries[index + 1];
      this.loopEntries[index + 1] = entry;
      this.loopEntries[index] = swapper;
    }
  }

  onRemoveClick(entry: ActivityLoopEntry): void{
    let index = this.loopEntries.indexOf(entry);
    // make sure we're not running past the end of the entries array
    if (this.currentIndex >= this.loopEntries.length - 1){
      this.currentIndex = 0;
    }
    this.loopEntries.splice(index,1);
  }

}
