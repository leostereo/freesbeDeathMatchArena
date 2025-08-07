import { AnimationEnums, CharacterAnimationContainer } from "@/shared/class/CharacterAnimationContainer";
import { EventContainer } from "@/shared/class/EventContainer";
import { ParticlesEmiter } from "@/shared/class/ParticlesEmiter";
import { IPlayerData } from "@/shared/class/PlayerData";
import { CharacterOrientationInfo } from "@/shared/types/CharacterTypes";
import { Scene, Vector3, AnimationEvent, MeshBuilder, PhysicsAggregate, PhysicsShapeType, IPhysicsCollisionEvent, Tools, Color3, StandardMaterial } from "@babylonjs/core";


export class AnimationEvents {

    private scene: Scene;
    private animtionContainer: CharacterAnimationContainer;
    private characterOrientation: CharacterOrientationInfo = {
        position: Vector3.Zero(),
        pointingVector: Vector3.Zero()
    };
    private color:Color3;
    private material : StandardMaterial;

    constructor(scene: Scene, animationContainer: CharacterAnimationContainer,
        playerData: IPlayerData, eventContainer:EventContainer) {
        this.scene = scene;
        this.animtionContainer = animationContainer;
        this.color = playerData.color
        this.material = new StandardMaterial("freesbe_material", this.scene);
        this.material.diffuseColor = this.color;
        this.bindJumpUpEvents();
        this.bindLandEvents();
        this.bindCrashEvents();
        this.bindThrowFreesbeEvents(eventContainer);
        this.bindAirThrowFreesbeEvents();
        this.bindSprintRollEvents()
    }

    updateCharacterInfo(characterOrientation: CharacterOrientationInfo) {
        this.characterOrientation = characterOrientation
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

    private bindLandEvents() {

        const landAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.landing_from_jump);
        const releaseLatchEvent = new AnimationEvent(
            100,
            () => {
                landAnimation.latched = false;
            },
            true,
        );

        landAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatchEvent);
    }

    private bindCrashEvents() {

        const landAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.falling_impact);
        const releaseLatchEvent = new AnimationEvent(
            95,
            () => {
                landAnimation.latched = false;
            },
            true,
        );

        landAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatchEvent);
    }

    private bindThrowFreesbeEvents(eventContainer:EventContainer) {

        var bodyCollideCB = (collision: IPhysicsCollisionEvent) => {

            if(collision.collidedAgainst.transformNode.name.includes('player')){
                eventContainer.pushEvent({
                    eventType:'freesbehit',
                    eventData:{
                        damage:1,
                        shooter:collision.collider.transformNode.name,
                        target:collision.collidedAgainst.transformNode.name,
                    }
                })
            }
            new ParticlesEmiter(this.scene, { position: collision.point ?? Vector3.Zero(), pointingVector: Vector3.Zero() }, null, 'impact',this.color)
        }

        const throwFreesbeAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.throw_freesbe);

        const particlesEffect = new AnimationEvent(
            80,
            () => {
                new ParticlesEmiter(this.scene, this.characterOrientation, null, 'throw',this.color)
            },
            true,
        );


        const freesbeThrow = new AnimationEvent(
            85,
            () => {
                const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                freesbe.material = this.material
                freesbe.position = this.characterOrientation.position.clone();
                freesbe.position.addInPlace(this.characterOrientation.pointingVector.scale(3))
                var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);
                freesbeAggregate.body.applyImpulse(this.characterOrientation.pointingVector.scale(1500), freesbe.absolutePosition);
                freesbeAggregate.body.setCollisionCallbackEnabled(true)
                freesbeAggregate.body.getCollisionObservable().add(bodyCollideCB);

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

    private bindAirThrowFreesbeEvents() {

        var bodyCollideCB = (collision: IPhysicsCollisionEvent) => {
            new ParticlesEmiter(this.scene, { position: collision.point ?? Vector3.Zero(), pointingVector: Vector3.Zero() }, null, 'impact',this.color)
        }

        const throwAirFreesbeAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.baseball_pitch);

        const particlesEffect = new AnimationEvent(
            135,
            () => {
                new ParticlesEmiter(this.scene, this.characterOrientation, null, 'throw',this.color)
            },
            true,
        );


        const airFreesbeThrow = new AnimationEvent(
            135,
            () => {
                const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                freesbe.material = this.material;
                freesbe.position = this.characterOrientation.position.clone();
                freesbe.position.addInPlace(this.characterOrientation.pointingVector.scale(3))

                const targetAngle = Math.atan2(-this.characterOrientation.pointingVector.z,
                    this.characterOrientation.pointingVector.x);

                freesbe.rotation = new Vector3(Math.PI / 2, targetAngle, 0)
                freesbe.position.y = freesbe.position.y + 1;

                var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);
                freesbeAggregate.body.applyImpulse(this.characterOrientation.pointingVector.scale(500), freesbe.absolutePosition);
                freesbeAggregate.body.setCollisionCallbackEnabled(true)
                freesbeAggregate.body.getCollisionObservable().add(bodyCollideCB);

                setTimeout(() => {
                    freesbe.dispose()
                }, 4000)
            },
            true,
        );

        const releaseLatch = new AnimationEvent(
            140,
            () => {
                throwAirFreesbeAnimation.latched = false;
            },
            true,
        );

        throwAirFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(particlesEffect);
        throwAirFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(airFreesbeThrow);
        throwAirFreesbeAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatch);


    }

    private bindSprintRollEvents() {

        const sprintRollAnimation = this.animtionContainer.getAnimationByName(AnimationEnums.sprinting_roll);

        const releaseLatch = new AnimationEvent(
            72,
            () => {
                sprintRollAnimation.latched = false;
            },
            true,
        );

        sprintRollAnimation.animation.targetedAnimations[0].animation.addEvent(releaseLatch);
    }
}