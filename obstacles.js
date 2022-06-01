import {LEFT, MIDDLE, RIGHT, COIN, OVERHEAD, OVERHEAD_WITH_COIN} from './constants.js';

export function makeObstacle(leftType, middleType, rightType, position) {

    var objects = [leftType, middleType, rightType]

    var newObjects = objects.map ((object, index) => {
        if (object === OVERHEAD_WITH_COIN) {
            return [formObstacle(OVERHEAD, position, index), formObstacle(COIN, position, index)]
        }

        return formObstacle(object, position, index)
    });

    return Array.prototype.concat.apply([], newObjects);
  }

  function formObstacle(obstacleType, position, placement) {
      return {
          type: obstacleType,
          z: position,
          column: placement === 0 ? LEFT : placement === 1 ? MIDDLE : RIGHT
      }
  }