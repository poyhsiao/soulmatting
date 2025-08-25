# Trivy Security Policy for SoulMatting Platform
# 
# This Rego policy file defines custom security rules and policies
# for container and application security scanning.
# 
# Version: 1.0.0
# Created: 2024-01-20
# Updated: 2024-01-20
# Author: Kim Hsiao

package trivy

import rego.v1

# =============================================================================
# VULNERABILITY POLICIES
# =============================================================================

# Ignore vulnerabilities in development dependencies
ignore contains result if {
    input.PkgType == "npm"
    input.PkgPath contains "node_modules"
    input.PkgName in dev_dependencies
    input.Severity in ["LOW", "MEDIUM"]
    result := {
        "reason": "Development dependency with acceptable risk",
        "expires": "2024-12-31"
    }
}

# Development dependencies that can have lower security requirements
dev_dependencies := {
    "@types/node",
    "@types/react",
    "@types/jest",
    "eslint",
    "prettier",
    "typescript",
    "webpack",
    "webpack-dev-server",
    "jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "nodemon",
    "ts-node",
    "concurrently",
    "cross-env"
}

# Ignore specific CVEs that are false positives or acceptable risks
ignore contains result if {
    input.VulnerabilityID in acceptable_cves
    result := {
        "reason": "Acceptable risk or false positive",
        "expires": "2024-06-30"
    }
}

acceptable_cves := {
    # Add specific CVE IDs here after security review
    # "CVE-2023-12345",  # Example: False positive in lodash
}

# Ignore vulnerabilities in base OS packages for specific images
ignore contains result if {
    input.Type == "os"
    input.Class == "os-pkgs"
    input.Target contains "node:"
    input.Severity == "LOW"
    result := {
        "reason": "Low severity OS package vulnerability in Node.js base image",
        "expires": "2024-03-31"
    }
}

# =============================================================================
# SECRET DETECTION POLICIES
# =============================================================================

# Ignore secrets in test files
ignore contains result if {
    input.Type == "secret"
    secret_in_test_file
    result := {
        "reason": "Test file with mock secrets",
        "expires": "2025-01-01"
    }
}

secret_in_test_file if {
    input.Target contains "test"
}

secret_in_test_file if {
    input.Target contains "spec"
}

secret_in_test_file if {
    input.Target contains "__tests__"
}

secret_in_test_file if {
    input.Target contains ".test."
}

secret_in_test_file if {
    input.Target contains ".spec."
}

# Ignore example environment files
ignore contains result if {
    input.Type == "secret"
    example_env_file
    result := {
        "reason": "Example environment file",
        "expires": "2025-01-01"
    }
}

example_env_file if {
    input.Target contains ".env.example"
}

example_env_file if {
    input.Target contains ".env.template"
}

example_env_file if {
    input.Target contains ".env.sample"
}

# =============================================================================
# CONFIGURATION POLICIES
# =============================================================================

# Ignore configuration issues in development files
ignore contains result if {
    input.Type == "config"
    dev_config_file
    input.Severity in ["LOW", "MEDIUM"]
    result := {
        "reason": "Development configuration file",
        "expires": "2024-12-31"
    }
}

dev_config_file if {
    input.Target contains "docker-compose.dev.yml"
}

dev_config_file if {
    input.Target contains "Dockerfile.dev"
}

dev_config_file if {
    input.Target contains "webpack.dev.js"
}

dev_config_file if {
    input.Target contains "vite.config.dev.js"
}

# Allow specific Dockerfile practices in development
ignore contains result if {
    input.Type == "config"
    input.AVDID == "AVD-DS-0001"  # Running as root
    input.Target contains "Dockerfile.dev"
    result := {
        "reason": "Development Dockerfile allows root for convenience",
        "expires": "2024-12-31"
    }
}

# =============================================================================
# LICENSE POLICIES
# =============================================================================

# Allow specific licenses for development dependencies
ignore contains result if {
    input.Type == "license"
    input.PkgType == "npm"
    input.LicenseCategory == "restricted"
    input.PkgName in allowed_restricted_licenses
    result := {
        "reason": "Allowed restricted license for development dependency",
        "expires": "2024-12-31"
    }
}

allowed_restricted_licenses := {
    # Add packages with restricted licenses that are acceptable
    # "some-dev-package",
}

# =============================================================================
# SEVERITY ESCALATION POLICIES
# =============================================================================

# Escalate severity for critical production dependencies
escalate contains result if {
    input.PkgType == "npm"
    input.PkgName in critical_production_deps
    input.Severity == "MEDIUM"
    result := {
        "severity": "HIGH",
        "reason": "Critical production dependency"
    }
}

critical_production_deps := {
    "express",
    "fastify",
    "react",
    "next",
    "@nestjs/core",
    "@supabase/supabase-js",
    "jsonwebtoken",
    "bcrypt",
    "helmet",
    "cors"
}

# Escalate severity for authentication-related vulnerabilities
escalate contains result if {
    auth_related_vulnerability
    input.Severity in ["LOW", "MEDIUM"]
    result := {
        "severity": "HIGH",
        "reason": "Authentication-related vulnerability"
    }
}

auth_related_vulnerability if {
    contains(lower(input.Title), "authentication")
}

auth_related_vulnerability if {
    contains(lower(input.Title), "authorization")
}

auth_related_vulnerability if {
    contains(lower(input.Title), "jwt")
}

auth_related_vulnerability if {
    contains(lower(input.Title), "session")
}

auth_related_vulnerability if {
    contains(lower(input.Title), "token")
}

# =============================================================================
# CUSTOM RULES
# =============================================================================

# Flag vulnerabilities in image processing libraries
flag contains result if {
    input.PkgName in image_processing_libs
    input.Severity in ["MEDIUM", "HIGH", "CRITICAL"]
    result := {
        "priority": "high",
        "reason": "Image processing library vulnerability - critical for SoulMatting"
    }
}

image_processing_libs := {
    "sharp",
    "jimp",
    "canvas",
    "imagemin",
    "multer",
    "formidable"
}

# Flag vulnerabilities in real-time communication libraries
flag contains result if {
    input.PkgName in realtime_libs
    input.Severity in ["MEDIUM", "HIGH", "CRITICAL"]
    result := {
        "priority": "high",
        "reason": "Real-time communication library vulnerability"
    }
}

realtime_libs := {
    "socket.io",
    "ws",
    "uws",
    "@supabase/realtime-js"
}

# Flag vulnerabilities in payment processing libraries
flag contains result if {
    input.PkgName in payment_libs
    result := {
        "priority": "critical",
        "reason": "Payment processing library vulnerability - immediate attention required"
    }
}

payment_libs := {
    "stripe",
    "paypal",
    "square",
    "braintree"
}

# =============================================================================
# ENVIRONMENT-SPECIFIC POLICIES
# =============================================================================

# Production environment - stricter policies
ignore contains result if {
    input.Environment == "production"
    input.Severity == "LOW"
    false  # Never ignore any vulnerabilities in production
}

# Development environment - more lenient policies
ignore contains result if {
    input.Environment == "development"
    input.Severity == "LOW"
    not critical_production_deps[input.PkgName]
    result := {
        "reason": "Low severity vulnerability in development environment",
        "expires": "2024-12-31"
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

# Check if a string contains another string (case-insensitive)
contains(haystack, needle) if {
    contains(lower(haystack), lower(needle))
}

# Convert string to lowercase
lower(s) := lower(s)

# Check if current date is before expiration
not_expired(expires) if {
    # This would need to be implemented with actual date comparison
    # For now, assume all policies are valid
    true
}

# =============================================================================
# POLICY METADATA
# =============================================================================

metadata := {
    "name": "SoulMatting Security Policy",
    "version": "1.0.0",
    "description": "Custom security policies for the SoulMatting platform",
    "author": "Kim Hsiao",
    "created": "2024-01-20",
    "updated": "2024-01-20",
    "contact": "security@soulmatting.com"
}