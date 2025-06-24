import { AnimationGroup, Scene, Vector3, AnimationEvent, ParticleSystem, Mesh, MeshBuilder, Texture, Color4, StandardMaterial, TransformNode, PhysicsBody, PhysicsMotionType, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";



export class CharacterControllerAnimationManager {
    private IDLE: AnimationGroup | null;
    private WALK: AnimationGroup | null;
    private RUN: AnimationGroup | null;
    private RUN_FAST: AnimationGroup | null;
    private JUMP: AnimationGroup | null;
    private THROW_FREESBE: AnimationGroup | null;
    private IS_FALLING_FLAT: AnimationGroup | null;
    private IS_FALLING_FLAT_IMPACT: AnimationGroup | null;
    private IS_FALLING_IDLE: AnimationGroup | null;
    private CROSS_PUNCH: AnimationGroup | null;
    private scene: Scene;
    private currentAnimation: 'cross punch' | 'idle' | 'walk' | 'run' | 'run fast' | 'jump up' | 'throw freesbe' | 'falling idle' | 'falling flat' | 'falling flat impact' | null;

    private emitterInputDirection: Vector3;
    private emitterPosition: Vector3;
    private emitterNormal: Vector3;
    private emitterAngle: number;

    public constructor(scene: Scene) {
        this.IDLE = scene.getAnimationGroupByName('idle');
        this.WALK = scene.getAnimationGroupByName('walking');
        this.RUN = scene.getAnimationGroupByName('slow running');
        this.RUN_FAST = scene.getAnimationGroupByName('fast running');
        this.JUMP = scene.getAnimationGroupByName('jump up');
        this.THROW_FREESBE = scene.getAnimationGroupByName('fresbe throw');
        this.IS_FALLING_FLAT = scene.getAnimationGroupByName('falling impact');
        this.IS_FALLING_FLAT_IMPACT = scene.getAnimationGroupByName('falling flat impact');
        this.IS_FALLING_IDLE = scene.getAnimationGroupByName('falling idle');
        this.CROSS_PUNCH = scene.getAnimationGroupByName('cross punch');

        this.emitterPosition = Vector3.Zero();
        this.emitterInputDirection = Vector3.Zero();

        this.scene = scene;
        this.addEvents(this.scene);
    }

    public setEmitterPosition(position: Vector3) {
        this.emitterPosition = position;
    }

    public setEmitterInputDirection(inputDirection: Vector3) {
        this.emitterInputDirection = inputDirection;
    }

    public setEmitterAngle(angle: number) {
        this.emitterAngle = angle;
    }

    public setEmitterNormal(vector: Vector3) {
        this.emitterNormal = vector;
    }

    public updateAnimation(isThrowingFreesbe: boolean, isCrossPunching: boolean): void {

        //console.log(isThrowingFreesbe, isCrossPunching);

        //throw freesbe
        if (isThrowingFreesbe && this.currentAnimation !== 'throw freesbe') {
            this.makeHimThrowFreesbe();
            return;
        }
        if (isCrossPunching && this.currentAnimation !== 'cross punch') {
            this.makeHimCrossPunch();
            return;
        }

        if (!isThrowingFreesbe && this.currentAnimation === 'throw freesbe') {
            this.makeHimIdle()
            return
        }
        if (!isCrossPunching && this.currentAnimation === 'cross punch') {
            this.makeHimIdle()
            return
        }
    }

    public updateAnimationFromVelocity(velocityVector: Vector3): void {

        if (this.currentAnimation === 'throw freesbe' || this.currentAnimation === 'cross punch') return;

        if (velocityVector.y > -15 && this.currentAnimation === 'falling flat') {
            this.isImpacted();
            return;
        }

        if (velocityVector._y > 2 && this.currentAnimation !== 'falling idle') {
            this.isFallingIdle();
            return;
        }

        if (velocityVector._y < -35) {
            if (this.currentAnimation === 'falling flat') return;
            this.isFallingFlat();
            return;
        }

        if (velocityVector._y < -15 && this.currentAnimation !== 'falling idle') {
            this.isFallingIdle();
            return;
        }


        if ((Math.abs(velocityVector._x) > 29 || Math.abs(velocityVector._z) > 29) && velocityVector._y === 0) {
            if (this.currentAnimation === 'run fast') return;
            this.makeHimRunFast();
            return;
        }

        if ((Math.abs(velocityVector._x) > 20 || Math.abs(velocityVector._z) > 20) && velocityVector._y === 0) {
            if (this.currentAnimation === 'run') return;
            this.makeHimRun()
            return;
        }

        if ((Math.abs(velocityVector._x) > 2 || Math.abs(velocityVector._z) > 2) && velocityVector._y === 0) {
            if (this.currentAnimation === 'walk') return;
            this.makeHimWalk()
            return
        }

        if ((Math.abs(velocityVector._x) >= 0 || Math.abs(velocityVector._z) >= 0) && velocityVector._y === 0) {
            if (this.currentAnimation === 'idle' || this.currentAnimation === 'falling flat impact') return;
            this.makeHimIdle()
            return
        }

    }

    private makeHimWalk() {
        this.stopAllLoopedAnim();
        this.WALK?.play(true);
        this.currentAnimation = 'walk';
    }

    private makeHimIdle() {
        this.stopAllLoopedAnim();
        this.IDLE?.play(true);
        this.currentAnimation = 'idle';
    }

    private makeHimRun() {
        this.stopAllLoopedAnim()
        this.RUN?.play(true)
        this.currentAnimation = 'run';
    }

    private makeHimRunFast() {
        this.stopAllLoopedAnim()
        this.RUN_FAST?.start(true);
        this.currentAnimation = 'run fast';
    }

    private makeHimJump() {
        this.JUMP?.play();
        this.currentAnimation = 'jump up';
    }

    private makeHimThrowFreesbe() {
        this.stopAllLoopedAnim()
        this.THROW_FREESBE?.start(false, 1.6, 1, 200, false);
        this.currentAnimation = 'throw freesbe'
    }

    private makeHimCrossPunch() {
        this.stopAllLoopedAnim()
        this.CROSS_PUNCH?.start(false, 1.4, 1, 122, false);
        this.currentAnimation = 'cross punch';
    }

    private isFallingIdle() {
        this.stopAllLoopedAnim()
        this.IS_FALLING_IDLE?.start(true);
        this.currentAnimation = 'falling idle';
    }

    private isFallingFlat() {
        this.stopAllLoopedAnim()
        this.IS_FALLING_FLAT?.start(true);
        this.currentAnimation = 'falling flat';
    }

    private isImpacted() {
        this.stopAllLoopedAnim()
        this.IS_FALLING_FLAT_IMPACT?.start(false, 1, 20, 95, false);
        this.currentAnimation = 'falling flat impact';
    }

    private stopAllLoopedAnim() {
        this.WALK?.stop();
        this.RUN?.stop();
        this.RUN_FAST?.stop();
        this.IDLE?.stop();
        this.IS_FALLING_IDLE?.stop();
        this.IS_FALLING_FLAT?.stop();
    }

    private addEvents(scene:Scene) {

        const event1 = new AnimationEvent(
            80,
            () => {
                //particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                var radius = 2;
                var angle = Math.PI / 3;
                var height = radius / Math.tan(angle / 2);
                var cone = MeshBuilder.CreateCylinder("cone", { diameterBottom: 0, diameterTop: 2 * radius, height: height }, this.scene);

                cone.isVisible = false;
                cone.position = this.emitterPosition;
                // cone.position.x = this.emitterPosition.x >= 0 ? this.emitterPosition.x + 3 : this.emitterPosition.x - 3;
                // cone.position.z = this.emitterPosition.z >= 0 ? this.emitterPosition.z + 3 : this.emitterPosition.z - 3;
                // cone.position.y = this.emitterPosition.y + 3;
                console.log(cone.position.x, cone.position.z)

                // Create a particle system
                var particleSystem = new ParticleSystem("particles", 2000, this.scene);

                //Texture of each particle
                particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                // Where the particles come from
                particleSystem.emitter = this.emitterPosition; // the starting location
                particleSystem.direction1 = this.emitterNormal.scaleInPlace(10);
                //cone.rotation = new Vector3(Math.PI / 2, this.emitterAngle, 0)

                // Colors of all particles
                particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
                particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
                particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

                // Size of each particle (random between...
                particleSystem.minSize = 0.1;
                particleSystem.maxSize = 0.5;

                // Life time of each particle (random between...
                particleSystem.minLifeTime = 0.3;
                particleSystem.maxLifeTime = 1.5;

                // Emission rate
                particleSystem.emitRate = 500;


                /******* Emission Space ********/
                // particleSystem.createConeEmitter(radius, angle);

                // Speed
                particleSystem.minEmitPower = 2;
                particleSystem.maxEmitPower = 4;
                particleSystem.updateSpeed = 0.005;


                // Start the particle system
                particleSystem.start();
                setTimeout(() => {
                    particleSystem.stop();
                }, 500)
                // Start the particle system
            },
            true,
        );
        const event2 = new AnimationEvent(
            85,
            () => {
                console.log(' throw')
                const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                freesbe.position = this.emitterPosition.clone();
                var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);
                freesbeAggregate.body.applyImpulse(this.emitterNormal.scale(500), freesbe.absolutePosition);
    
                setTimeout(() => {
                    // freesbe.dispose()
                }, 500)
                // Start the particle system
            },
            true,
        );
        this.THROW_FREESBE?.targetedAnimations[0].animation.addEvent(event1)
        this.THROW_FREESBE?.targetedAnimations[0].animation.addEvent(event2)


    }
}