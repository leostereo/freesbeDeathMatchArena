import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsBody, PhysicsMotionType, PhysicsPrestepType, PhysicsShapeBox, PhysicsShapeSphere, PhysicsShapeType } from "@babylonjs/core/Physics/";
import { GridMaterial } from "@babylonjs/materials";
import { Color3, GlowLayer, HighlightLayer, Mesh, Quaternion, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { PlatformClass } from "@/shared/class/PlatformsClass";
import { ProceduralLevelClass } from "./proceduralLevel/ProceduralLevelClass";

interface PlatformData {
  name: string;
  height: number;
  width: number;
  size: number;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  ang_x: number;
  ang_y: number;
  ang_z: number;
}

export class Ground {

  private emissiveBlue: StandardMaterial;
  private platformClass: PlatformClass;
  private proceduralLevel: ProceduralLevelClass;

  constructor(private scene: Scene) {
    this.scene = scene;

    this.emissiveBlue = new StandardMaterial("material", this.scene);
    this.emissiveBlue.emissiveColor = Color3.Blue();
    this.proceduralLevel = new ProceduralLevelClass();

    this._createGround();
    //this._createElevators();
    //this.createWalls();
    //this.platformClass = new PlatformClass(this.scene);
    //this.platformClass.buildPlatforms();

  }

  _createGround(): void {
    const mesh = MeshBuilder.CreateGround("ground", { width: 60, height: 80 }, this.scene);
    //mesh.material = new GridMaterial('groundMaterial', this.scene);
    const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.emissiveColor = Color3.Black();
    mesh.material = groundMaterial;
    mesh.visibility = 0.3;
    mesh.checkCollisions = true;

    const groundAgg = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    groundAgg.shape.material = { friction: 1 }

  }

  _createElevators(): void {
    const elevator1 = MeshBuilder.CreateCylinder('elevator1', { diameter: 5, height: 0.2 })
    elevator1.position = new Vector3(-27, 0, 37)
    elevator1.material = this.emissiveBlue;

    const elevator2 = elevator1.clone('elevator2')
    const elevator3 = elevator1.clone('elevator3')
    const elevator4 = elevator1.clone('elevator4')
    elevator2.position = new Vector3(-27, 0, -37)
    elevator3.position = new Vector3(17, 0, -37)
    elevator4.position = new Vector3(17, 0, 37)

    const elevatorAg1 = new PhysicsAggregate(elevator1, PhysicsShapeType.BOX, { mass: 100, restitution: 0 });
    elevatorAg1.body.setMotionType(PhysicsMotionType.ANIMATED);
    elevatorAg1.body.setPrestepType(PhysicsPrestepType.ACTION);

    const elevatorAg2 = elevatorAg1.body.clone(elevator2);
    const elevatorAg3 = elevatorAg1.body.clone(elevator3);
    const elevatorAg4 = elevatorAg1.body.clone(elevator4);
    elevatorAg2.setMotionType(PhysicsMotionType.ANIMATED);
    elevatorAg2.setPrestepType(PhysicsPrestepType.ACTION);
    elevatorAg3.setMotionType(PhysicsMotionType.ANIMATED);
    elevatorAg3.setPrestepType(PhysicsPrestepType.ACTION);
    elevatorAg4.setMotionType(PhysicsMotionType.ANIMATED);
    elevatorAg4.setPrestepType(PhysicsPrestepType.ACTION);


    var t = 0;

    this.scene.onBeforeRenderObservable.add(() => {
      elevator1.position.y = 10 + Math.sin(t) * 10;
      elevator2.position.y = 10 + Math.sin(t + 100) * 10;
      elevator3.position.y = 10 + Math.sin(t + 200) * 10;
      elevator4.position.y = 10 + Math.sin(t + 300) * 10;
      t += 0.02;
    });

  }

  _createElevatorWithTriegger(): void {
    const platform = MeshBuilder.CreateBox('plat', { width: 25, height: 0.2, depth: 25 })
    platform.position = new Vector3(10, 10, 40)
    const platformAg = new PhysicsAggregate(platform, PhysicsShapeType.BOX, { mass: 100, restitution: 0 });

    platformAg.body.setMotionType(PhysicsMotionType.ANIMATED);
    platformAg.body.setPrestepType(PhysicsPrestepType.ACTION);

    const platforTrigger = MeshBuilder.CreateBox('trigger', { width: 25, height: 6, depth: 25 })
    platforTrigger.isVisible = false;
    platforTrigger.parent = platform
    const platformAgTrigger = new PhysicsAggregate(platforTrigger, PhysicsShapeType.BOX, { mass: 100, restitution: 0 });

    platformAgTrigger.body.setMotionType(PhysicsMotionType.ANIMATED);
    platformAgTrigger.body.setPrestepType(PhysicsPrestepType.ACTION);
    platformAgTrigger.shape.isTrigger = true;

    var t = 0;

    this.scene.onBeforeRenderObservable.add(() => {
      platform.position.y = 10 + Math.sin(t) * 14;
      t += 0.02;
    });



  }

  private addPhysicsAggregate(meshe: Mesh) {
    const res = new PhysicsAggregate(
      meshe,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 0.9 },
      this.scene
    );
    // this.physicsViewer.showBody(res.body);
    return res;
  }

  private createWalls() {
    const back_wall = MeshBuilder.CreateBox('backWall', { depth: 80, width: 1, height: 20 })
    back_wall.checkCollisions = true;


    back_wall.position = new Vector3(-30, 10, 0)
    const left_wall = MeshBuilder.CreateBox('backWall', { depth: 1, width: 60, height: 20 })
    left_wall.position = new Vector3(0, 10, -40)
    const right_wall = MeshBuilder.CreateBox('backWall', { depth: 1, width: 60, height: 20 })
    right_wall.position = new Vector3(0, 10, 40)
    // this.addPhysicsAggregate(back_wall);
    // this.addPhysicsAggregate(left_wall);
    // this.addPhysicsAggregate(right_wall);

    back_wall.renderOutline = true;
    back_wall.outlineColor = Color3.Blue();
    back_wall.outlineWidth = 0.3;
    back_wall.visibility = 0.3;
    left_wall.renderOutline = true;
    left_wall.outlineColor = Color3.Blue();
    left_wall.outlineWidth = 0.3;
    left_wall.visibility = 0.3;
    right_wall.renderOutline = true;
    right_wall.outlineColor = Color3.Blue();
    right_wall.outlineWidth = 0.3;
    right_wall.visibility = 0.3;


    //degub objects

    const box = MeshBuilder.CreateBox('box', { size: 10 });
    box.position = new Vector3(5, 0, -10);
    box.checkCollisions = true

    const boxAgg = new PhysicsAggregate(box,
      PhysicsShapeType.BOX,
      { mass: 0, friction: 0.9 },
      this.scene
    );

    const box2 = MeshBuilder.CreateBox('box2', { height: 1, depth: 60, width: 20 });
    box2.position = new Vector3(-20, 10, -10);
    box2.rotation = new Vector3(-145, 0, 0);
    box2.checkCollisions = true

  }

}
