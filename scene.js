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
				texture: new Texture('assets/bricks.png'),
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
const COIN = 'coin';

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 6;
const SPEED = 2;

export class BruinRunScene extends Base_Scene {
	/**
	 * This Scene object can be added to any display canvas.
	 * We isolate that code so it can be experimented with on its own.
	 * This gives you a very small code sandbox for editing a simple scene, and for
	 * experimenting with matrix transformations.
	 */
	//sway = true;

	constructor() {
		super();
		this.colors = {
			player: '#1976d2',
			coin: '#fed93d',
			obstacle: '#ea4334',
		};
		this.game = new BruinTempleRun();
		this.t = 0;
	}

	make_control_panel() {
		this.key_triggered_button('Pause', ['k'], () => {
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
	}

	getVectorLocation(column, zDistsance) {
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistsance)
		);
		return model_transform;
	}

	drawWalls(context, program_state) {
		const FLOOR_LENGTH = 100;
		const NUM_COLUMNS = 6;
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(-NUM_COLUMNS * 2, 0, -1)
		);

		for (let i = 0; i != FLOOR_LENGTH; i++) {
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				this.materials.bricks
			);
			model_transform.post_multiply(
				Mat4.translation(NUM_COLUMNS * 4 - 1, 0, 0)
			);
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				this.materials.bricks
			);
			model_transform.post_multiply(
				Mat4.translation(-1 * NUM_COLUMNS * 4 + 1, 0, -2)
			);
		}

		return model_transform;
	}

	drawFloor(context, program_state) {
		const FLOOR_LENGTH = 100;
		const NUM_COLUMNS = 6;
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.scale(2 * NUM_COLUMNS, 0.1, 1)
		);
		model_transform = model_transform.times(Mat4.translation(0, -10, -1));

		for (let i = 0; i != FLOOR_LENGTH; i++) {
			this.shapes.cube.draw(
				context,
				program_state,
				model_transform,
				this.materials.ground
			);
			model_transform.post_multiply(Mat4.translation(0, 0, -2));
		}

		return model_transform;
	}

	drawObject(context, program_state, column, zDistsance, type) {
		const color = hex_color(this.colors[type]);
		let model_transform = Mat4.identity();
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
					model_transform,
					this.materials.bricks
			  );

		return model_transform;
	}
	drawPlayer(context, program_state, column, zDistsance, type) {
		const color = hex_color(this.colors[type]);
		let model_transform = Mat4.identity();
		model_transform = model_transform.times(
			Mat4.translation(column * COLUMN_WIDTH, 0, zDistsance)
		);
		this.shapes.cube.draw(
			context,
			program_state,
			model_transform,
			this.materials.plastic.override({ color: color })
		);

		return model_transform;
	}

	display(context, program_state) {
		super.display(context, program_state);
		this.prevT = this.t;
		this.t = program_state.animation_time / 1000;
		if (!this.game.isGamePaused()) {
			this.game.addTime(this.t - this.prevT);
		}

		this.drawPlayer(
			context,
			program_state,
			this.game.getPlayerColumn(),
			this.game.getPlayerZDistance(),
			PLAYER
		);

		// draw objects
		this.game.getObjects().forEach((object) => {
			this.drawObject(
				context,
				program_state,
				object.column,
				object.z,
				object.type
			);
		});

		// draw floor
		this.drawFloor(context, program_state);
		this.drawWalls(context, program_state);

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
	}
}
