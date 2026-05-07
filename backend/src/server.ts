import { buildApp } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();
const app = await buildApp(config);

try {
  await app.listen({ port: config.port, host: config.host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
