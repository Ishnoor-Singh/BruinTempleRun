import { tiny } from './examples/common.js';
import { POS_X, POS_Z, NEG_X, NEG_Z, STRAIGHT_LINE_PATH, TURN, LEFT, MIDDLE, RIGHT, COIN, OBSTACLE, OVERHEAD, OVERHEAD_WITH_COIN, FINISH, NONE } from './constants.js';
import { makeObstacle } from './obstacles.js';
const { Mat4 } = tiny;

const INITIAL_SPEED = 12;

const INITIAL_GAME_STATE = {
	playerZDistance: 0,
	playerColumn: MIDDLE,
	timeElapsed: 0,
	duck: false,
	direction: NEG_Z,
	playerCoords: [0, 0, 0],
	coins: 0,
};

const objectsPath1 = Array.prototype.concat.apply([], [
	// makeObstacle(OBSTACLE, OBSTACLE, OBSTACLE, 3),
	makeObstacle(COIN, COIN, COIN, -10),
	makeObstacle(COIN, OBSTACLE, OBSTACLE, -30),
	makeObstacle(OBSTACLE, OBSTACLE, COIN, -50),
	makeObstacle(OBSTACLE, COIN, OBSTACLE, -70),
	makeObstacle(OVERHEAD_WITH_COIN, OBSTACLE, OVERHEAD_WITH_COIN, -90),
	makeObstacle(OBSTACLE, COIN, OBSTACLE, -110),
	makeObstacle(OVERHEAD_WITH_COIN, OBSTACLE, OBSTACLE, -130),
	makeObstacle(OBSTACLE, COIN, OBSTACLE, -150),
	makeObstacle(COIN, OBSTACLE, OVERHEAD_WITH_COIN, -170),
	makeObstacle(OVERHEAD_WITH_COIN, OVERHEAD_WITH_COIN, OVERHEAD_WITH_COIN, -190)
]);

const objectsPath2 = Array.prototype.concat.apply([], [
	makeObstacle(OBSTACLE, COIN, OBSTACLE, -10),
	makeObstacle(OVERHEAD_WITH_COIN, OBSTACLE, OVERHEAD_WITH_COIN, -30),
	makeObstacle(COIN, OBSTACLE, OBSTACLE, -50),
	makeObstacle(OBSTACLE, OBSTACLE, COIN, -70),
	makeObstacle(OBSTACLE, OVERHEAD_WITH_COIN, OVERHEAD_WITH_COIN, -90),
	makeObstacle(OBSTACLE, OVERHEAD, OBSTACLE, -110),
	makeObstacle(COIN, OBSTACLE, COIN, -130),
	makeObstacle(OVERHEAD_WITH_COIN, COIN, OVERHEAD_WITH_COIN, -150),
	makeObstacle(COIN, NONE, COIN, -170),
]);

const objectsPath3 = Array.prototype.concat.apply([], [
	makeObstacle(OBSTACLE, COIN, NONE, -10),
	makeObstacle(COIN, NONE, OVERHEAD_WITH_COIN, -30),
	makeObstacle(COIN, OBSTACLE, COIN, -50),
]);

const objectsPath4 = Array.prototype.concat.apply([], [
	makeObstacle(OBSTACLE, OVERHEAD_WITH_COIN, OBSTACLE, -10),
	makeObstacle(NONE, COIN, NONE, -15),
	makeObstacle(NONE, COIN, NONE, -20),
	makeObstacle(OBSTACLE, OBSTACLE, OVERHEAD_WITH_COIN, -30),
	makeObstacle(OBSTACLE, OBSTACLE, OVERHEAD_WITH_COIN, -50),
	makeObstacle(OBSTACLE, NONE, OVERHEAD, -70),
	makeObstacle(FINISH, FINISH, FINISH, -90),
	makeObstacle(OBSTACLE, OBSTACLE, OBSTACLE, -100)
]);

export class BruinTempleRun {
	constructor() {
		this.setStateToInitial();
		const p = [
			new StraightLinePath(objectsPath1, 100, NEG_Z),
			new Turn(NEG_Z, LEFT),
			new StraightLinePath(objectsPath2, 100, NEG_X),
			new Turn(NEG_X, RIGHT),
			new StraightLinePath(objectsPath3, 25, NEG_Z),
			new Turn(NEG_Z, RIGHT),
			new StraightLinePath(objectsPath4, 50, POS_X),
			
			//multiple turns attempt
			// new StraightLinePath([], 25, NEG_Z),
			// new Turn(NEG_Z, LEFT),
			// new StraightLinePath([], 25, NEG_X),
			// new Turn(POS_X, RIGHT),
			// new StraightLinePath([], 25, NEG_Z),
			// new Turn(NEG_Z, RIGHT),
			// new StraightLinePath([], 25, POS_X),
		];
		const paths = new Paths(p);
		this.paths = paths.getPaths();
		this.paused = true;
		this.speed = INITIAL_SPEED;
		this.gameStarted = false;
		this.gameEnded = {
			end: false,
			outcome: ""
		};
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

	movePlayerLeft() {
		if (!this.paused) {
			if (this.state.direction === NEG_Z) {
				this.state.direction = POS_X;
			} else if (this.state.direction === NEG_X) {
				this.state.direction = NEG_Z;
			}
		}
	}

	movePlayerRight() {
		if (!this.paused) {
			if (this.state.direction === NEG_Z) {
				this.state.direction = NEG_X;
			} else if (this.state.direction === POS_X) {
				this.state.direction = NEG_Z;
			}
		}
	}

	slidePlayerLeft() {
		if (!this.paused) {
			let [x, y, z] = this.state.playerCoords;

			const slide = LEFT / 8;
			if (this.state.direction == NEG_X) {
				z += slide * this.speed;
			} else if (this.state.direction == POS_X) {
				z -= slide * this.speed;
			} else if (this.state.direction == NEG_Z) {
				x += slide * this.speed;
			}
			this.state.playerCoords = [x, y, z];
		}
	}

	slidePlayerRight() {
		if (!this.paused) {
			let [x, y, z] = this.state.playerCoords;

			const slide = RIGHT / 8;
			if (this.state.direction == NEG_X) {
				z += slide * this.speed;
			} else if (this.state.direction == POS_X) {
				z -= slide * this.speed;
			} else if (this.state.direction == NEG_Z) {
				x += slide * this.speed;
			}
			this.state.playerCoords = [x, y, z];
		}
	}

	pauseGame() {
		if (this.gameStarted) this.paused = !this.paused;
	}

	restartGame() {
		this.setStateToInitial();
		this.speed = INITIAL_SPEED;
		if (this.gameEnded) {
			this.gameEnded = {
				end: false,
				outcome: ""
			};
			this.paused = true;
		}
		const p = [
			new StraightLinePath(objectsPath1, 100, NEG_Z),
			new Turn(NEG_Z, LEFT),
			new StraightLinePath(objectsPath2, 100, NEG_X),
			new Turn(NEG_X, RIGHT),
			new StraightLinePath(objectsPath3, 25, NEG_Z),
			new Turn(NEG_Z, RIGHT),
			new StraightLinePath(objectsPath4, 50, POS_X),
			
			//multiple turns attempt
			// new StraightLinePath([], 25, NEG_Z),
			// new Turn(NEG_Z, LEFT),
			// new StraightLinePath([], 25, NEG_X),
			// new Turn(POS_X, RIGHT),
			// new StraightLinePath([], 25, NEG_Z),
			// new Turn(NEG_Z, RIGHT),
			// new StraightLinePath([], 25, POS_X),
		];
		const paths = new Paths(p);
		this.paths = paths.getPaths();

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

	duck() {
		this.state.duck = true;
	}

	unduck() {
		this.state.duck = false;
	}

	isDucking() {
		return this.state.duck;
	}

	endGame(state) {
		this.gameEnded = {
			end: true,
			outcome: state
		};
	}

	startGame() {
		this.gameStarted = true;
	}

	getPaths() {
		return this.paths;
	}

	removePathCoins(key) {
		// key: indices 0-2 are xyz of path's initial transform (use to find which path the object is on)
		// 4 is z location, 5 is column (used to find unique coin on path given location and column)
		let l = this.getPaths().length;
		for (let i = 0; i < l; i++) {
			let pathCoords = this.getPaths()[i].getInitialCoords();
			if (pathCoords[0] === parseInt(key[0]) && pathCoords[1] === parseInt(key[1]) && pathCoords[2] === parseInt(key[2])) {
				this.getPaths()[i].setObjects(this.getPaths()[i].getObjects().filter(object => {
					if (object.type === COIN && object.z === parseInt(key[4]) && object.column === parseInt(key[5]))
						return false;
					else return true;
				}))
			}
		}
	}

	getDirection() {
		return this.state.direction;
	}

	getPlayerCoords() {
		return this.state.playerCoords;
	}

	getPlayerCoins() {
		return this.state.coins;
	}

	setPlayerCoins(amount) {
		this.state.coins = amount;
	}

	getPlayerSpeed() {
		return this.speed;
	}

	setPlayerSpeed(amount) {
		this.speed = amount;
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
					x += path.length * unitLength;
				} else if (path.axis === POS_X) {
					x -= path.length * unitLength;
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
					x += (path.length / 2) * unitLength;
					if (path.turnDirection === LEFT) {
						z += (width * unitLength) / 2;
					} else {
						z -= (width * unitLength) / 2;
					}
				} else if (path.axis === POS_X) {
					x -= (path.length / 2) * unitLength;
					if (path.turnDirection === LEFT) {
						z -= (width * unitLength) / 2;
					} else {
						z += (width * unitLength) / 2;
					}
				}
			}
			// console.log(path.axis, path.type, path.startPoint)
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

	getObjects() {
		return this.objects;
	}

	setObjects(objs){
		this.objects = objs;
	}
}

class Turn extends SubPath {
	constructor(axis, turnDirection, startPoint = [0, 0, 0]) {
		super(startPoint, axis, 12);
		this.type = TURN;
		this.turnDirection = turnDirection;
	}
}
