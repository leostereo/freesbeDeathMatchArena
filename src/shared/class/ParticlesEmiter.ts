import { Color4, ParticleSystem, Scene, Texture } from "@babylonjs/core";
import { CharacterOrientationInfo } from "../types/CharacterTypes";

export class ParticlesEmiter {
    private scene: Scene;
    private orientation: CharacterOrientationInfo;
    private power: number | null;

    constructor(scene: Scene, orientation: CharacterOrientationInfo, power: number | null, type: 'throw' | 'impact' | null) {

        this.scene = scene;
        this.orientation = orientation;
        this.power = power;

        switch (type) {
            case 'throw':
                this.createThrowParticlesSystem()
                break;
            case 'impact':
                this.createImpactParticlesSystem()
                break;
        
            default:
                break;
        }

    }

    private createThrowParticlesSystem() {

        // Create a particle system
        var particleSystem = new ParticleSystem("particles", 2000, this.scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

        const emiterposition = this.orientation.position.clone();
        const emiterOffset = this.orientation.pointingVector.clone();
        emiterOffset.scaleInPlace(5.5);
        emiterposition._y += 1.2;
        emiterposition._x + emiterOffset._x;
        emiterposition._z += emiterOffset._z;
        const emiterDirection = this.orientation.pointingVector.clone();

        particleSystem.emitter = emiterposition // the starting location
        particleSystem.direction1 = emiterDirection.scaleInPlace(5)

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


        //                Start the particle system
        particleSystem.start();
        setTimeout(() => {
            particleSystem.stop();
        }, 500)
        setTimeout(() => {
            particleSystem.dispose();
        }, 1500)

    }

    private createImpactParticlesSystem(){
            var particleSystem = new ParticleSystem("particles", 4000, this.scene);

            //Texture of each particle
            particleSystem.particleTexture = new Texture("https://assets.babylonjs.com/textures/flare.png");

            // Where the particles come from
            particleSystem.emitter = this.orientation.position; // the starting location

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
            particleSystem.createSphereEmitter(3);

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
}