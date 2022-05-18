const PLAYER = 'player';
const OBSTACLE = 'obstacle';
const OVERHEAD = 'overhead';
const COIN = 'coin';

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 5;
const SPEED = 2;

const INITIAL_GAME_STATE = {
	playerZDistance: 0,
	playerColumn: MIDDLE,
	timeElapsed: 0,
	duck: false,
};

const objects = [
	{
		type: COIN,
		z: -2,
		column: LEFT,
	},
	{
		type: OBSTACLE,
		z: -4,
		column: RIGHT,
	},
	{
		type: COIN,
		z: -8,
		column: LEFT,
	},
	{
		type: OBSTACLE,
		z: -14,
		column: RIGHT,
	},
	{
		type: COIN,
		z: -20,
		column: LEFT,
	},
	{
		type: OBSTACLE,
		z: -24,
		column: RIGHT,
	},
	{
		type: COIN,
		z: -28,
		column: LEFT,
	},
	{
		type: OVERHEAD,
		z: -42,
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
