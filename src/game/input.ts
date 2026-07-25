import {
  IDLE_INPUT,
  type ContinuousAction,
  type InputFrame,
} from "./contracts";

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

  constructor() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
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

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.held.clear();
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
  }
}
