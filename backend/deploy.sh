#!/bin/bash
set -e

# ============================================================
# StorySpark — Automated GCP Deployment Script
# Run: chmod +x deploy.sh && ./deploy.sh
# ============================================================

PROJECT_ID="storyspark-ai"
REGION="us-central1"
BACKEND_SERVICE="storyspark-backend"
FRONTEND_SERVICE="storyspark-frontend"
BUCKET_NAME="storyspark-uploads"
IMAGE_NAME="gcr.io/$PROJECT_ID/$BACKEND_SERVICE"

echo "🚀 Deploying StorySpark to Google Cloud..."
echo "Project: $PROJECT_ID | Region: $REGION"

# Set project
gcloud config set project $PROJECT_ID

# Enable APIs
echo "📡 Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com \
  --quiet

# Create GCS bucket for uploads
echo "🪣 Creating storage bucket..."
gsutil mb -p $PROJECT_ID -l $REGION gs://$BUCKET_NAME 2>/dev/null || echo "Bucket already exists"
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Build and push backend
echo "🏗️ Building backend Docker image..."
cd backend
gcloud builds submit --tag $IMAGE_NAME --quiet
cd ..

# Deploy backend to Cloud Run
echo "☁️ Deploying backend to Cloud Run..."
gcloud run deploy $BACKEND_SERVICE \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --set-env-vars "GCP_PROJECT=$PROJECT_ID,GCP_LOCATION=$REGION,GCS_BUCKET=$BUCKET_NAME" \
  --set-secrets "GEMINI_API_KEY=gemini-api-key:latest" \
  --quiet

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

echo "✅ Backend deployed: $BACKEND_URL"

# Build frontend
echo "⚛️ Building React frontend..."
cd frontend
echo "VITE_API_URL=$BACKEND_URL" > .env.production
npm install --quiet
npm run build --quiet

# Deploy frontend to Cloud Run
echo "🌐 Deploying frontend to Cloud Run..."
cat > Dockerfile.frontend << EOF
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

cat > nginx.conf << EOF
server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE --file Dockerfile.frontend --quiet

gcloud run deploy $FRONTEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --quiet

FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --format 'value(status.url)')

cd ..

echo ""
echo "🎉 ============================================="
echo "   StorySpark deployed successfully!"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo "   Project:  $PROJECT_ID"
echo "============================================="
