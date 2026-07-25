interface AssetBinding {
  fetch(request: Request): Promise<Response>;
}

interface Environment {
  ASSETS: AssetBinding;
}

/**
 * Sites requires a Worker-compatible entrypoint. Static assets remain the
 * canonical game surface; this adapter delegates directly to that asset layer.
 */
export default {
  fetch(request: Request, environment: Environment): Promise<Response> {
    return environment.ASSETS.fetch(request);
  },
};
