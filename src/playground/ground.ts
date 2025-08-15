import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsBody, PhysicsMotionType, PhysicsPrestepType, PhysicsShapeBox, PhysicsShapeSphere, PhysicsShapeType } from "@babylonjs/core/Physics/";
import { GridMaterial } from "@babylonjs/materials";
import { Color3, GlowLayer, HighlightLayer, Mesh, Quaternion, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import { PlatformClass } from "@/shared/class/PlatformsClass";

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

  constructor(private scene: Scene) {
    this.scene = scene;

    this.emissiveBlue = new StandardMaterial("material", this.scene);
    this.emissiveBlue.emissiveColor = Color3.Blue();

    this._createGround();
    this._createElevator();
    // this._generateRandomPlatforms();
    this.createWalls();

    this.platformClass = new PlatformClass(this.scene);
    this.platformClass.buildPlatforms();

  }

  _createGround(): void {
    const mesh = MeshBuilder.CreateGround("ground", { width: 60, height: 80 }, this.scene);
    //mesh.material = new GridMaterial('groundMaterial', this.scene);
    const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
    groundMaterial.emissiveColor = Color3.Black();
    mesh.material = groundMaterial;


    //mesh.renderOutline = true;
    //mesh.outlineColor = Color3.Blue();
    //mesh.outlineWidth = 0.3;
    mesh.visibility = 0.3;

    const groundAgg = new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
    groundAgg.shape.material = { friction: 1 }

  }

  _createElevator(): void {
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

  async _generateRandomPlatforms() {
    this.createPlatForm({ name: 'plat1', size: 40, height: 1, width: 10, pos_x: 0, pos_y: 0, pos_z: -35, ang_x: 0, ang_y: 0, ang_z: 0 })
    this.createPlatForm({ name: 'plat2', size: 10, height: 1, width: 40, pos_x: -20, pos_y: 0, pos_z: -60, ang_x: 0, ang_y: 0, ang_z: 0 })
    this.createPlatForm({ name: 'plat3', size: 40, height: 1, width: 10, pos_x: -35, pos_y: 0, pos_z: -35, ang_x: 15, ang_y: 0, ang_z: 0 })
    this.createPlatForm({ name: 'plat4', size: 40, height: 1, width: 10, pos_x: -35, pos_y: 10, pos_z: 0, ang_x: 0, ang_y: 0, ang_z: 0 })
    this.createPlatForm({ name: 'plat5', size: 10, height: 1, width: 20, pos_x: -20, pos_y: 5, pos_z: 10, ang_x: 0, ang_y: 0, ang_z: -10 })
    this.createPlatForm({ name: 'plat6', size: 150, height: 1, width: 10, pos_x: 0, pos_y: 0, pos_z: 0, ang_x: -15, ang_y: 0, ang_z: 0 })
  }

  private createPlatForm(platData: PlatformData): void {
    const path = MeshBuilder.CreateBox(
      platData.name, { size: platData.size, height: platData.height, width: platData.width },
      this.scene
    );
    path.position = new Vector3(platData.pos_x, platData.pos_y, platData.pos_z);
    path.rotation = new Vector3(platData.ang_x, platData.ang_y, platData.ang_z);
    this.addPhysicsAggregate(path);

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
    back_wall.position = new Vector3(-30, 10, 0)
    const left_wall = MeshBuilder.CreateBox('backWall', { depth: 1, width: 60, height: 20 })
    left_wall.position = new Vector3(0, 10, -40)
    const right_wall = MeshBuilder.CreateBox('backWall', { depth: 1, width: 60, height: 20 })
    right_wall.position = new Vector3(0, 10, 40)
    this.addPhysicsAggregate(back_wall);
    this.addPhysicsAggregate(left_wall);
    this.addPhysicsAggregate(right_wall);

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

  }


}
