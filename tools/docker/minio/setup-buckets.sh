#!/bin/bash
# MinIO Bucket Setup Script for SoulMatting Platform
# Version: 1.0.0
# Created: 2024-01-20
# Last Updated: 2024-01-20
# Author: Kim Hsiao

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MINIO_ENDPOINT="http://minio:9000"
MINIO_ACCESS_KEY="${MINIO_ROOT_USER:-minioadmin}"
MINIO_SECRET_KEY="${MINIO_ROOT_PASSWORD:-minioadmin123}"
MC_CONFIG_DIR="/tmp/.mc"

# Buckets to create
BUCKETS=(
    "soulmatting-dev"
    "soulmatting-prod"
    "soulmatting-test"
    "soulmatting-backup"
)

# Public buckets (for public assets)
PUBLIC_BUCKETS=(
    "soulmatting-dev"
    "soulmatting-prod"
)

echo -e "${BLUE}🚀 Starting MinIO bucket setup for SoulMatting Platform...${NC}"

# Wait for MinIO to be ready
echo -e "${YELLOW}⏳ Waiting for MinIO to be ready...${NC}"
until mc --config-dir="$MC_CONFIG_DIR" ls minio > /dev/null 2>&1; do
    echo -e "${YELLOW}   MinIO not ready yet, waiting 5 seconds...${NC}"
    sleep 5
done

echo -e "${GREEN}✅ MinIO is ready!${NC}"

# Configure MinIO client
echo -e "${BLUE}🔧 Configuring MinIO client...${NC}"
mc --config-dir="$MC_CONFIG_DIR" alias set minio "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY"

# Create buckets
echo -e "${BLUE}📦 Creating buckets...${NC}"
for bucket in "${BUCKETS[@]}"; do
    if mc --config-dir="$MC_CONFIG_DIR" ls "minio/$bucket" > /dev/null 2>&1; then
        echo -e "${YELLOW}   Bucket '$bucket' already exists, skipping...${NC}"
    else
        echo -e "${GREEN}   Creating bucket '$bucket'...${NC}"
        mc --config-dir="$MC_CONFIG_DIR" mb "minio/$bucket"
        
        # Set versioning
        echo -e "${BLUE}   Enabling versioning for '$bucket'...${NC}"
        mc --config-dir="$MC_CONFIG_DIR" version enable "minio/$bucket"
        
        # Set lifecycle policy (optional)
        echo -e "${BLUE}   Setting lifecycle policy for '$bucket'...${NC}"
        cat > /tmp/lifecycle-${bucket}.json << EOF
{
    "Rules": [
        {
            "ID": "DeleteOldVersions",
            "Status": "Enabled",
            "Filter": {
                "Prefix": ""
            },
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            }
        },
        {
            "ID": "DeleteIncompleteUploads",
            "Status": "Enabled",
            "Filter": {
                "Prefix": ""
            },
            "AbortIncompleteMultipartUpload": {
                "DaysAfterInitiation": 7
            }
        }
    ]
}
EOF
        mc --config-dir="$MC_CONFIG_DIR" ilm import "minio/$bucket" < /tmp/lifecycle-${bucket}.json
        rm /tmp/lifecycle-${bucket}.json
    fi
done

# Set bucket policies
echo -e "${BLUE}🔐 Setting bucket policies...${NC}"
for bucket in "${PUBLIC_BUCKETS[@]}"; do
    echo -e "${GREEN}   Setting public read policy for '$bucket/public/*'...${NC}"
    
    # Create policy for public read access to public/ prefix
    cat > /tmp/policy-${bucket}.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": ["*"]
            },
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${bucket}/public/*"
            ]
        }
    ]
}
EOF
    
    mc --config-dir="$MC_CONFIG_DIR" policy set-json /tmp/policy-${bucket}.json "minio/$bucket"
    rm /tmp/policy-${bucket}.json
done

# Create directory structure
echo -e "${BLUE}📁 Creating directory structure...${NC}"
for bucket in "${BUCKETS[@]}"; do
    echo -e "${GREEN}   Creating directories in '$bucket'...${NC}"
    
    # Create empty objects to represent directories
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/public/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/private/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/uploads/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/avatars/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/media/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/documents/.keep"
    echo "" | mc --config-dir="$MC_CONFIG_DIR" pipe "minio/$bucket/temp/.keep"
done

# Create service user for application
echo -e "${BLUE}👤 Creating service user...${NC}"
SERVICE_ACCESS_KEY="soulmatting-service"
SERVICE_SECRET_KEY="$(openssl rand -base64 32 | tr -d '\n')"

echo -e "${GREEN}   Creating service user '$SERVICE_ACCESS_KEY'...${NC}"
mc --config-dir="$MC_CONFIG_DIR" admin user add minio "$SERVICE_ACCESS_KEY" "$SERVICE_SECRET_KEY"

# Create policy for service user
echo -e "${BLUE}📋 Creating service user policy...${NC}"
cat > /tmp/service-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
                "s3:GetBucketLocation"
            ],
            "Resource": [
                "arn:aws:s3:::soulmatting-*",
                "arn:aws:s3:::soulmatting-*/*"
            ]
        }
    ]
}
EOF

mc --config-dir="$MC_CONFIG_DIR" admin policy create minio soulmatting-service-policy /tmp/service-policy.json
mc --config-dir="$MC_CONFIG_DIR" admin policy attach minio soulmatting-service-policy --user="$SERVICE_ACCESS_KEY"
rm /tmp/service-policy.json

# Output service credentials
echo -e "${GREEN}✅ MinIO setup completed successfully!${NC}"
echo -e "${BLUE}📋 Service Credentials:${NC}"
echo -e "   Access Key: ${YELLOW}$SERVICE_ACCESS_KEY${NC}"
echo -e "   Secret Key: ${YELLOW}$SERVICE_SECRET_KEY${NC}"
echo -e "${BLUE}📦 Created Buckets:${NC}"
for bucket in "${BUCKETS[@]}"; do
    echo -e "   - ${GREEN}$bucket${NC}"
done

echo -e "${BLUE}🌐 MinIO Console: ${YELLOW}http://localhost:9001${NC}"
echo -e "${BLUE}🔗 MinIO API: ${YELLOW}http://localhost:9000${NC}"

# Save credentials to file for reference
cat > /tmp/minio-credentials.env << EOF
# MinIO Service Credentials for SoulMatting Platform
# Generated on: $(date)
# 
# Add these to your .env file:
MINIO_SERVICE_ACCESS_KEY=$SERVICE_ACCESS_KEY
MINIO_SERVICE_SECRET_KEY=$SERVICE_SECRET_KEY
EOF

echo -e "${BLUE}💾 Credentials saved to: ${YELLOW}/tmp/minio-credentials.env${NC}"
echo -e "${GREEN}🎉 Setup complete! You can now use MinIO with your SoulMatting application.${NC}"