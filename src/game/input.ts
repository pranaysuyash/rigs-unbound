import {
  IDLE_INPUT,
  type ContinuousAction,
  type InputFrame,
} from "./contracts";

export type ControlParadigm = "heading-relative" | "screen-relative" | "twin-stick";

export interface PointerAimState {
  screenX: number;
  screenY: number;
  worldAngleRad: number; // Aim angle in world space (0 = North, PI/2 = East, etc.)
  active: boolean;
}

export interface TopDownInputFrame extends InputFrame {
  controlParadigm: ControlParadigm;
  aimAngleRad?: number;
  screenVectorX?: number; // Normalized screen input X (-1 to 1)
  screenVectorZ?: number; // Normalized screen input Z (-1 to 1)
}

const KEY_ACTIONS: Readonly<Record<string, ContinuousAction>> = {
  KeyW: "accelerate",
  ArrowUp: "accelerate",
  KeyS: "brake",
  ArrowDown: "brake",
  KeyA: "steerLeft",
  ArrowLeft: "steerLeft",
  KeyD: "steerRight",
  ArrowRight: "steerRight",
};

export class InputController {
  private readonly held = new Set<ContinuousAction>();
  private enabled = true;
  private paradigm: ControlParadigm = "heading-relative";
  private pointerAim: PointerAimState = {
    screenX: 0,
    screenY: 0,
    worldAngleRad: 0,
    active: false,
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.enabled) return;
    const action = KEY_ACTIONS[event.code];
    if (action) {
      event.preventDefault();
      this.held.add(action);
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    const action = KEY_ACTIONS[event.code];
    if (action) {
      event.preventDefault();
      this.held.delete(action);
    }
  };

  private readonly onBlur = (): void => {
    this.held.clear();
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.enabled) return;
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    const cx = width / 2;
    const cy = height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    
    this.pointerAim.screenX = event.clientX;
    this.pointerAim.screenY = event.clientY;
    // Calculate 2D aim angle relative to screen center (0 rad = up / north)
    this.pointerAim.worldAngleRad = Math.atan2(dx, -dy);
    this.pointerAim.active = true;
  };

  private gyroEnabled = false;
  private gyroTilt = 0;

  private readonly onDeviceOrientation = (
    event: DeviceOrientationEvent,
  ): void => {
    if (!this.gyroEnabled || !this.enabled || event.gamma === null) return;
    this.gyroTilt = event.gamma; // Left/Right roll tilt in degrees

    const DEADZONE = 3.5;
    if (this.gyroTilt < -DEADZONE) {
      this.held.add("steerLeft");
      this.held.delete("steerRight");
    } else if (this.gyroTilt > DEADZONE) {
      this.held.add("steerRight");
      this.held.delete("steerLeft");
    }
  };

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    window.addEventListener("mousemove", this.onMouseMove);
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", this.onDeviceOrientation);
    }
  }

  setControlParadigm(paradigm: ControlParadigm): void {
    this.paradigm = paradigm;
  }

  getControlParadigm(): ControlParadigm {
    return this.paradigm;
  }

  getPointerAim(): PointerAimState {
    return { ...this.pointerAim };
  }

  setGyroEnabled(enabled: boolean): void {
    this.gyroEnabled = enabled;
  }

  hold(action: ContinuousAction, active: boolean): void {
    if (!this.enabled) {
      this.held.delete(action);
      return;
    }
    if (active) {
      this.held.add(action);
    } else {
      this.held.delete(action);
    }
  }

  sample(): InputFrame {
    if (!this.enabled) return { ...IDLE_INPUT };
    const gamepad = navigator.getGamepads?.()[0];
    const gamepadX = gamepad?.axes[0] ?? 0;
    const accelerate =
      (gamepad?.buttons[7]?.value ?? 0) > 0.12 ||
      (gamepad?.axes[5] ?? 0) < -0.25;
    const brake =
      (gamepad?.buttons[6]?.value ?? 0) > 0.12 ||
      (gamepad?.axes[5] ?? 0) > 0.25;

    return {
      accelerate: this.held.has("accelerate") || accelerate,
      brake: this.held.has("brake") || brake,
      steerLeft: this.held.has("steerLeft") || gamepadX < -0.22,
      steerRight: this.held.has("steerRight") || gamepadX > 0.22,
    };
  }

  /**
   * Samples top-down inputs incorporating the active control paradigm and current vehicle yaw.
   * Translates screen-relative inputs into vehicle heading commands when in screen-relative mode.
   */
  sampleTopDownInput(currentYawRad: number = 0): TopDownInputFrame {
    const rawFrame = this.sample();
    if (this.paradigm === "heading-relative") {
      return {
        ...rawFrame,
        controlParadigm: "heading-relative",
      };
    }

    // Calculate raw screen input vector (World coordinates: -Z is Screen UP, +X is Screen RIGHT)
    let vecX = 0;
    let vecZ = 0;
    if (rawFrame.accelerate) vecZ -= 1;
    if (rawFrame.brake) vecZ += 1;
    if (rawFrame.steerLeft) vecX -= 1;
    if (rawFrame.steerRight) vecX += 1;

    const len = Math.hypot(vecX, vecZ);
    if (len > 0) {
      vecX /= len;
      vecZ /= len;
    }

    if (this.paradigm === "screen-relative") {
      if (len === 0) {
        return {
          ...rawFrame,
          controlParadigm: "screen-relative",
          screenVectorX: 0,
          screenVectorZ: 0,
        };
      }

      // Desired target angle in world space (0 rad = -Z / North)
      const targetAngleRad = Math.atan2(vecX, -vecZ);
      // Normalized angle difference between vehicle yaw and target angle
      let angleDiff = targetAngleRad - currentYawRad;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Convert angle diff into steer and throttle commands
      const TOLERANCE = 0.15;
      const steerLeft = angleDiff < -TOLERANCE;
      const steerRight = angleDiff > TOLERANCE;
      const accelerate = Math.abs(angleDiff) < Math.PI * 0.75;
      const brake = Math.abs(angleDiff) >= Math.PI * 0.75;

      return {
        accelerate,
        brake,
        steerLeft,
        steerRight,
        controlParadigm: "screen-relative",
        screenVectorX: vecX,
        screenVectorZ: vecZ,
      };
    }

    // Twin-stick mode: translation input + aim angle
    const gamepad = navigator.getGamepads?.()[0];
    let aimAngle = this.pointerAim.worldAngleRad;
    const rx = gamepad?.axes[2] ?? 0;
    const ry = gamepad?.axes[3] ?? 0;
    if (gamepad && (Math.abs(rx) > 0.2 || Math.abs(ry) > 0.2)) {
      aimAngle = Math.atan2(rx, -ry);
    }

    return {
      ...rawFrame,
      controlParadigm: "twin-stick",
      aimAngleRad: aimAngle,
      screenVectorX: vecX,
      screenVectorZ: vecZ,
    };
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.held.clear();
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    window.removeEventListener("mousemove", this.onMouseMove);
  }
}
