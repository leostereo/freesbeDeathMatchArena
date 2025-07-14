import { AnimationEnums, CharacterAnimationContainer } from "@/shared/CharacterAnimationContainer";
import { Quaternion, Scene, Vector3, AnimationEvent, ParticleSystem, Texture, Color4, MeshBuilder, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";

export type CharacterOrientationInfo = {
    position: Vector3;
    pointingVector: Vector3;
}

export class AnimationEvents {

    private scene: Scene;
    private animtionContainer: CharacterAnimationContainer;
    private characterOrientation: CharacterOrientationInfo = {
        position: Vector3.Zero(),
        pointingVector: Vector3.Zero()
    };
    private emiterPosition: Vector3;

    // private characterPosition: Vector3;
    // private characterNormal: Vector3;
    // private characterAngle: number;



    constructor(scene: Scene, animationContainer: CharacterAnimationContainer) {
        this.scene = scene;
        this.animtionContainer = animationContainer;
        this.bindJumpUpEvents();
        this.bindThrowFreesbeEvents();
    }

    updateCharacterInfo(characterOrientation: CharacterOrientationInfo) {
        this.characterOrientation = characterOrientation
        // this.emiterPosition = characterOrientation.position.clone();
        // this.emiterPosition._y = this.emiterPosition._y + 2;
        // this.emiterPosition._x = this.emiterPosition._x < 0 ? this.emiterPosition._x -2 : this.emiterPosition._z + 2;
        // this.emiterPosition._z = this.emiterPosition._z < 0 ? this.emiterPosition._z -2 : this.emiterPosition._z + 2;
    }

    private bindJumpUpEvents() {

        const jumpUpAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.jump);

        const releaseLatch = new AnimationEvent(
            52,
            () => {
                jumpUpAnimation.latched = false;
            },
            true,
        );

        jumpUpAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatch);
    }

    private bindThrowFreesbeEvents() {

        var bodyCollideCB = (collision) => {

            var particleSystem = new ParticleSystem("particles", 2000, this.scene);

            //Texture of each particle
            particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

            // Where the particles come from
            particleSystem.emitter = collision.point; // the starting location


            // Colors of all particles
            particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
            particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
            particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

            // Size of each particle (random between...
            particleSystem.minSize = 0.1;
            particleSystem.maxSize = 0.5;

            // Life time of each particle (random between...
            particleSystem.minLifeTime = 0.1;
            particleSystem.maxLifeTime = 0.5;

            // Emission rate
            particleSystem.emitRate = 500;


            /******* Emission Space ********/
            //particleSystem.createPointEmitter(collision.normal.scaleInPlace(-1),collision.normal);
            particleSystem.createSphereEmitter(1);

            // Speed
            particleSystem.minEmitPower = 1;
            particleSystem.maxEmitPower = 6;
            particleSystem.updateSpeed = 0.005;

            // Start the particle system
            particleSystem.start();

            setTimeout(() => {
                particleSystem.stop();
            }, 500);

            setTimeout(() => {
                particleSystem.dispose();
            }, 1500);

        }

        const throwFreesbeAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.throw_freesbe);

        const particlesEffect = new AnimationEvent(
            80,
            () => {

                // Create a particle system
                var particleSystem = new ParticleSystem("particles", 2000, this.scene);

                //Texture of each particle
                particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                const emiterposition = this.characterOrientation.pointingVector.clone();
                

                particleSystem.emitter = emiterposition // the starting location
            
                // particleSystem.direction1 = this.characterOrientation.pointingVector.scaleInPlace(5)

                // Colors of all particles
                particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
                particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
                particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

                // Size of each particle (random between...
                particleSystem.minSize = 0.1;
                particleSystem.maxSize = 0.5;

                // Life time of each particle (random between...
                particleSystem.minLifeTime = 0.3;
                particleSystem.maxLifeTime = 2.5;

                // Emission rate
                particleSystem.emitRate = 800;


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
                setTimeout(() => {
                    particleSystem.dispose();
                }, 1500)
            },
            true,
        );


        const freesbeThrow = new AnimationEvent(
            85,
            () => {
                const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                freesbe.position = this.characterOrientation.position.clone();
                freesbe.position.y = freesbe.position.y + 2;
                var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);


                freesbeAggregate.body.applyImpulse(this.characterOrientation.pointingVector.scale(1500), freesbe.absolutePosition);
                freesbeAggregate.body.setCollisionCallbackEnabled(true)
                //freesbeAggregate.body.getCollisionObservable().add(bodyCollideCB);



                setTimeout(() => {
                    freesbe.dispose()
                }, 4000)
            },
            true,
        );

        const releaseLatch = new AnimationEvent(
            160,
            () => {
                throwFreesbeAnimation.latched = false;
            },
            true,
        );

        throwFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(particlesEffect);
        throwFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(freesbeThrow);
        throwFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatch);


    }
}