import { fileURLToPath, URL } from 'url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Function to read canister IDs
function readCanisterIds(localCanisterIdsPath, productionCanisterIdsPath) {
  let canisterIds;
  
  try {
    const localCanisterIds = JSON.parse(readFileSync(localCanisterIdsPath, 'utf8'));
    canisterIds = localCanisterIds;
  } catch (error) {
    console.log('No local canister_ids.json found. Trying production...');
  }

  if (!canisterIds) {
    try {
      const productionCanisterIds = JSON.parse(readFileSync(productionCanisterIdsPath, 'utf8'));
      canisterIds = productionCanisterIds;
    } catch (error) {
      console.log('No production canister_ids.json found.');
    }
  }

  return canisterIds;
}

// Determine network
const network = process.env.DFX_NETWORK || 'local';

// Read canister IDs
const localCanisterIdsPath = resolve('.dfx/local/canister_ids.json');
const productionCanisterIdsPath = resolve('canister_ids.json');
const canisterIds = readCanisterIds(localCanisterIdsPath, productionCanisterIdsPath);

// Create environment variables for canister IDs
const canisterIdEnvVars = {};
if (canisterIds) {
  Object.keys(canisterIds).forEach(canisterName => {
    const envVarName = canisterName.toUpperCase() + '_CANISTER_ID';
    canisterIdEnvVars[envVarName] = canisterIds[canisterName][network];
  });
}

export default defineConfig({
  build: {
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
  define: {
    global: 'globalThis',
    'import.meta.env.VITE_NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'import.meta.env.VITE_DFX_NETWORK': JSON.stringify(network),
  },
});
