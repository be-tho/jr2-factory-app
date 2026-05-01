import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dev-dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-floating-promises': 'error',
      // Legitimate patterns: pagination reset, form sync from query data, image load detection
      'react-hooks/set-state-in-effect': 'off',
      // main.tsx has no exports (app entry), constant files share non-component values
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: [
      'src/lib/supabase/client.ts',
      'src/features/admin/hooks/useAdminUsers.ts',
      'src/features/auth/pages/ForgotPasswordPage.tsx',
      'src/features/auth/pages/RegisterPage.tsx',
      'src/features/auth/pages/UpdatePasswordPage.tsx',
      'src/features/envios/pages/EditarClienteEnvioPage.tsx',
      'src/features/envios/pages/NuevoClienteEnvioPage.tsx',
      'src/features/envios/services/clientesEnvio.service.ts',
      'src/features/inventory/pages/EditarArticuloPage.tsx',
      'src/features/inventory/pages/NuevoArticuloPage.tsx',
      'src/features/inventory/services/articulo-imagenes.service.ts',
      'src/features/inventory/services/products.service.ts',
      'src/features/patterns/pages/PatronDetailPage.tsx',
      'src/features/patterns/services/patrones.service.ts',
      'src/features/production/components/CorteForm.tsx',
      'src/features/production/pages/CorteDetailPage.tsx',
      'src/features/production/pages/EditarCortePage.tsx',
      'src/features/production/pages/EditarCostureroPage.tsx',
      'src/features/production/pages/NuevoCortePage.tsx',
      'src/features/production/pages/NuevoCostureroPage.tsx',
      'src/features/production/services/costureros.service.ts',
      'src/features/sales/pages/OrdenVentaDetailPage.tsx',
      'src/features/sales/pages/VentasCheckoutPage.tsx',
      'src/features/sales/services/ordenesVenta.service.ts',
    ],
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      'no-empty': 'warn',
    },
  },
])
