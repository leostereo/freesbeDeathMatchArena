import { IPlayerData } from "@/shared/class/PlayerData";
import { AbstractMesh, Color3, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, StandardMaterial, Vector } from "@babylonjs/core";

export class FreesbeManager {

    private color:Color3;
    private material : StandardMaterial;
    
    constructor(private scene:Scene,playerData:IPlayerData){
        this.color = playerData.color
        this.material = new StandardMaterial("freesbe_material", this.scene);
        this.material.emissiveColor = this.color;
    }

    public thowFreesbe(displayMesh:AbstractMesh){

                    const freesbe = MeshBuilder.CreateCylinder('freesbe', { diameter: 1, height: 0.1 })
                    freesbe.material = this.material
                    freesbe.position = displayMesh.position.clone();
                    freesbe.position.addInPlace(displayMesh.forward.scale(3))
                    var freesbeAggregate = new PhysicsAggregate(freesbe, PhysicsShapeType.SPHERE, { mass: 10, restitution: 0.75 }, this.scene);
                    freesbeAggregate.body.applyImpulse(displayMesh.forward.scale(1500), freesbe.absolutePosition);
                    // freesbeAggregate.body.setCollisionCallbackEnabled(true)
                    // freesbeAggregate.body.getCollisionObservable().add(bodyCollideCB);
    
                    setTimeout(() => {
                        freesbe.dispose()
                    }, 4000)

    }
}