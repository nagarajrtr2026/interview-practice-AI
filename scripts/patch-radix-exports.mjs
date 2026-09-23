import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const exportsByPackage = {
  "react-use-callback-ref": ["useCallbackRef"],
  "react-use-controllable-state": ["useControllableState", "useControllableStateReducer"],
  "react-use-effect-event": ["useEffectEvent"],
  "react-use-is-hydrated": ["useIsHydrated"],
  "react-use-layout-effect": ["useLayoutEffect"],
  "react-use-previous": ["usePrevious"],
  "react-use-rect": ["useRect"],
  "react-use-size": ["useSize"],
};

for (const [name, exports] of Object.entries(exportsByPackage)) {
  const directory = join("node_modules", "@radix-ui", name, "dist");
  const esmEntry = join(directory, "index.mjs");
  if (existsSync(directory)) {
    writeFileSync(
      esmEntry,
      `import pkg from "./index.js";\nexport const { ${exports.join(", ")} } = pkg;\n`,
    );
  }
}
