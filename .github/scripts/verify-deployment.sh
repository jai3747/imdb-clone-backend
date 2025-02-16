# #!/bin/bash

# # Get parameters
# ENVIRONMENT=$1
# FRONTEND_TAG=$2
# BACKEND_TAG=$3

# # Configure kubectl
# gcloud container clusters get-credentials ${CLUSTER_NAME} \
#   --zone ${CLUSTER_ZONE} \
#   --project ${GCP_PROJECT_ID}

# # Create namespace if it doesn't exist
# kubectl create namespace ${ENVIRONMENT} --dry-run=client -o yaml | kubectl apply -f -

# # Update Helm dependencies
# helm dependency update ${CHART_PATH}

# # Create MongoDB secret
# kubectl create secret generic mongodb-secret \
#   --from-literal=mongodb-root-password=${MONGODB_ROOT_PASSWORD} \
#   --namespace ${ENVIRONMENT} \
#   --dry-run=client -o yaml | kubectl apply -f -

# # Deploy using Helm
# helm upgrade --install imdb-clone-${ENVIRONMENT} ${CHART_PATH} \
#   --namespace ${ENVIRONMENT} \
#   --set frontend.image.tag=${FRONTEND_TAG} \
#   --set backend.image.tag=${BACKEND_TAG} \
#   --set mongodb.auth.rootPassword=${MONGODB_ROOT_PASSWORD} \
#   --set environment=${ENVIRONMENT} \
#   -f ${CHART_PATH}/values-${ENVIRONMENT}.yaml \
#   --atomic \
#   --timeout 10m

# # Verify deployment
# echo "Verifying ${ENVIRONMENT} deployment..."
# kubectl get pods -n ${ENVIRONMENT}
# kubectl get services -n ${ENVIRONMENT}
# helm list -n ${ENVIRONMENT}
# .github/scripts/verify-deployment.sh
#!/bin/bash
set -e

FRONTEND_TAG=$1
BACKEND_TAG=$2
NAMESPACE=$3

echo "Verifying deployment for Frontend tag: $FRONTEND_TAG, Backend tag: $BACKEND_TAG in namespace: $NAMESPACE"

# Check if frontend pods are running with correct image
FRONTEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=frontend -o jsonpath='{.items[*].spec.containers[*].image}')
if [[ $FRONTEND_PODS != *"$FRONTEND_TAG"* ]]; then
    echo "Frontend pods are not running with the correct image tag"
    exit 1
fi

# Check if backend pods are running with correct image
BACKEND_PODS=$(kubectl get pods -n $NAMESPACE -l app=backend -o jsonpath='{.items[*].spec.containers[*].image}')
if [[ $BACKEND_PODS != *"$BACKEND_TAG"* ]]; then
    echo "Backend pods are not running with the correct image tag"
    exit 1
fi

# Check if all pods are running
FAILED_PODS=$(kubectl get pods -n $NAMESPACE --field-selector status.phase!=Running,status.phase!=Succeeded -o jsonpath='{.items[*].metadata.name}')
if [ ! -z "$FAILED_PODS" ]; then
    echo "Some pods are not running:"
    echo $FAILED_PODS
    exit 1
fi

# Check if services are available
SERVICES=$(kubectl get services -n $NAMESPACE -o name)
if [[ $SERVICES != *"frontend"* ]] || [[ $SERVICES != *"backend"* ]]; then
    echo "Required services are not available"
    exit 1
fi

# Check if ingress is configured
INGRESS=$(kubectl get ingress -n $NAMESPACE -o name)
if [ -z "$INGRESS" ]; then
    echo "Ingress is not configured"
    exit 1
fi

echo "Deployment verification completed successfully!"
