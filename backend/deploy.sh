#!/bin/bash

# Exit on error
set -e

# Configuration - UPDATE THESE VALUES
PROJECT_ID="your-gcp-project"
SERVICE_NAME="your-service-name"
REGION="us-central1"
REPOSITORY="your-artifact-repository"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"

echo "🚀 Starting deployment of ${SERVICE_NAME}..."

# Configure Docker for Artifact Registry
echo "🔐 Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

# Copy fonts from frontend public folder
echo "📁 Copying fonts from frontend..."
rm -rf ./fonts
cp -r ../public/fonts ./fonts

# Build the Docker image for Linux platform
echo "📦 Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t ${IMAGE_NAME}:latest .

# Push to Artifact Registry
echo "⬆️  Pushing image to Artifact Registry..."
docker push ${IMAGE_NAME}:latest

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --project ${PROJECT_ID} \
  --memory 1Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 1 \
  --set-secrets=SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest,STORAGE_ENCRYPTION_KEY=storage-encryption-key:latest \
  --set-env-vars=NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co,NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=your-bucket,CLOUD_TASKS_PROJECT=${PROJECT_ID},CLOUD_TASKS_REGION=${REGION},CLOUD_TASKS_QUEUE=pdf-generation,CLOUD_TASKS_SERVICE_URL=https://api.example.com,CLOUD_TASKS_SERVICE_ACCOUNT=cloud-tasks-invoker@${PROJECT_ID}.iam.gserviceaccount.com

echo "✅ Deployment complete!"
echo "🔗 Service URL: https://${SERVICE_NAME}-xxxxxxxxxx.${REGION}.run.app"
