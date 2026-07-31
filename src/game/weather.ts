/**
 * Dynamic Weather & Soil Moisture Erosion System.
 *
 * Cycles weather states (clear, overcast, rain, storm) deterministically from
 * world clock time. Rain increases soil moisture, increasing drag and reducing
 * surface grip on soft ground (grass, mud, tilled soil).
 */

export type WeatherPhase = "clear" | "overcast" | "rain" | "storm";

export interface WeatherState {
  phase: WeatherPhase;
  rainIntensity: number; // 0..1
  soilMoisture: number; // 0..1 (1 = fully saturated mud)
  fogDensity: number; // 0.003..0.015
  windVector: { x: number; z: number };
}

/** A short, actionable horizon derived from the same deterministic weather clock. */
export interface WeatherForecast {
  targetPhase: "rain" | "storm";
  minutesUntil: number;
  label: string;
}

function forecastDurationLabel(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  if (hours === 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

/**
 * Forecast the next weather pressure the player can plan around. It does not
 * predict a separate random future: rain and storm remain consequences of the
 * same cycle used by traction, machine wear, and environmental incidents.
 */
export function deriveWeatherForecast(worldTimeMinutes: number): WeatherForecast {
  const cycleMinute = ((worldTimeMinutes % 1440) + 1440) % 1440;
  if (cycleMinute >= 1200 && cycleMinute < 1320) {
    return { targetPhase: "storm", minutesUntil: 0, label: "Storm now" };
  }
  if (cycleMinute >= 1020 && cycleMinute < 1200) {
    const minutesUntil = 1200 - cycleMinute;
    return {
      targetPhase: "storm",
      minutesUntil,
      label: `Storm in ${forecastDurationLabel(minutesUntil)}`,
    };
  }
  const minutesUntil = cycleMinute < 1020
    ? 1020 - cycleMinute
    : 1440 - cycleMinute + 1020;
  return {
    targetPhase: "rain",
    minutesUntil,
    label: `Rain in ${forecastDurationLabel(minutesUntil)}`,
  };
}

/**
 * Derives current weather state deterministically from world clock minutes.
 */
export function deriveWeatherState(worldTimeMinutes: number): WeatherState {
  const cycleMinute = ((worldTimeMinutes % 1440) + 1440) % 1440; // 24-hour cycle

  // Schedule:
  // 06:00 - 14:00 (360 - 840 mins): Clear
  // 14:00 - 17:00 (840 - 1020 mins): Overcast
  // 17:00 - 20:00 (1020 - 1200 mins): Rain
  // 20:00 - 22:00 (1200 - 1320 mins): Storm
  // 22:00 - 06:00 (1320 - 360 mins): Overcast / Clear Night

  let phase: WeatherPhase = "clear";
  let rainIntensity = 0;
  let soilMoisture = 0.15;
  let fogDensity = 0.004;

  if (cycleMinute >= 840 && cycleMinute < 1020) {
    phase = "overcast";
    fogDensity = 0.007;
    soilMoisture = 0.25;
  } else if (cycleMinute >= 1020 && cycleMinute < 1200) {
    phase = "rain";
    rainIntensity = 0.65;
    soilMoisture = 0.75;
    fogDensity = 0.011;
  } else if (cycleMinute >= 1200 && cycleMinute < 1320) {
    phase = "storm";
    rainIntensity = 1.0;
    soilMoisture = 0.95;
    fogDensity = 0.015;
  } else if (cycleMinute >= 1320 || cycleMinute < 360) {
    phase = "overcast";
    soilMoisture = 0.45; // Drying out overnight
    fogDensity = 0.008;
  }

  const windAngle = (cycleMinute / 1440) * Math.PI * 2;
  const windSpeed = phase === "storm" ? 14 : phase === "rain" ? 8 : 3;

  return {
    phase,
    rainIntensity,
    soilMoisture,
    fogDensity,
    windVector: {
      x: Math.cos(windAngle) * windSpeed,
      z: Math.sin(windAngle) * windSpeed,
    },
  };
}

/**
 * Computes soil grip penalty derived from weather moisture.
 * Hardpan tracks are unaffected; soft soils lose up to 30% grip when saturated.
 */
export function applyWeatherGripPenalty(
  baseGrip: number,
  surfaceId: string,
  soilMoisture: number,
): number {
  if (surfaceId === "track" || surfaceId === "rock") {
    return baseGrip; // Hard surfaces resist moisture grip loss
  }
  const penalty = soilMoisture * 0.28;
  return Math.max(0.1, baseGrip * (1 - penalty));
}
