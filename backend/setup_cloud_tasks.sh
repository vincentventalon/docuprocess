#!/bin/bash
# ============================================================================
# Cloud Tasks Setup Script
# ============================================================================
# One-time setup for Cloud Tasks infrastructure.
# Run this before deploying the async PDF feature.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Cloud Tasks API enabled: gcloud services enable cloudtasks.googleapis.com
# ============================================================================

set -e

PROJECT_ID="pdftemplates"
REGION="us-central1"
QUEUE_NAME="pdf-generation"
SERVICE_NAME="pdftemplatefast-backend"
SERVICE_ACCOUNT="cloud-tasks-invoker"

echo "🚀 Setting up Cloud Tasks infrastructure..."

# 1. Enable Cloud Tasks API (if not already enabled)
echo "📦 Enabling Cloud Tasks API..."
gcloud services enable cloudtasks.googleapis.com --project=${PROJECT_ID} || true

# 2. Create service account for Cloud Tasks invoker
echo "👤 Creating service account: ${SERVICE_ACCOUNT}..."
gcloud iam service-accounts create ${SERVICE_ACCOUNT} \
    --display-name="Cloud Tasks Invoker" \
    --project=${PROJECT_ID} 2>/dev/null || echo "   Service account already exists"

# 3. Grant Cloud Run invoker permission to the service account
echo "🔐 Granting Cloud Run invoker permission..."
gcloud run services add-iam-policy-binding ${SERVICE_NAME} \
    --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.invoker" \
    --region=${REGION} \
    --project=${PROJECT_ID}

# 4. Create Cloud Tasks queue
echo "📋 Creating Cloud Tasks queue: ${QUEUE_NAME}..."
gcloud tasks queues create ${QUEUE_NAME} \
    --location=${REGION} \
    --project=${PROJECT_ID} 2>/dev/null || echo "   Queue already exists"

# 5. Configure queue settings
echo "⚙️  Configuring queue settings..."
gcloud tasks queues update ${QUEUE_NAME} \
    --location=${REGION} \
    --project=${PROJECT_ID} \
    --max-dispatches-per-second=10 \
    --max-concurrent-dispatches=10 \
    --max-attempts=3 \
    --min-backoff=10s \
    --max-backoff=300s

# 6. Get Cloud Run service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
    --region=${REGION} \
    --project=${PROJECT_ID} \
    --format="value(status.url)")

# 7. Display configuration
echo ""
echo "============================================================================"
echo "✅ Cloud Tasks setup complete!"
echo "============================================================================"
echo ""
echo "Queue: ${QUEUE_NAME}"
echo "Region: ${REGION}"
echo "Service Account: ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "Service URL: ${SERVICE_URL}"
echo ""
echo "Environment variables for deploy.sh (already configured):"
echo ""
echo "  CLOUD_TASKS_PROJECT=${PROJECT_ID}"
echo "  CLOUD_TASKS_REGION=${REGION}"
echo "  CLOUD_TASKS_QUEUE=${QUEUE_NAME}"
echo "  CLOUD_TASKS_SERVICE_URL=${SERVICE_URL}"
echo "  CLOUD_TASKS_SERVICE_ACCOUNT=${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
echo ""
echo "To verify queue:"
echo "  gcloud tasks queues describe ${QUEUE_NAME} --location=${REGION}"
echo ""
