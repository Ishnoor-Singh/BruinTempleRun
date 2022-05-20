const PLAYER = "player";
const OBSTACLE = "obstacle";
const OVERHEAD = "overhead";
const COIN = "coin";

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 5;
const SPEED = 8;

const INITIAL_GAME_STATE = {
  playerZDistance: 0,
  playerColumn: MIDDLE,
  timeElapsed: 0,
  duck: false,
};

const objects = [
  //Straight Coin Path
  {
    type: COIN,
    z: -5,
    column: MIDDLE,
  },
  {
    type: COIN,
    z: -10,
    column: MIDDLE,
  },
  {
    type: COIN,
    z: -15,
    column: MIDDLE,
  },
  //Left Coin with Double Obstacle
  {
    type: COIN,
    z: -25,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -30,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -30,
    column: MIDDLE,
  },
  //Right Coin with Double Obstacle
  {
    type: COIN,
    z: -45,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -45,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -45,
    column: MIDDLE,
  },
  //Middle Coin with Double Obstacle
  {
    type: COIN,
    z: -60,
    column: MIDDLE,
  },
  {
    type: OBSTACLE,
    z: -60,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -60,
    column: RIGHT,
  },
  //All Overhead with Middle Coin
  {
    type: OVERHEAD,
    z: -75,
    column: MIDDLE,
  },
  {
    type: OVERHEAD,
    z: -75,
    column: LEFT,
  },
  {
    type: OVERHEAD,
    z: -75,
    column: RIGHT,
  },
  {
    type: COIN,
    z: -75,
    column: MIDDLE,
  },
  //Double Coin with Middle Obstacle
  {
    type: COIN,
    z: -90,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -90,
    column: LEFT,
  },
  {
    type: COIN,
    z: -90,
    column: MIDDLE,
  },
  //Left Overhead + Coin with Double Obstacle
  {
    type: OVERHEAD,
    z: -105,
    column: LEFT,
  },
  {
    type: COIN,
    z: -105,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -105,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -105,
    column: MIDDLE,
  },
  //Middle Coin with Double Obstacle
  {
    type: COIN,
    z: -120,
    column: MIDDLE,
  },
  {
    type: OBSTACLE,
    z: -120,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -120,
    column: LEFT,
  },
  //Left Coin with Double Obstacle
  {
    type: COIN,
    z: -135,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -135,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -135,
    column: MIDDLE,
  },
  //Right Coin with Double Obstacle, Left Coin with Overhead
  {
    type: COIN,
    z: -150,
    column: RIGHT,
  },
  {
    type: OVERHEAD,
    z: -150,
    column: LEFT,
  },
  {
    type: COIN,
    z: -150,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -150,
    column: MIDDLE,
  },
  //Right Coin with Double Obstacle
  {
    type: COIN,
    z: -165,
    column: RIGHT,
  },
  {
    type: OBSTACLE,
    z: -165,
    column: LEFT,
  },
  {
    type: OBSTACLE,
    z: -165,
    column: MIDDLE,
  },
  //Zig Zag Coin Path
  {
    type: COIN,
    z: -170,
    column: RIGHT,
  },
  {
    type: COIN,
    z: -175,
    column: MIDDLE,
  },
  {
    type: COIN,
    z: -180,
    column: LEFT,
  },
  {
    type: COIN,
    z: -185,
    column: MIDDLE,
  },
  //Overhead with All Coins
  {
    type: OVERHEAD,
    z: -200,
    column: MIDDLE,
  },
  {
    type: OVERHEAD,
    z: -200,
    column: LEFT,
  },
  {
    type: OVERHEAD,
    z: -200,
    column: RIGHT,
  },
  {
    type: COIN,
    z: -200,
    column: MIDDLE,
  },
  {
    type: COIN,
    z: -200,
    column: LEFT,
  },
  {
    type: COIN,
    z: -200,
    column: RIGHT,
  },
];

export class BruinTempleRun {
  constructor() {
    this.setStateToInitial();
    this.path = new StraightLinePath(objects);
    this.paused = true;
    this.speed = SPEED;
  }

  setStateToInitial() {
    this.state = { ...INITIAL_GAME_STATE };
  }

  addTime(deltaTime) {
    this.state.timeElapsed += deltaTime;
    this.state.playerZDistance = -1 * this.speed * this.state.timeElapsed;
  }

  movePlayerLeft() {
    if (!this.paused) {
      if (this.state.playerColumn === RIGHT) {
        this.state.playerColumn = MIDDLE;
        return true;
      } else if (this.state.playerColumn === MIDDLE) {
        this.state.playerColumn = LEFT;
        return true;
      } else {
        return false;
      }
    }
  }

  movePlayerRight() {
    if (!this.paused) {
      if (this.state.playerColumn === LEFT) {
        this.state.playerColumn = MIDDLE;
        return true;
      } else if (this.state.playerColumn === MIDDLE) {
        this.state.playerColumn = RIGHT;
        return true;
      } else {
        return false;
      }
    }
  }

  pauseGame() {
    this.paused = !this.paused;
  }

  restartGame() {
    if (!this.paused) {
      this.setStateToInitial();
    }
  }

  getPlayerColumn() {
    return this.state.playerColumn;
  }

  getPlayerZDistance() {
    return this.state.playerZDistance;
  }

  getObjects() {
    return this.path.objects;
  }

  isGamePaused() {
    return this.paused;
  }

  toggleDuck() {
    this.state.duck = !this.state.duck;
  }

  isDucking() {
    return this.state.duck;
  }
}

class StraightLinePath {
  constructor(objects) {
    this.objects = objects;
  }
}
