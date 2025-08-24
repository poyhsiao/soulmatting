/**
 * ESLint Security Configuration for SoulMatting Platform
 * 
 * This configuration focuses on security-related linting rules
 * to prevent common security vulnerabilities in JavaScript/TypeScript code.
 * 
 * @version 1.0.0
 * @created 2024-01-20
 * @updated 2024-01-20
 * @author Kim Hsiao
 */

module.exports = {
  extends: [
    'plugin:security/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  plugins: [
    'security',
    'no-secrets',
    'anti-trojan-source'
  ],
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // Security plugin rules
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-require': 'warn',
    'security/detect-object-injection': 'warn',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-bidi-characters': 'error',
    
    // No secrets plugin rules
    'no-secrets/no-secrets': [
      'error',
      {
        'tolerance': 4.2,
        'additionalRegexes': {
          'AWS Access Key': 'AKIA[0-9A-Z]{16}',
          'AWS Secret Key': '[0-9a-zA-Z/+]{40}',
          'GitHub Token': 'ghp_[0-9a-zA-Z]{36}',
          'JWT Token': 'eyJ[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*',
          'API Key': '[aA][pP][iI]_?[kK][eE][yY].*[0-9a-zA-Z]{32,}',
          'Database URL': '(mongodb|mysql|postgresql|redis)://[^\s]+',
          'Private Key': '-----BEGIN [A-Z ]+PRIVATE KEY-----',
          'Supabase Key': 'eyJ[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*\.[0-9a-zA-Z_-]*',
          'Stripe Key': 'sk_[a-z]+_[0-9a-zA-Z]{24,}',
          'OpenAI Key': 'sk-[0-9a-zA-Z]{48}'
        },
        'ignoreContent': [
          'example.com',
          'localhost',
          'test@test.com',
          'password123',
          'secret123',
          'token123'
        ],
        'ignoreModules': true,
        'ignoreIdentifiers': [
          'publicKey',
          'testKey',
          'mockToken',
          'exampleSecret'
        ]
      }
    ],
    
    // Anti-trojan-source rules
    'anti-trojan-source/no-bidi': 'error',
    
    // Custom security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-proto': 'error',
    'no-iterator': 'error',
    'no-restricted-globals': [
      'error',
      {
        'name': 'eval',
        'message': 'Use of eval() is not allowed for security reasons.'
      },
      {
        'name': 'Function',
        'message': 'Use of Function constructor is not allowed for security reasons.'
      }
    ],
    
    // Prevent dangerous patterns
    'no-restricted-syntax': [
      'error',
      {
        'selector': 'CallExpression[callee.name="eval"]',
        'message': 'eval() is not allowed for security reasons.'
      },
      {
        'selector': 'NewExpression[callee.name="Function"]',
        'message': 'Function constructor is not allowed for security reasons.'
      },
      {
        'selector': 'CallExpression[callee.property.name="innerHTML"]',
        'message': 'Use of innerHTML can lead to XSS vulnerabilities. Use textContent or a sanitization library.'
      },
      {
        'selector': 'CallExpression[callee.property.name="outerHTML"]',
        'message': 'Use of outerHTML can lead to XSS vulnerabilities. Use a sanitization library.'
      },
      {
        'selector': 'CallExpression[callee.name="setTimeout"][arguments.0.type="Literal"]',
        'message': 'setTimeout with string argument can lead to code injection. Use function instead.'
      },
      {
        'selector': 'CallExpression[callee.name="setInterval"][arguments.0.type="Literal"]',
        'message': 'setInterval with string argument can lead to code injection. Use function instead.'
      }
    ],
    
    // Prevent dangerous imports
    'no-restricted-imports': [
      'error',
      {
        'patterns': [
          {
            'group': ['child_process'],
            'message': 'Use of child_process should be carefully reviewed for security implications.'
          },
          {
            'group': ['vm'],
            'message': 'Use of vm module should be carefully reviewed for security implications.'
          },
          {
            'group': ['fs'],
            'message': 'Direct file system access should be carefully reviewed. Consider using path validation.'
          }
        ]
      }
    ],
    
    // TypeScript specific security rules
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/no-unsafe-argument': 'error',
    '@typescript-eslint/restrict-template-expressions': 'error',
    '@typescript-eslint/no-base-to-string': 'error',
    
    // Prevent prototype pollution
    'no-prototype-builtins': 'error',
    
    // Prevent regex DoS
    'no-control-regex': 'error',
    'no-invalid-regexp': 'error',
    
    // Prevent timing attacks
    'no-compare-neg-zero': 'error',
    
    // Prevent information disclosure
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error'
  },
  
  overrides: [
    {
      // Relaxed rules for test files
      files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*'],
      rules: {
        'security/detect-non-literal-fs-filename': 'off',
        'security/detect-child-process': 'off',
        'no-console': 'off',
        'no-secrets/no-secrets': 'off'
      }
    },
    {
      // Relaxed rules for configuration files
      files: ['**/*.config.{js,ts}', '**/config/**/*'],
      rules: {
        'security/detect-non-literal-require': 'off',
        'no-secrets/no-secrets': 'off'
      }
    },
    {
      // Specific rules for backend API files
      files: ['apps/api/**/*', 'apps/auth-service/**/*'],
      rules: {
        'security/detect-object-injection': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'no-restricted-syntax': [
          'error',
          {
            'selector': 'CallExpression[callee.property.name="query"][arguments.0.type="TemplateLiteral"]',
            'message': 'Raw SQL queries with template literals can lead to SQL injection. Use parameterized queries.'
          },
          {
            'selector': 'CallExpression[callee.property.name="raw"][arguments.0.type="TemplateLiteral"]',
            'message': 'Raw SQL queries with template literals can lead to SQL injection. Use parameterized queries.'
          }
        ]
      }
    },
    {
      // Specific rules for frontend files
      files: ['apps/web/**/*', 'apps/mobile/**/*'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            'selector': 'CallExpression[callee.property.name="dangerouslySetInnerHTML"]',
            'message': 'dangerouslySetInnerHTML can lead to XSS vulnerabilities. Use a sanitization library.'
          },
          {
            'selector': 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
            'message': 'dangerouslySetInnerHTML can lead to XSS vulnerabilities. Use a sanitization library.'
          }
        ]
      }
    }
  ],
  
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      }
    }
  }
};