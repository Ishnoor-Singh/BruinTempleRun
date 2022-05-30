import { defs, tiny } from './examples/common.js';
import { BruinTempleRun } from './game.js';

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
		const light_position = vec4(0, 5, 5, 1);
		program_state.lights = [
			new Light(light_position, color(1, 1, 1, 1), 1000),
		];
	}
}
const PLAYER = 'player';
const OBSTACLE = 'obstacle';
const OVERHEAD = 'overhead';
const COIN = 'coin';

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 6;

const OBSTACLE_Y = 0;
const OVERHEAD_Y = 1.4;

const STRAIGHT_LINE_PATH = 'straightLinePath';
const TURN = 'turn';

const POS_Z = '+z';
const NEG_Z = '-z';
const POS_X = '+x';
const NEG_X = '-x';

const NUM_COLUMNS = 6;

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
	}

	make_control_panel() {
		this.key_triggered_button('Pause', ['p'], () => {
			this.game.pauseGame();
		});
		this.key_triggered_button('Right', ['l'], () => {
			this.game.movePlayerRight();
		});
		this.key_triggered_button('Left', ['j'], () => {
			this.game.movePlayerLeft();
		});
		this.key_triggered_button('Restart', ['r'], () => {
			this.game.restartGame();
		});
		this.key_triggered_button('Down', ['k'], () => {
			this.game.toggleDuck();
			setTimeout(() => {
				this.game.toggleDuck();
			}, 2000);
		});
	}

	// turnTo(direction, zDistsance) {
	// 	let transfromation = Mat4.identity();
	// 	if (direction === POS_Z) {
	// 		transfromation = transfromation.times(
	// 			Mat4.translation(0, 0, -2 * zDistsance)
	// 		);
	// 		transfromation = transfromation.times(Mat4.scale(1, 1, -1));
	// 	} else if (direction === POS_X) {
	// 		transfromation = transfromation.times(
	// 			Mat4.rotation(Math.PI / 2, 0, 1, 0)
	// 		);
	// 	} else if (direction === NEG_X) {
	// 		transfromation = transfromation.times(
	// 			Mat4.rotation((3 * Math.PI) / 2, 0, 1, 0)
	// 		);
	// 	}
	// 	return transfromation;
	// }

	getVectorLocation(column, zDistsance, direction = NEG_Z) {
		let model_transform = Mat4.identity();
		const turnAngle = {};
		turnAngle[NEG_Z] = 0;
		turnAngle[POS_Z] = Math.PI;
		turnAngle[POS_X] = Math.PI / 2;
		turnAngle[NEG_X] = (3 * Math.PI) / 2;
		// console.log(turnAngle[direction]);
		model_transform = model_transform.times(
			Mat4.rotation(turnAngle[direction], 0, 1, 0)
		);
		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistsance)
		);
		return model_transform;
	}

	drawLineWalls(context, program_state, length, initialTransform) {
		let model_transform = initialTransform;
		model_transform = model_transform.times(
			Mat4.translation(-NUM_COLUMNS * 2 + 1, 0, -1)
		);

		for (let i = 0; i != length; i++) {
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				this.materials.bricks
			);
			model_transform.post_multiply(
				Mat4.translation(NUM_COLUMNS * 4 - 2, 0, 0)
			);
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				this.materials.bricks
			);
			model_transform.post_multiply(
				Mat4.translation(-1 * NUM_COLUMNS * 4 + 2, 0, -2)
			);
		}

		return model_transform;
	}

	drawLineFloor(context, program_state, length, initialTransform) {
		let model_transform = initialTransform;

		model_transform = model_transform.times(
			Mat4.scale(2 * NUM_COLUMNS, 0.1, 1)
		);
		model_transform = model_transform.times(Mat4.translation(0, -11, -1));

		for (let i = 0; i != length; i++) {
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				// model_transform.times(this.turnTo(direction, 2, 2, -2 * i)),
				this.materials.ground
			);
			model_transform.post_multiply(Mat4.translation(0, 0, -2));
		}

		return model_transform;
	}

	drawObject(
		context,
		program_state,
		column,
		zDistsance,
		type,
		initialTransform
	) {
		const color = hex_color(this.colors[type]);
		let model_transform = initialTransform;

		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistsance)
		);
		type === COIN
			? this.shapes.cube.draw(
					context,
					program_state,
					model_transform
						.times(Mat4.scale(0.3, 0.3, 0.3))
						.times(Mat4.translation(0, 1.7, 0)),
					this.materials.plastic.override({ color: color })
			  )
			: this.shapes.cube.draw(
					context,
					program_state,
					type === OVERHEAD
						? model_transform
								.times(Mat4.translation(column, 1.4, 0))
								.times(Mat4.scale(3, 0.3, 1))
						: model_transform
								.times(Mat4.translation(column, 0, 0))
								.times(Mat4.scale(3, 1, 1)),
					this.materials.bricks
			  );

		return model_transform;
	}
	drawPlayer(context, program_state, column, direction, type, playerCoords) {
		const color = hex_color(this.colors[type]);
		let model_transform = Mat4.identity();

		let [x, y, z] = playerCoords;

		if (this.game.getDirection() == NEG_X) {
			z += column * COLUMN_WIDTH;
		} else if (this.game.getDirection() == POS_X) {
			z -= column * COLUMN_WIDTH;
		} else if (this.game.getDirection() == NEG_Z) {
			x += column * COLUMN_WIDTH;
		}

		model_transform = model_transform.times(Mat4.translation(...[x, y, z]));
		const turnAngle = {};
		turnAngle[NEG_Z] = 0;
		turnAngle[POS_Z] = Math.PI;
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

	setUpCenters(context, program_state, column, zDistance, type) {
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistance)
		);

		// x, y, Center position
		// x is LEFT, MIDDLE, RIGHT
		// y is 0 for ground obstacle, 1.4 for overhead obstacle
		// in array, object z is index 4
		type === COIN
			? this.coinCenters.push([
					column * COLUMN_WIDTH,
					0,
					...model_transform.transposed()[3],
			  ])
			: this.obstacleCenters.push([
					column * COLUMN_WIDTH,
					type === OVERHEAD ? OVERHEAD_Y : OBSTACLE_Y,
					...model_transform.transposed()[3],
			  ]);
		return model_transform;
	}

	drawObject(context, program_state, column, zDistance, type) {
		const color = hex_color(this.colors[type]);
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistance)
		);
		type === COIN
			? this.shapes.cube.draw(
					context,
					program_state,
					model_transform
						.times(Mat4.scale(0.3, 0.3, 0.3))
						.times(Mat4.translation(0, 1.7, 0)),
					this.materials.plastic.override({ color: color })
			  )
			: this.shapes.cube.draw(
					context,
					program_state,
					type === OVERHEAD
						? model_transform
								.times(Mat4.translation(column, OVERHEAD_Y, 0))
								.times(Mat4.scale(3, 0.3, 1))
						: model_transform
								.times(Mat4.translation(column, OBSTACLE_Y, 0))
								.times(Mat4.scale(3, 1, 1)),
					this.materials.bricks
			  );

		return model_transform;
	}

	// From text-demo.js
	baseScreenSetup(context, program_state) {
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

	// Draws text onto cube side given strings (like in text-demo.js)
	baseDrawText(context, program_state, multi_line_string, cube_side) {
		for (let line of multi_line_string.slice(0, 30)) {
			this.shapes.text.set_string(line, context.context);
			this.shapes.text.draw(
				context,
				program_state,
				cube_side.times(Mat4.scale(0.1, 0.1, 0.1)),
				this.materials.text_image
			);
			cube_side.post_multiply(Mat4.translation(0, -0.06, 0));
		}
	}

	gameLostScreen(context, program_state) {
		this.baseScreenSetup(context, program_state);

		let strings = [
			'\t\t\t\t\t\t\t\tGame Over \n\n\n\t\t\t\t\t\t\t\t[R]estart',
		];
		let cube_side = Mat4.translation(-1.8, 0, 1);
		const multi_line_string = strings[0].split('\n');
		this.baseDrawText(context, program_state, multi_line_string, cube_side);
	}

	drawPaths(context, program_state) {
		const paths = this.game.getPaths();
		paths.forEach((e) => {
			if (e.type === STRAIGHT_LINE_PATH) {
				this.drawLineWalls(
					context,
					program_state,
					e.length,
					e.getInitialTransform()
				);
				this.drawLineFloor(
					context,
					program_state,
					e.length,
					e.getInitialTransform()
				);
				e.objects.forEach((object) => {
					this.drawObject(
						context,
						program_state,
						object.column,
						object.z,
						object.type,
						e.getInitialTransform()
					);
				});
				e.objects.forEach((object) => {
					this.setUpCenters(
						context,
						program_state,
						object.column,
						object.z,
						object.type
					);
				});
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
			if (!this.game.gameEnded) {
				this.distances = this.obstacleCenters.map((pos) => {
					const player_x = this.game.getPlayerColumn() * COLUMN_WIDTH;
					const player_y = this.game.isDucking()
						? OBSTACLE_Y + 0.1
						: OVERHEAD_Y + 0.1;
					const player_z = this.game.getPlayerZDistance();

					return [
						player_x,
						player_y,
						player_z,
						pos[0],
						pos[1],
						pos[4],
					];
				});

				const collide = this.distances.some((dist) => {
					if (dist[0] === dist[3] && dist[1] > dist[4]) {
						if (dist[2] < dist[5] + 1 && dist[2] > dist[5] - 1)
							return true;
					}
					return false;
				});

				if (collide) this.game.endGame();

				this.drawPlayer(
					context,
					program_state,
					this.game.getPlayerColumn(),
					this.game.getDirection(),
					PLAYER,
					// this.game.getDirection(),
					this.game.getPlayerCoords()
				);
				this.drawPaths(context, program_state);

				// draw objects
				// this.game.getObjects().forEach((object) => {
				// 	this.drawObject(
				// 		context,
				// 		program_state,
				// 		object.column,
				// 		object.z,
				// 		object.type
				// 	);
				// });

				// // draw floor
				// this.drawFloor(context, program_state);
				// this.drawWalls(context, program_state);

				// set camera
				let desired = Mat4.inverse(
					this.getVectorLocation(
						this.game.getPlayerColumn(),
						this.game.getPlayerZDistance()
					).times(Mat4.translation(0, 7, 20))
				);
				desired = desired.map((x, i) =>
					Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)
				);
				program_state.set_camera(desired);

				// setting light
				const player_light_position = vec4(
					this.game.getPlayerColumn() * COLUMN_WIDTH,
					10,
					this.game.getPlayerZDistance(),
					1
				);
				program_state.lights = [
					new Light(player_light_position, color(1, 1, 1, 1), 1000),
				];
			} else {
				// game ended: check if victory or defeat
				this.gameLostScreen(context, program_state);
			}
		}
	}
}
