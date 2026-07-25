declare module "box3d-wasm/standard" {
  export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }

  export interface Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
  }

  export interface Transform {
    position: Vector3;
    rotation: Quaternion;
  }

  export interface DeletableHandle {
    delete(): void;
    isValid(): boolean;
  }

  export interface Shape extends DeletableHandle {
    destroy(): void;
    getAABB(): {
      lowerBound: Vector3;
      upperBound: Vector3;
    };
    setFriction(friction: number): void;
  }

  export interface Body extends DeletableHandle {
    destroy(): void;
    createBox(options: {
      halfExtents: Vector3;
      offset?: Vector3;
      rotation?: Quaternion;
      density?: number;
      friction?: number;
      restitution?: number;
    }): Shape;
    createCapsule(options: {
      height?: number;
      center1?: Vector3;
      center2?: Vector3;
      radius: number;
      density?: number;
      friction?: number;
      restitution?: number;
    }): Shape;
    getAngularVelocity(): Vector3;
    getLinearVelocity(): Vector3;
    getPosition(): Vector3;
    getRotation(): Quaternion;
    isAwake(): boolean;
    setAngularVelocity(value: Vector3): void;
    setLinearVelocity(value: Vector3): void;
    setTransform(position: Vector3, rotation: Quaternion): void;
    setAwake(awake: boolean): void;
  }

  export interface WheelJoint extends DeletableHandle {
    destroy(): void;
    enableSpinMotor(enabled: boolean): void;
    enableSteering(enabled: boolean): void;
    getSpinSpeed(): number;
    getSteeringAngle(): number;
    setMaxSpinTorque(torque: number): void;
    setMaxSteeringTorque(torque: number): void;
    setSpinMotorSpeed(speed: number): void;
    setTargetSteeringAngle(angle: number): void;
    wakeBodies(): void;
  }

  export interface World extends DeletableHandle {
    destroy(): void;
    createBody(options: {
      type: "static" | "kinematic" | "dynamic";
      position?: Vector3;
      rotation?: Quaternion;
      linearVelocity?: Vector3;
      angularDamping?: number;
      linearDamping?: number;
      enableSleep?: boolean;
      isBullet?: boolean;
      name?: string;
    }): Body;
    createWheelJoint(
      chassis: Body,
      wheel: Body,
      options: {
        localFrameA: Transform;
        localFrameB: Transform;
        collideConnected?: boolean;
        enableSuspensionSpring?: boolean;
        suspensionHertz?: number;
        suspensionDampingRatio?: number;
        enableSuspensionLimit?: boolean;
        lowerSuspensionLimit?: number;
        upperSuspensionLimit?: number;
        enableSpinMotor?: boolean;
        maxSpinTorque?: number;
        spinSpeed?: number;
        enableSteering?: boolean;
        steeringHertz?: number;
        steeringDampingRatio?: number;
        targetSteeringAngle?: number;
        maxSteeringTorque?: number;
        enableSteeringLimit?: boolean;
        lowerSteeringLimit?: number;
        upperSteeringLimit?: number;
      },
    ): WheelJoint;
    getAwakeBodyCount(): number;
    step(timeStep: number, subStepCount: number): void;
  }

  export interface Box3DModule {
    readonly threaded: false;
    readonly maxWorkers: number;
    readonly World: new (options?: {
      gravity?: Vector3;
      enableSleep?: boolean;
      enableContinuous?: boolean;
    }) => World;
  }

  export default function createBox3D(): Promise<Box3DModule>;
}
