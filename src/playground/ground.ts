import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PhysicsAggregate } from "@babylonjs/core/Physics/v2/physicsAggregate";
import { PhysicsMotionType, PhysicsShapeType } from "@babylonjs/core/Physics/";
import { GridMaterial } from "@babylonjs/materials";
import { Mesh, Vector3 } from "@babylonjs/core";

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
  constructor(private scene: Scene) {
    this.scene = scene;
    this._createGround();
    this._createElevator();
    this._generateRandomPlatforms();
  }

  _createGround(): void {
    const mesh = MeshBuilder.CreateGround("ground", { width: 60, height: 260 }, this.scene);
    mesh.material = new GridMaterial('groundMaterial', this.scene);
    new PhysicsAggregate(mesh, PhysicsShapeType.BOX, { mass: 0 }, this.scene);
  }

  _createSphere(): void {
    const mesh = MeshBuilder.CreateSphere("sphere", { diameter: 2, segments: 32 }, this.scene);
    mesh.position.y = 10;

    new PhysicsAggregate(mesh, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, this.scene);
  }

  _createElevator(): void {
   


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
}
