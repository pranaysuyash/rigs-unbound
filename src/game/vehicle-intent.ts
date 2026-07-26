/**
 * Semantic control intent shared by physics-backed vehicle controllers.
 *
 * No key codes, gamepad buttons, solver forces, or renderer state belong here.
 * Input adapters produce this record; rig controllers interpret it.
 */
export interface VehicleIntent {
  throttle: number;
  /** Signed player intent: positive is left, negative is right. */
  steering: number;
  brake: number;
  handbrake: number;
  primaryTool: number;
  secondaryTool: number;
  stabilise: boolean;
  boost: boolean;
}

export const IDLE_VEHICLE_INTENT: Readonly<VehicleIntent> = {
  throttle: 0,
  steering: 0,
  brake: 0,
  handbrake: 0,
  primaryTool: 0,
  secondaryTool: 0,
  stabilise: false,
  boost: false,
};

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Treat browser/controller input as untrusted.
 *
 * Invalid axes fail to neutral instead of becoming NaN inside a fixed-step
 * simulation. Boolean flags require literal `true` so stringly DOM values do
 * not accidentally enable assists or boost.
 */
export function normalizeVehicleIntent(
  value: Partial<VehicleIntent> | null | undefined,
): VehicleIntent {
  return {
    throttle: clamp(finiteOr(value?.throttle, 0), -1, 1),
    steering: clamp(finiteOr(value?.steering, 0), -1, 1),
    brake: clamp(finiteOr(value?.brake, 0), 0, 1),
    handbrake: clamp(finiteOr(value?.handbrake, 0), 0, 1),
    primaryTool: clamp(finiteOr(value?.primaryTool, 0), 0, 1),
    secondaryTool: clamp(finiteOr(value?.secondaryTool, 0), 0, 1),
    stabilise: value?.stabilise === true,
    boost: value?.boost === true,
  };
}
