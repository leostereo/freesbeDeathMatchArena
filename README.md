# Babylon.js 8 + Vite 6 Typescript Template with Havok Physics

### Dev Environment

`npm i`

`npm run dev`

### Production Environment

`npm run build`

`npm run preview`

## Features

- Freshiest Babylon.js, Vite, Typescript and all other dependencies
- WebGPU engine by default, WebGL2 supported as well
- Havok Physics already set up and included in the demo scene
- FPS Counter in the right top corner
- Inspector - press Ctrl+Alt+Shift+I
- Axes Viewer
- Default Rendering Pipeline with FXAA and MSAA enabled
- All `console.log` messages are cleared in the production build
- Easy to disable not needed functions (Havok, Axes Viewer, Pipeline etc)
- Tree-shaking to reduce bundle size
- Inspector's import only for DEV mode to reduce bundle size

Based on old good https://github.com/minibao/babylon-vite

**Made by https://babylonpress.org/**

## usefull links

- [nose for direction](https://playground.babylonjs.com/#9GE7HV)
- [from docs ,physics characterController class](https://playground.babylonjs.com/#WO0H1U#13)
- [raycast and linear velocity](https://playground.babylonjs.com/#GZYGLJ#21)
- [turns to fpv when zoom and includes nose](https://playground.babylonjs.com/#2K0IJP#3)
- [using pyhisics](https://github.com/armomu/ergoudan)
- [no physics, moveWithCollision() function](https://github.com/ssatguru/BabylonJS-CharacterController)
- [lets ckech](https://playground.babylonjs.com/#9GE7HV#24)
- [muy util](https://playground.babylonjs.com/#9GE7HV#9)
- [rotating particles](https://forum.babylonjs.com/t/emitter-rotation-particles/41819/3)
- [throwing balls](https://playground.babylonjs.com/#8HZFUZ#230)

Version plan
beta1.0 - basic movements.
beta1.1 - event container
beta1.2 - final scenario.
beta1.3 - hud
beta1.4 - No magic numbers

beta2.0 - state based animations.
            - No more latch.
            - simple animation.
beta2.1 - action mask for keyboard interaction.
beta2.1 - duck and throw
beta2.2 - transitions.

