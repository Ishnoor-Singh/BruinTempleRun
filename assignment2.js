import { defs, tiny } from './examples/common.js';

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
} = tiny;

class Cube extends Shape {
	constructor() {
		super('position', 'normal');
		// Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
		this.arrays.position = Vector3.cast(
			[-1, -1, -1],
			[1, -1, -1],
			[-1, -1, 1],
			[1, -1, 1],
			[1, 1, -1],
			[-1, 1, -1],
			[1, 1, 1],
			[-1, 1, 1],
			[-1, -1, -1],
			[-1, -1, 1],
			[-1, 1, -1],
			[-1, 1, 1],
			[1, -1, 1],
			[1, -1, -1],
			[1, 1, 1],
			[1, 1, -1],
			[-1, -1, 1],
			[1, -1, 1],
			[-1, 1, 1],
			[1, 1, 1],
			[1, -1, -1],
			[-1, -1, -1],
			[1, 1, -1],
			[-1, 1, -1]
		);
		this.arrays.normal = Vector3.cast(
			[0, -1, 0],
			[0, -1, 0],
			[0, -1, 0],
			[0, -1, 0],
			[0, 1, 0],
			[0, 1, 0],
			[0, 1, 0],
			[0, 1, 0],
			[-1, 0, 0],
			[-1, 0, 0],
			[-1, 0, 0],
			[-1, 0, 0],
			[1, 0, 0],
			[1, 0, 0],
			[1, 0, 0],
			[1, 0, 0],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, -1],
			[0, 0, -1],
			[0, 0, -1],
			[0, 0, -1]
		);
		// Arrange the vertices into a square shape in texture space too:
		this.indices.push(
			0,
			1,
			2,
			1,
			3,
			2,
			4,
			5,
			6,
			5,
			7,
			6,
			8,
			9,
			10,
			9,
			11,
			10,
			12,
			13,
			14,
			13,
			15,
			14,
			16,
			17,
			18,
			17,
			19,
			18,
			20,
			21,
			22,
			21,
			23,
			22
		);
		// this.indices = false;
	}
}

class Cube_Outline extends Shape {
	constructor() {
		super('position', 'color');
		//  TODO (Requirement 5).
		// When a set of lines is used in graphics, you should think of the list entries as
		// broken down into pairs; each pair of vertices will be drawn as a line segment.
		// Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
		this.arrays.position = [
			[-1, -1, -1],
			[1, -1, -1],
			[-1, -1, 1],
			[1, -1, 1],
			[1, 1, -1],
			[-1, 1, -1],
			[1, 1, 1],
			[-1, 1, 1],
			[-1, -1, -1],
			[-1, -1, 1],
			[-1, 1, -1],
			[-1, 1, 1],
			[1, -1, 1],
			[1, -1, -1],
			[1, 1, 1],
			[1, 1, -1],
			[-1, -1, 1],
			[1, -1, 1],
			[-1, 1, 1],
			[1, 1, 1],
			[1, -1, -1],
			[-1, -1, -1],
			[1, 1, -1],
			[-1, 1, -1],
			[1, 1, 1],
			[1, -1, 1],
			[-1, 1, 1],
			[-1, -1, 1],
			[1, 1, -1],
			[1, -1, -1],
			[-1, 1, -1],
			[-1, -1, -1],
		].map((e) => new Vector(e));

		this.arrays.color = new Array(32).fill(color(1, 1, 1, 1));
		this.indices = false;
	}
}

class Cube_Single_Strip extends Shape {
	constructor() {
		super('position', 'normal');
		// TODO (Requirement 6)

		this.indices = false;

		let arr = [
			[1, 1, 1],
			[-1, 1, 1],
			[1, 1, -1],
			[-1, 1, -1],
			[-1, -1, -1],
			[-1, 1, 1],
			[-1, -1, 1],
			[1, 1, 1],
			[1, -1, 1],
			[1, 1, -1],
			[1, -1, -1],
			[-1, -1, -1],
			[1, -1, 1],
			[-1, -1, 1],
		];
		this.arrays.position = arr.map((a) => new Vector(a));
		// for (let i = 0; i < this.arrays.position.length; i++) {
		// 	let pt = this.arrays.position[i];
		// 	this.arrays.normal.push(new Vector([pt[0], pt[1], pt[2]]));
		// }
		this.arrays.normal = this.arrays.position;
	}
}

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
			outline: new Cube_Outline(),
			single: new Cube_Single_Strip(),
		};

		// *** Materials
		this.materials = {
			plastic: new Material(new defs.Phong_Shader(), {
				ambient: 0.4,
				diffusivity: 0.6,
				color: hex_color('#ffffff'),
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
function generateRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

const PLAYER = 'player';
const OBSTACLE = 'obstacle';
const COIN = 'coin';

const LEFT = -1;
const MIDDLE = 0;
const RIGHT = 1;

const COLUMN_WIDTH = 5;
const SPEED = 2;
export class BruinTempleRun extends Base_Scene {
	/**
	 * This Scene object can be added to any display canvas.
	 * We isolate that code so it can be experimented with on its own.
	 * This gives you a very small code sandbox for editing a simple scene, and for
	 * experimenting with matrix transformations.
	 */
	//sway = true;

	constructor() {
		super();
		this.speed = 1;
		this.paused = false;
		this.colors = {
			player: '#1976d2',
			coin: '#fed93d',
			obstacle: '#ea4334',
		};
		this.playerZDistance = 1;
		this.playerColumn = MIDDLE;
		this.objects = [
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
		];
	}

	make_control_panel() {
		this.key_triggered_button('Pause', ['k'], () => {
			this.paused = !this.paused;
		});
		this.key_triggered_button('Right', ['l'], () => {
			if (this.playerColumn === LEFT) {
				this.playerColumn = MIDDLE;
			} else if (this.playerColumn === MIDDLE) {
				this.playerColumn = RIGHT;
			}
		});
		this.key_triggered_button('Left', ['j'], () => {
			if (this.playerColumn === RIGHT) {
				this.playerColumn = MIDDLE;
			} else if (this.playerColumn === MIDDLE) {
				this.playerColumn = LEFT;
			}
		});
	}

	get_angle(t) {
		if (!this.sway) {
			return 0.04 * Math.PI;
		} else {
			return 0.02 * Math.PI + 0.02 * Math.PI * Math.sin(t);
		}
	}

	draw_box(context, program_state, column, zDistsance, type) {
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
		this.t = program_state.animation_time / 1000;

		// prev_transform = prev_transform.times(Mat4.scale(1, 1.5, 1));
		// while (!this.paused) {
		// 	this.playerZDistance = this.speed * t;
		// }
		if (!this.paused) {
			this.playerZDistance = -1 * this.t * this.speed;
		}

		// draw player
		this.draw_box(
			context,
			program_state,
			this.playerColumn,
			this.playerZDistance,
			PLAYER
		);

		this.objects.forEach((object) => {
			this.draw_box(
				context,
				program_state,
				object.column,
				object.z,
				object.type
			);
		});
	}
}
