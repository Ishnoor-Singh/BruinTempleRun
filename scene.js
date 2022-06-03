import { defs, tiny } from './examples/common.js';
import { BruinTempleRun } from './game.js';
import { Text_Line } from './textLine.js';
import {
	getVectorLocation,
	drawLineWalls,
	drawLineFloor,
	drawObject,
	drawCorner,
	calculatePlayerCoords,
	willIntersect,
} from './drawUitls.js';
import { NEG_X, NEG_Z, STRAIGHT_LINE_PATH, TURN, POS_X, PLAYER, OBSTACLE, OVERHEAD, COIN, FINISH, VICTORY, DEFEAT, COLUMN_WIDTH } from './constants.js';

const {
	Vector,
	Vector3,
	vec,
	vec3,
	vec4,
	color,
	hex_color,
	Matrix,
	Mat4,
	Light,
	Shape,
	Material,
	Scene,
	Texture,
} = tiny;
const { Textured_Phong, Cube } = defs;

class Base_Scene extends Scene {
	/**
	 *  **Base_scene** is a Scene that can be added to any display canvas.
	 *  Setup the shapes, materials, camera, and lighting here.
	 */
	constructor() {
		// constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
		super();
		this.hover = this.swarm = false;
		// At the beginning of our program, load one of each of these shape definitions onto the GPU.
		this.shapes = {
			cube: new Cube(),
			sphere: new defs.Subdivision_Sphere(4),
			text: new Text_Line(40),
		};

		// *** Materials
		this.materials = {
			plastic: new Material(new defs.Phong_Shader(), {
				ambient: 0.4,
				diffusivity: 0.6,
				color: hex_color('#ffffff'),
			}),
			ground: new Material(new Textured_Phong(1), {
				ambient: 0.8,
				texture: new Texture('assets/grasslight-big.jpg'),
			}),
			bricks: new Material(new Textured_Phong(1), {
				ambient: 0.8,
				texture: new Texture('assets/bricks2.jpg'),
			}),
			villager: new Material(new Textured_Phong(1), {
				ambient: 0.8,
				texture: new Texture('assets/farmer.png', 'NEAREST'),
			}),
			coin: new Material(new Textured_Phong(1), {
				ambient: 0.8,
				texture: new Texture('assets/coin.png'),
			}),
			finish: new Material(new Textured_Phong(1), {
				ambient: 1,
				texture: new Texture('assets/chest.png'),
			}),
			start_background: new Material(new defs.Phong_Shader(), {
				color: color(0, 0.5, 0.5, 1),
				ambient: 0,
				diffusivity: 0,
				specularity: 0,
				smoothness: 20,
			}),
			text_image: new Material(new Textured_Phong(1), {
				ambient: 1,
				diffusivity: 0,
				specularity: 0,
				texture: new Texture('assets/text.png'),
			}),
		};
		// The white material and basic shader are used for drawing the outline.
		this.white = new Material(new defs.Basic_Shader());
	}

	display(context, program_state) {
		// display():  Called once per frame of animation. Here, the base class's display only does
		// some initial setup.

		// Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
		if (!context.scratchpad.controls) {
			this.children.push(
				(context.scratchpad.controls = new defs.Movement_Controls())
			);
			// Define the global camera and projection matrices, which are stored in program_state.
			program_state.set_camera(Mat4.translation(5, -10, -30));
		}
		program_state.projection_transform = Mat4.perspective(
			Math.PI / 4,
			context.width / context.height,
			1,
			100
		);

		// *** Lights: *** Values of vector or point lights.
		// const light_position = vec4(0, 5, 5, 1);
		// program_state.lights = [
		// 	new Light(light_position, color(1, 1, 1, 1), 1000),
		// ];
	}
}

const OVERHEAD_Y = 1.4;

export class BruinRunScene extends Base_Scene {
	/**
	 * This Scene object can be added to any display canvas.
	 * We isolate that code so it can be experimented with on its own.
	 * This gives you a very small code sandbox for editing a simple scene, and for
	 * experimenting with matrix transformations.
	 */

	constructor() {
		super();
		this.colors = {
			player: '#1976d2',
			coin: '#fed93d',
			torso: '#ea4334',
			head: '#b4886c',
			jeans: '#0359ac',
		};
		this.game = new BruinTempleRun();
		this.t = 0;
		this.coinCenters = [];
		this.obstacleCenters = [];
		this.coins = {};
		this.obstacles = {};
		this.deadCoins = [];
		this.finishLine = {};
		this.finishLineCenters = [];
	}

	make_control_panel() {
		this.key_triggered_button('Pause', ['p'], () => {
			this.game.pauseGame();
		});
		this.key_triggered_button('Slide right', ['l'], () => {
			this.game.slidePlayerRight();
		});
		this.key_triggered_button('Slide left', ['j'], () => {
			this.game.slidePlayerLeft();
		});
		this.key_triggered_button('Turn right', ['Control', 'l'], () => {
			this.game.movePlayerRight();
		});
		this.key_triggered_button('Turn left', ['Control', 'j'], () => {
			this.game.movePlayerLeft();
		});
		this.key_triggered_button('Restart', ['r'], () => {
			this.game.restartGame();
			this.coinCenters = [];
			this.obstacleCenters = [];
			this.coins = {};
			this.obstacles = {};
			this.deadCoins = [];
			this.finishLine = {};
			this.finishLineCenters = [];
		});
		this.key_triggered_button('Start', ['s'], () => {
			this.game.startGame();
		});
		this.key_triggered_button('Duck', ['k'], () => {
			if (!this.game.isDucking()) {
				this.game.setDuck(true);
				timeout = setTimeout(() => {
					this.game.setDuck(false);
				}, 1500);
			}
			else {
				this.game.setDuck(false);
				clearTimeout(timeout)
			}
		});
	}

	drawPlayer(context, program_state, column, direction, type, playerCoords) {
		let model_transform = Mat4.identity();

		model_transform = model_transform.times(
			Mat4.translation(...playerCoords)
		);
		const turnAngle = {};
		turnAngle[NEG_Z] = 0;
		turnAngle[POS_X] = Math.PI / 2;
		turnAngle[NEG_X] = (3 * Math.PI) / 2;
		model_transform = model_transform.times(
			Mat4.rotation(turnAngle[direction], 0, 1, 0)
		);
		//head 0.5 x 0.5
		if (!this.game.isDucking()) {
			let head = model_transform;
			head = head.times(Mat4.translation(0, 0.75, 0));
			head = head.times(Mat4.scale(0.25, 0.25, 0.25));
			this.shapes.cube.draw(
				context,
				program_state,
				head,
				this.materials.plastic.override({
					color: hex_color(this.colors['head']),
				})
			);
			//torso
			let torso = model_transform;
			torso = torso.times(Mat4.translation(0, 0.125, 0));
			torso = torso.times(Mat4.scale(0.375, 0.375, 0.175));
			this.shapes.cube.draw(
				context,
				program_state,
				torso,
				this.materials.plastic.override({
					color: hex_color(this.colors['torso']),
				})
			);
			//legs
			let leg1 = model_transform;
			leg1 = leg1.times(Mat4.translation(0.25, -0.625, 0));
			leg1 = leg1.times(Mat4.scale(0.125, 0.375, 0.175));
			if (!this.game.isGamePaused()) {
				leg1 = leg1.times(Mat4.translation(0.125, 0.375, 0));
				leg1 = leg1.times(
					Mat4.rotation((Math.PI / 8) * Math.sin(5 * this.t), 1, 0, 0)
				);
				leg1 = leg1.times(Mat4.translation(-0.125, -0.375, 0));
			}

			this.shapes.cube.draw(
				context,
				program_state,
				leg1,
				this.materials.plastic.override({
					color: hex_color(this.colors['jeans']),
				})
			);

			let leg2 = model_transform;
			leg2 = leg2.times(Mat4.translation(-0.25, -0.625, 0));
			leg2 = leg2.times(Mat4.scale(-0.125, 0.375, 0.175));
			if (!this.game.isGamePaused()) {
				leg2 = leg2.times(Mat4.translation(0.125, 0.375, 0));
				leg2 = leg2.times(
					Mat4.rotation(
						-1 * (Math.PI / 8) * Math.sin(5 * this.t),
						1,
						0,
						0
					)
				);
				leg2 = leg2.times(Mat4.translation(0.125, -0.375, 0));
			}

			this.shapes.cube.draw(
				context,
				program_state,
				leg2,
				this.materials.plastic.override({
					color: hex_color(this.colors['jeans']),
				})
			);

			//legs
			let arm2 = leg1.times(Mat4.translation(-6, 2, 0));

			this.shapes.cube.draw(
				context,
				program_state,
				arm2,
				this.materials.plastic.override({
					color: hex_color(this.colors['head']),
				})
			);

			let arm1 = leg2.times(Mat4.translation(-6, 2, 0));

			this.shapes.cube.draw(
				context,
				program_state,
				arm1,
				this.materials.plastic.override({
					color: hex_color(this.colors['head']),
				})
			);
		} else {
			this.shapes.sphere.draw(
				context,
				program_state,
				model_transform
					.times(Mat4.translation(0, -0.5, 0))
					.times(Mat4.scale(0.5, 0.5, 0.5)),
				this.materials.plastic.override({
					color: hex_color(this.colors['torso']),
				})
			);
		}

		return model_transform;
	}

	// From text-demo.js
	screenSetup(context, program_state) {
		program_state.lights = [
			new Light(vec4(0, 1, 1, 0), color(1, 1, 1, 1), 1000000),
		];
		program_state.set_camera(
			Mat4.look_at(...Vector.cast([0, 0, 4], [0, 0, 0], [0, 1, 0]))
		);

		let transform = Mat4.scale(2.5, 0.5, 0.5);
		this.shapes.cube.draw(
			context,
			program_state,
			transform,
			this.materials.start_background
		);
	}

	showDefeatScreen(context, program_state) {
		this.screenSetup(context, program_state);
		let gold = color(1, 209 / 255, 0, 1);
		let blue = color(39 / 255, 116 / 255, 174 / 255, 1);
		let strings = ['Game Over'];
		let cube_side = Mat4.translation(-0.6, 0, 1);
		let multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: blue })
			);
		}
		strings = ['[R]estart'];
		cube_side = Mat4.translation(-0.6, -0.25, 1);
		multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: gold })
			);
		}
	}

	showStartScreen(context, program_state) {
		this.screenSetup(context, program_state);
		let gold = color(1, 209 / 255, 0, 1);
		let blue = color(39 / 255, 116 / 255, 174 / 255, 1);
		let strings = ['Bruin Temple Run'];
		let cube_side = Mat4.translation(-1.07, 0.12, 1);
		let multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: gold })
			);
		}
		strings = ['[S]tart'];
		cube_side = Mat4.translation(-0.5, -0.12, 1);
		multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: blue })
			);
		}
	}

	showVictoryScreen(context, program_state) {
		this.screenSetup(context, program_state);
		let gold = color(1, 209 / 255, 0, 1);
		let blue = color(39 / 255, 116 / 255, 174 / 255, 1);
		let strings = ['You won!'];
		let cube_side = Mat4.translation(-0.4, 0.12, 1);
		let multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: gold })
			);
		}
		strings = ['[R]estart'];
		cube_side = Mat4.translation(-0.5, -0.12, 1);
		multi_line_string = strings[0].split('\n');
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image.override({ color: blue })
			);
		}
	}

	// Shows live text on game screen
	showLiveText(context, program_state, camera_transform) {
		// Display coin count
		let string = ['Coins: ' + this.game.getPlayerCoins()];
		let multi_line_string = string[0].split('\n');

		// Put it in top right corner
		let cube_side = camera_transform
			.times(Mat4.translation(14, 10, -30))
			.times(Mat4.scale(0.5, 0.5, 0.5));

		let gold = color(1, 209 / 255, 0, 1);

		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side,
				this.materials.text_image.override({ color: gold })
			);
		}
		// Display speed (more coins = more speed)
		string = ['Speed: ' + this.game.getPlayerSpeed().toFixed(1)];
		multi_line_string = string[0].split('\n');

		// Put it in top right corner below coin count
		cube_side = camera_transform
			.times(Mat4.translation(14, 8, -30))
			.times(Mat4.scale(0.5, 0.5, 0.5));

		let blue = color(39 / 255, 116 / 255, 174 / 255, 1);

		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side,
				this.materials.text_image.override({ color: blue })
			);
		}
	}

	setUpCenters(
		context,
		program_state,
		column,
		zDistance,
		type,
		initialTransform
	) {
		let model_transform = initialTransform;

		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistance)
		);

		// object:
		// center: x, y, z
		// width: x, y, z
		// bounds: x, y, z

		if (type === COIN) {
			const obj = {};
			obj.center = [...model_transform.transposed()][3];
			const [cx, cy, cz] = [...model_transform.transposed()][3];
			const [wx, wy, wz] = [1.5, 3, 1.5];
			obj.bounds = {
				minX: cx - wx,
				minY: cy - wy,
				minZ: cz - wz,
				maxX: cx + wx,
				maxY: cy + wy,
				maxZ: cz + wz,
			};
			this.coins[
				`${
					[...initialTransform.transposed()][3]
				},${zDistance},${column}`
			] = obj;
		} else if (type === OBSTACLE) {
			const obj = {};
			obj.center = [...model_transform.transposed()][3];
			const [cx, cy, cz] = [...model_transform.transposed()][3];
			const [wx, wy, wz] = [3, 2, 3];
			obj.bounds = {
				minX: cx - wx,
				minY: cy - wy,
				minZ: cz - wz,
				maxX: cx + wx,
				maxY: cy + wy,
				maxZ: cz + wz,
			};
			this.obstacles[
				`${
					[...initialTransform.transposed()][3]
				},${zDistance},${column}`
			] = obj;
		} else if (type === OVERHEAD) {
			const obj = {};
			obj.center = [...model_transform.transposed()][3];
			let [cx, cy, cz] = [...model_transform.transposed()][3];
			cy = OVERHEAD_Y;
			const [wx, wy, wz] = [3, 1, 3];
			obj.bounds = {
				minX: cx - wx,
				minY: cy - wy,
				minZ: cz - wz,
				maxX: cx + wx,
				maxY: cy + wy,
				maxZ: cz + wz,
			};
			this.obstacles[
				`${
					[...initialTransform.transposed()][3]
				},${zDistance},${column}`
			] = obj;
		}
		else if (type === FINISH) {
			const obj = {};
			obj.center = [...model_transform.transposed()][3];
			const [cx, cy, cz] = [...model_transform.transposed()][3];
			const [wx, wy, wz] = [3, 3, 3];
			obj.bounds = {
				minX: cx - wx,
				minY: cy - wy,
				minZ: cz - wz,
				maxX: cx + wx,
				maxY: cy + wy,
				maxZ: cz + wz,
			};
			this.finishLine[
				`${
					[...initialTransform.transposed()][3]
				},${zDistance},${column}`
			] = obj;
		}
		return model_transform;
	}

	drawPaths(context, program_state) {
		const paths = this.game.getPaths();
		paths.forEach((e) => {
			if (e.type === STRAIGHT_LINE_PATH) {
				drawLineWalls(
					context,
					program_state,
					e.length,
					e.getInitialTransform(),
					this.shapes.cube,
					this.materials.bricks,
					this.obstacles
				);
				drawLineFloor(
					context,
					program_state,
					e.length,
					e.getInitialTransform(),
					this.shapes.cube,
					this.materials.ground
				);
				e.objects.forEach((object) => {
					drawObject(
						context,
						program_state,
						object.column,
						object.z,
						object.type,
						e.getInitialTransform(),
						this.shapes.cube,
						this.materials.plastic,
						this.materials.bricks,
						this.materials.finish
					);
				});
				e.objects.forEach((object) => {
					this.setUpCenters(
						context,
						program_state,
						object.column,
						object.z,
						object.type,
						e.getInitialTransform()
					);
				});
			} else if (e.type === TURN) {
				drawCorner(
					context,
					program_state,
					e.getInitialTransform(),
					e.turnDirection,
					this.shapes.cube,
					this.materials.ground,
					this.materials.bricks,
					this.obstacles
				);
			}
		});
	}

	display(context, program_state) {
		super.display(context, program_state);
		this.prevT = this.t;
		this.t = program_state.animation_time / 1000;
		if (!this.game.isGamePaused()) {
			this.game.addTime(this.t - this.prevT);
		}

		if (this.game.gameStarted) {
			if (!this.game.gameEnded.end) {
				const playerCoords = this.game.getPlayerCoords();
				const collide = Object.keys(this.obstacles).some((key) => {
					const obj = this.obstacles[key];
					return willIntersect(obj, [
						playerCoords[0],
						this.game.isDucking() ? 0 : 1,
						playerCoords[2],
					]);
				});

				if (collide) this.game.endGame(DEFEAT);

				const reachedFinishLine = Object.keys(this.finishLine).filter((key) => {
					const obj = this.finishLine[key];
					return willIntersect(obj, [
						playerCoords[0],
						this.game.isDucking() ? 0 : 1,
						playerCoords[2],
					]);
				});

				if (reachedFinishLine.length) this.game.endGame(VICTORY);

				const getCoin = Object.keys(this.coins).filter((key) => {
					const obj = this.coins[key];

					return willIntersect(obj, [
						playerCoords[0],
						this.game.isDucking() ? 0 : 1,
						playerCoords[2],
					]);
				});

				if (
					!this.deadCoins.includes(getCoin[0]) &&
					Object.keys(getCoin).length !== 0
				) {
					// console.log('got coin', getCoin);
					this.deadCoins.push(getCoin[0]);

					// getCoin has coin location (z and column) + path it is on
					this.game.removePathCoins(getCoin[0].split(','));

					this.game.setPlayerCoins(this.game.getPlayerCoins() + 1);
					this.game.setPlayerSpeed(this.game.getPlayerSpeed() + 0.1);
				}

				this.drawPlayer(
					context,
					program_state,
					this.game.getPlayerColumn(),
					this.game.getDirection(),
					PLAYER,
					this.game.getPlayerCoords()
				);
				this.drawPaths(context, program_state);

				// set camera
				let model_transform = Mat4.identity();

				let [x, y, z] = this.game.getPlayerCoords();

				model_transform = model_transform.times(
					Mat4.translation(...[x, y, z])
				);
				let desired = Mat4.inverse(
					getVectorLocation(
						calculatePlayerCoords(this.game.getPlayerCoords()),
						this.game.getDirection()
					).times(Mat4.translation(0, 7, 20))
				);
				desired = desired.map((x, i) =>
					Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)
				);
				program_state.set_camera(desired);

				// show live text by basing it on camera transform
				this.showLiveText(
					context,
					program_state,
					program_state.camera_transform
				);

				// setting light on camera
				const light_position = program_state.camera_transform.times(
					vec4(0, 0, 0, 1)
				);
				program_state.lights = [
					new Light(light_position, color(1, 1, 1, 1), 1000),
				];
			} else {
				this.game.gameEnded.outcome === VICTORY ? 
					this.showVictoryScreen(context, program_state) 
				: this.game.gameEnded.outcome === DEFEAT ? 
					this.showDefeatScreen(context, program_state)
				: this.game.gameEnded = {
					end: false,
					outcome: ""
				}
			}
		} else {
			this.showStartScreen(context, program_state);
		}
	}
}
