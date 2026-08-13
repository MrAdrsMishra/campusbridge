// Load environment variables from the monorepo-root .env BEFORE any other module is imported,
// so values like MONGODB_URI / JWT_SECRET are available when module decorators evaluate them.
//
// __dirname is apps/api/src (ts-node) or apps/api/dist (build) — both exactly 3 levels below the
// repository root, so ../../../.env always resolves to the root .env regardless of cwd.
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../../../.env") });