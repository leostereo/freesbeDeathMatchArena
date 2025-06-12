import { CharacterShapeOptions, Mesh, MeshBuilder, PhysicsCharacterController, Scene, TransformNode, Vector3 } from "@babylonjs/core";


export class ThirdPersonCharacterController {
    public height: number = 1.8;
    public radius: number = 0.6;
    public displayCapsule: Mesh;
    public lookTarget: Mesh;
    protected CoT: TransformNode; // Center of transformation
    public CC: PhysicsCharacterController;
    // public state: NewType;
    protected scene: Scene;
    protected isMouseDown: boolean = false;
    protected isKeyDown: boolean = false;
    protected isBlockingKeyboard: boolean = false;
    characterPosition: Vector3;
    
    constructor(scene: Scene, characterPosition:Vector3) {
        this.scene = scene;
        this.characterPosition = characterPosition;

        this.CoT = new TransformNode("CC-CoT", scene)
        this.CoT.position = characterPosition;
    
        this.lookTarget = MeshBuilder.CreateLines("CC-lookTarget", {
            points: [
                new Vector3(0, 0, 0),
                new Vector3(0, 0, 0),
            ], // Two points coincide to form a zero-length line segment
        }, scene);

        this.lookTarget.isVisible = false;
        this.lookTarget.isPickable = false;
        this.lookTarget.position = Vector3.Zero();
        this.lookTarget.parent = this.CoT;

        // Physics shape for the character
        this.displayCapsule = MeshBuilder.CreateCapsule("CC-capsule", { height: this.height, radius: this.radius }, this.scene);
        this.displayCapsule.position = Vector3.Zero();
        this.displayCapsule.parent = this.CoT;
        const shapeOptions: CharacterShapeOptions = {
            capsuleHeight: this.height,
            capsuleRadius: this.radius,
        }

        this.CC = new PhysicsCharacterController(characterPosition, shapeOptions, this.scene);
        // Player/Character state
        //this.state = new CharacterControllerState(this.CC);

    }
}