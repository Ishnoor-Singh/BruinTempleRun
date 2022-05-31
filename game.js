import { tiny } from './examples/common.js';
const { Mat4 } = tiny;

const PLAYER = 'player';
const OBSTACLE = 'obstacle';
const OVERHEAD = 'overhead';
const COIN = 'coin';

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 6;
const SPEED = 15;

const INITIAL_GAME_STATE = {
	playerZDistance: 0,
	playerColumn: MIDDLE,
	timeElapsed: 0,
	duck: false,
	direction: NEG_X,
	playerCoords: [-12, 0, -212],
	// direction: NEG_Z,
	// playerCoords: [0, 0, 0],
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
		const p = [
			new StraightLinePath([], 100, NEG_Z),
			new Turn(NEG_Z, LEFT),
			new StraightLinePath(objects, 100, NEG_X),
			// new StraightLinePath(objects, 100, NEG_Z, [0, 0, 0]),
			// new Turn(RIGHT, [0, 0, 0]),
			// new StraightLinePath(objects, 100, NEG_X),
		];
		const paths = new Paths(p);
		this.paths = paths.getPaths();
		this.paused = true;
		this.speed = SPEED;
		this.gameStarted = true;
		this.gameEnded = false;
	}

	setStateToInitial() {
		this.state = { ...INITIAL_GAME_STATE };
	}

	addTime(deltaTime) {
		this.state.timeElapsed += deltaTime;
		this.state.playerZDistance = -1 * this.speed * this.state.timeElapsed;
		let [x, y, z] = this.state.playerCoords;

		if (this.state.direction == NEG_X) {
			x += this.speed * deltaTime;
		} else if (this.state.direction == POS_X) {
			x -= this.speed * deltaTime;
		} else if (this.state.direction == NEG_Z) {
			z -= this.speed * deltaTime;
		}
		this.state.playerCoords = [x, y, z];
	}

	recalculateCoordsAfterTurn(turn) {
		let [x, y, z] = this.state.playerCoords;
		if (this.state.direction == NEG_X) {
			z += turn * COLUMN_WIDTH;
		} else if (this.state.direction == POS_X) {
			z -= turn * COLUMN_WIDTH;
		} else if (this.state.direction == NEG_Z) {
			x += turn * COLUMN_WIDTH;
		}
		this.state.playerCoords = [x, y, z];
	}

	movePlayerLeft() {
		if (!this.paused) {
			if (this.state.playerColumn === RIGHT) {
				this.state.playerColumn = MIDDLE;
				// this.recalculateCoordsAfterTurn(LEFT);
			} else if (this.state.playerColumn === MIDDLE) {
				this.state.playerColumn = LEFT;
				// this.recalculateCoordsAfterTurn(LEFT);
			}
		}
	}

	movePlayerRight() {
		if (!this.paused) {
			if (true) {
				this.state.direction = NEG_X;
			} else {
				if (this.state.playerColumn === LEFT) {
					this.state.playerColumn = MIDDLE;
					this.recalculateCoordsAfterTurn(RIGHT);
				} else if (this.state.playerColumn === MIDDLE) {
					this.state.playerColumn = RIGHT;
					this.recalculateCoordsAfterTurn(RIGHT);
				}
			}
		}
	}

	pauseGame() {
		this.paused = !this.paused;
	}

	restartGame() {
		this.setStateToInitial();
		if (this.gameEnded) {
			this.gameEnded = false;
			this.paused = true;
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
	endGame() {
		this.gameEnded = true;
	}
	getPaths() {
		return this.paths;
	}

	getDirection() {
		return this.state.direction;
	}

	getPlayerCoords() {
		return this.state.playerCoords;
	}
}
class SubPath {
	constructor(startPoint = [0, 0, 0], axis, length) {
		this.length = length;
		this.startPoint = startPoint;
		this.axis = axis;
	}

	getInitialTransform() {
		let transfromation = Mat4.identity();
		transfromation = transfromation.times(
			Mat4.translation(...this.startPoint)
		);
		if (this.axis === POS_X) {
			transfromation = transfromation.times(
				Mat4.rotation(Math.PI / 2, 0, 1, 0)
			);
		} else if (this.axis === NEG_X) {
			transfromation = transfromation.times(
				Mat4.rotation((3 * Math.PI) / 2, 0, 1, 0)
			);
		}
		return transfromation;
	}
	getInitialCoords() {
		return this.startPoint;
	}
}

class Paths {
	constructor(paths) {
		this.paths = paths;
		this.updateStartPoints();
	}

	updateStartPoints() {
		let x = 0;
		let y = 0;
		let z = 0;

		const width = 12;
		const unitLength = 2;
		for (let path of this.paths) {
			if (path.type === STRAIGHT_LINE_PATH) {
				path.startPoint = [x, y, z];
				if (path.axis === NEG_Z) {
					z -= path.length * unitLength;
				} else if (path.axis === NEG_X) {
					x -= path.length * unitLength;
				} else if (path.axis === POS_X) {
					x += path.length * unitLength;
				}
			} else if (path.type === TURN) {
				path.startPoint = [x, y, z];
				if (path.axis === NEG_Z) {
					z -= (path.length / 2) * unitLength;
					if (path.turnDirection === LEFT) {
						x += (width * unitLength) / 2;
					} else {
						x -= (width * unitLength) / 2;
					}
				} else if (path.axis === NEG_X) {
					x -= path.length * unitLength;
					if (path.turnDirection === LEFT) {
						z -= (width * unitLength) / 2;
					} else {
						z += (width * unitLength) / 2;
					}
				} else if (path.axis === POS_X) {
					x += path.length * unitLength;
					if (path.turnDirection === LEFT) {
						z += (width * unitLength) / 2;
					} else {
						z += (width * unitLength) / 2;
					}
				}
			}
		}
	}
	getPaths() {
		return this.paths;
	}
}

class StraightLinePath extends SubPath {
	constructor(objects, length, axis, startPoint = [0, 0, 0]) {
		super(startPoint, axis, length);
		this.objects = objects;
		this.type = STRAIGHT_LINE_PATH;
		this.length = length;
		this.axis = axis;
	}
}

class Turn extends SubPath {
	constructor(axis, turnDirection, startPoint = [0, 0, 0]) {
		super(startPoint, axis, 12);
		this.type = TURN;
		this.turnDirection = turnDirection;
	}
}
