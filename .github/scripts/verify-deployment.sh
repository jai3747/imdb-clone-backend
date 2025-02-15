#!/bin/bash

# Get parameters
ENVIRONMENT=$1
FRONTEND_TAG=$2
BACKEND_TAG=$3

# Configure kubectl
gcloud container clusters get-credentials ${CLUSTER_NAME} \
  --zone ${CLUSTER_ZONE} \
  --project ${GCP_PROJECT_ID}

# Create namespace if it doesn't exist
kubectl create namespace ${ENVIRONMENT} --dry-run=client -o yaml | kubectl apply -f -

# Update Helm dependencies
helm dependency update ${CHART_PATH}

# Create MongoDB secret
kubectl create secret generic mongodb-secret \
  --from-literal=mongodb-root-password=${MONGODB_ROOT_PASSWORD} \
  --namespace ${ENVIRONMENT} \
  --dry-run=client -o yaml | kubectl apply -f -

# Deploy using Helm
helm upgrade --install imdb-clone-${ENVIRONMENT} ${CHART_PATH} \
  --namespace ${ENVIRONMENT} \
  --set frontend.image.tag=${FRONTEND_TAG} \
  --set backend.image.tag=${BACKEND_TAG} \
  --set mongodb.auth.rootPassword=${MONGODB_ROOT_PASSWORD} \
  --set environment=${ENVIRONMENT} \
  -f ${CHART_PATH}/values-${ENVIRONMENT}.yaml \
  --atomic \
  --timeout 10m

# Verify deployment
echo "Verifying ${ENVIRONMENT} deployment..."
kubectl get pods -n ${ENVIRONMENT}
kubectl get services -n ${ENVIRONMENT}
helm list -n ${ENVIRONMENT}
