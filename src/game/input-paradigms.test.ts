import { describe, expect, it } from "vitest";
import { InputController } from "./input";

describe("InputController top-down control paradigms", () => {
  it("defaults to heading-relative control paradigm", () => {
    const input = new InputController();
    expect(input.getControlParadigm()).toBe("heading-relative");
    const frame = input.sampleTopDownInput(0);
    expect(frame.controlParadigm).toBe("heading-relative");
    input.dispose();
  });

  it("supports switching to screen-relative mode and calculates steering towards target angle", () => {
    const input = new InputController();
    input.setControlParadigm("screen-relative");
    expect(input.getControlParadigm()).toBe("screen-relative");

    // Simulate holding W (screen UP / North)
    input.hold("accelerate", true);
    
    // Vehicle facing East (PI / 2): needs to turn Left to face North (0 rad)
    const frame = input.sampleTopDownInput(Math.PI / 2);
    expect(frame.controlParadigm).toBe("screen-relative");
    expect(frame.steerLeft).toBe(true);
    expect(frame.screenVectorX).toBe(0);
    expect(frame.screenVectorZ).toBe(-1);

    input.dispose();
  });

  it("supports twin-stick mode with aiming angles", () => {
    const input = new InputController();
    input.setControlParadigm("twin-stick");
    expect(input.getControlParadigm()).toBe("twin-stick");

    const frame = input.sampleTopDownInput(0);
    expect(frame.controlParadigm).toBe("twin-stick");
    expect(typeof frame.aimAngleRad).toBe("number");

    input.dispose();
  });
});
