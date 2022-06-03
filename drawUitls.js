import { defs, tiny } from './examples/common.js';
import {
	NUM_COLUMNS,
	NEG_Z,
	NEG_X,
	POS_X,
	POS_Z,
	COLUMN_WIDTH,
	FINISH,
	COIN,
	OVERHEAD,
	OBSTACLE_Y,
	OVERHEAD_Y,
	LEFT,
	RIGHT,
} from './constants.js';
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

export function calculatePlayerCoords(baseCoords, direction, column) {
	let [x, y, z] = baseCoords;
	if (direction == NEG_X) {
		z += column * COLUMN_WIDTH;
	} else if (direction == POS_X) {
		z -= column * COLUMN_WIDTH;
	} else if (direction == NEG_Z) {
		x += column * COLUMN_WIDTH;
	}
	return [x, y, z];
}

export function getVectorLocation(coords, direction = NEG_Z) {
	let model_transform = Mat4.identity();
	const turnAngle = {};
	turnAngle[NEG_Z] = 0;
	turnAngle[POS_Z] = Math.PI;
	turnAngle[POS_X] = Math.PI / 2;
	turnAngle[NEG_X] = (3 * Math.PI) / 2;

	model_transform = model_transform.times(Mat4.translation(...coords));
	model_transform = model_transform.times(
		Mat4.rotation(turnAngle[direction], 0, 1, 0)
	);
	return model_transform;
}
export function drawLineWalls(
	context,
	program_state,
	length,
	initialTransform,
	cube,
	material,
	obstacles
) {
	let model_transform = initialTransform;
	model_transform = model_transform.times(
		Mat4.translation(-NUM_COLUMNS * 2 + 1, 0, -1)
	);

	for (let i = 0; i != length; i++) {
		cube.draw(context, program_state, model_transform, material);
		//
		let obj = {};
		obj.center = [...model_transform.transposed()][3];
		let [cx, cy, cz] = [...model_transform.transposed()][3];
		let [wx, wy, wz] = [3, 2, 3];
		obj.bounds = {
			minX: cx - wx,
			minY: cy - wy,
			minZ: cz - wz,
			maxX: cx + wx,
			maxY: cy + wy,
			maxZ: cz + wz,
		};
		obstacles[`${[...initialTransform.transposed()][3]},${i}-1`] = obj;
		//
		model_transform.post_multiply(
			Mat4.translation(NUM_COLUMNS * 4 - 2, 0, 0)
		);
		//
		obj = {};
		obj.center = [...model_transform.transposed()][3];
		[cx, cy, cz] = [...model_transform.transposed()][3];
		[wx, wy, wz] = [3, 2, 3];
		obj.bounds = {
			minX: cx - wx,
			minY: cy - wy,
			minZ: cz - wz,
			maxX: cx + wx,
			maxY: cy + wy,
			maxZ: cz + wz,
		};
		obstacles[`${[...initialTransform.transposed()][3]},${i}-2`] = obj;
		//
		cube.draw(context, program_state, model_transform, material);
		model_transform.post_multiply(
			Mat4.translation(-1 * NUM_COLUMNS * 4 + 2, 0, -2)
		);
	}

	return model_transform;
}

export function drawLineFloor(
	context,
	program_state,
	length,
	initialTransform,
	cube,
	material
) {
	let model_transform = initialTransform;

	model_transform = model_transform.times(
		Mat4.scale(2 * NUM_COLUMNS, 0.1, 1)
	);
	model_transform = model_transform.times(Mat4.translation(0, -11, -1));

	for (let i = 0; i != length; i++) {
		cube.draw(
			context,
			program_state,
			model_transform,
			// model_transform.times(this.turnTo(direction, 2, 2, -2 * i)),
			material
		);
		model_transform.post_multiply(Mat4.translation(0, 0, -2));
	}

	return model_transform;
}

export function drawObject(
	context,
	program_state,
	column,
	zDistance,
	type,
	initialTransform,
	cube,
	plastic,
	brick,
	chest
) {
	let model_transform = initialTransform;
	model_transform = model_transform.times(
		Mat4.translation(column * COLUMN_WIDTH, 0, zDistance)
	);
	type === COIN
		? cube.draw(
				context,
				program_state,
				model_transform
					.times(Mat4.scale(0.4, 0.4, 0.4))
					.times(Mat4.translation(0, 0, 0)),
				plastic.override({ color: hex_color('#fed93d') })
		  )
		: type === FINISH
		  ? cube.draw(
				  context,
				  program_state,
				  model_transform
					  .times(Mat4.scale(1.5, 1.5, 1.5))
					  .times(Mat4.translation(0, 0.5, 0)),
				  chest
			)
		: cube.draw(
				context,
				program_state,
				type === OVERHEAD
					? model_transform
							.times(Mat4.translation(column, OVERHEAD_Y, 0))
							.times(Mat4.scale(3, 0.3, 1))
					: model_transform
							.times(Mat4.translation(column, OBSTACLE_Y, 0))
							.times(Mat4.scale(3, 1, 1)),
				brick
		  );

	return model_transform;
}

export function drawCorner(
	context,
	program_state,
	initialTransform,
	turnDirection,
	cube,
	ground,
	brick,
	obstacles
) {
	drawLineFloor(context, program_state, 12, initialTransform, cube, ground);
	// draw sides
	let model_transform = initialTransform;
	model_transform = model_transform.times(
		Mat4.translation(-NUM_COLUMNS * 2 + 1, 0, -1)
	);

	for (let i = 0; i != 12; i++) {
		turnDirection === LEFT &&
			cube.draw(context, program_state, model_transform, brick);
		//
		let obj = {};
		obj.center = [...model_transform.transposed()][3];
		let [cx, cy, cz] = [...model_transform.transposed()][3];
		let [wx, wy, wz] = [3, 2, 3];
		obj.bounds = {
			minX: cx - wx,
			minY: cy - wy,
			minZ: cz - wz,
			maxX: cx + wx,
			maxY: cy + wy,
			maxZ: cz + wz,
		};
		turnDirection === LEFT &&
			(obstacles[`${[...initialTransform.transposed()][3]},${i}-1`] =
				obj);
		//
		model_transform.post_multiply(
			Mat4.translation(NUM_COLUMNS * 4 - 2, 0, 0)
		);
		turnDirection === RIGHT &&
			cube.draw(context, program_state, model_transform, brick);
		//
		obj = {};
		obj.center = [...model_transform.transposed()][3];
		[cx, cy, cz] = [...model_transform.transposed()][3];
		[wx, wy, wz] = [3, 2, 3];
		obj.bounds = {
			minX: cx - wx,
			minY: cy - wy,
			minZ: cz - wz,
			maxX: cx + wx,
			maxY: cy + wy,
			maxZ: cz + wz,
		};
		turnDirection === RIGHT &&
			(obstacles[`${[...initialTransform.transposed()][3]},${i}-2`] =
				obj);
		//
		model_transform.post_multiply(
			Mat4.translation(-1 * NUM_COLUMNS * 4 + 2, 0, -2)
		);
	}
	// draw opposite side
	model_transform = initialTransform;

	model_transform = model_transform.times(Mat4.translation(-10, 0, -23));
	for (let i = 0; i != 12; i++) {
		cube.draw(context, program_state, model_transform, brick);
		let obj = {};
		obj.center = [...model_transform.transposed()][3];
		let [cx, cy, cz] = [...model_transform.transposed()][3];
		let [wx, wy, wz] = [3, 2, 3];
		obj.bounds = {
			minX: cx - wx,
			minY: cy - wy,
			minZ: cz - wz,
			maxX: cx + wx,
			maxY: cy + wy,
			maxZ: cz + wz,
		};
		obstacles[`${[...initialTransform.transposed()][3]},${i}-1`] = obj;
		model_transform.post_multiply(Mat4.translation(2, 0, 0));
	}
	return model_transform;
}

export function willIntersect(object, coords) {
	if (
		coords[0] > object.bounds.minX &&
		coords[0] < object.bounds.maxX &&
		coords[1] > object.bounds.minY &&
		coords[1] < object.bounds.maxY &&
		coords[2] > object.bounds.minZ &&
		coords[2] < object.bounds.maxZ
	) {
		return true;
	} else return false;
}
