import { Color4, MeshBuilder, AnimationEvent, ParticleSystem, Texture, Vector3, PhysicsAggregate, PhysicsShapeType, Scene } from "@babylonjs/core";
import { AnimationEnums, CharacterAnimationContainer } from "./CCAContainer";




export class CharacterControllerAnimationEventBinder {

    private animtionContainer: CharacterAnimationContainer;
    private emitterInputDirection: Vector3;
    private emitterPosition: Vector3;
    private emitterNormal: Vector3;
    private emitterAngle: number;
    private scene: Scene;

    constructor(animationContainer: CharacterAnimationContainer, scene: Scene) {
        this.animtionContainer = animationContainer;
        this.scene = scene;
        this.bindThrowFreesbeEvents();
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

    
    private bindThrowFreesbeEvents() {

        const throwFreesbeAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.throw_freesbe);

        const particlesEffect = new AnimationEvent(
            80,
            () => {
                //particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                
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
            },
            true,
        );

        const particlesEffect2 = new AnimationEvent(
            80,
            () => {
                //particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                var radius = 2;
                var angle = Math.PI / 3;
                var height = radius / Math.tan(angle / 2);
                var cone = MeshBuilder.CreateCylinder("cone", { diameterBottom: 0, diameterTop: 2 * radius, height: height }, this.scene);
                cone.isVisible = false;
                cone.position = this.emitterPosition.clone();
                const finalConeAngle = Math.PI/2 + this.emitterAngle * Math.PI/180;
                cone.rotation = new Vector3(Math.PI/2,finalConeAngle,0)

                // Create a particle system
                var particleSystem = new ParticleSystem("particles", 2000, this.scene);

                //Texture of each particle
                particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

                // Where the particles come from
                particleSystem.emitter = cone; // the starting location
                // particleSystem.direction1 = this.emitterNormal.scaleInPlace(10);

                // Colors of all particles
                particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
                particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
                particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

                // Size of each particle (random between...
                particleSystem.minSize = 0.1;
                particleSystem.maxSize = 0.5;

                // Life time of each particle (random between...
                particleSystem.minLifeTime = 0.3;
                particleSystem.maxLifeTime = 5.5;

                // Emission rate
                particleSystem.emitRate = 800;


                /******* Emission Space ********/
                particleSystem.createConeEmitter(radius, angle);

                // Speed
                particleSystem.minEmitPower = 4;
                particleSystem.maxEmitPower = 8;
                particleSystem.updateSpeed = 0.005;

                
                // Start the particle system
                particleSystem.start();
                setTimeout(() => {
                    //particleSystem.stop();
                    cone.dispose()
                },1000)
                // Start the particle system
            },
            true,
        );
        
        const freesbeThrow = new AnimationEvent(
            85,
            () => {
                const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                freesbe.position = this.emitterPosition.clone();
                var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);
                freesbeAggregate.body.applyImpulse(this.emitterNormal.scale(100), freesbe.absolutePosition);

                setTimeout(() => {
                    freesbe.dispose()
                }, 1500)
                // Start the particle system
            },
            true,
        );

        const releaseLatch = new AnimationEvent(
            190,
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