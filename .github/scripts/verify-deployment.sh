#!/bin/bash
set -e

FRONTEND_TAG=$1
BACKEND_TAG=$2
NAMESPACE=$3

echo "Verifying deployment for Frontend tag: $FRONTEND_TAG, Backend tag: $BACKEND_TAG in namespace: $NAMESPACE"

# Check if the namespace exists
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
  echo "Namespace $NAMESPACE does not exist."
  exit 1
fi

# Check if frontend pods are running with the correct image
FRONTEND_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=frontend -o jsonpath='{.items[*].spec.containers[*].image}')
if [[ $FRONTEND_PODS != *"$FRONTEND_TAG"* ]]; then
  echo "Frontend pods are not running with the correct image tag."
  echo "Expected tag: $FRONTEND_TAG"
  echo "Found tags: $FRONTEND_PODS"
  exit 1
fi

# Check if backend pods are running with the correct image
BACKEND_PODS=$(kubectl get pods -n "$NAMESPACE" -l app=backend -o jsonpath='{.items[*].spec.containers[*].image}')
if [[ $BACKEND_PODS != *"$BACKEND_TAG"* ]]; then
  echo "Backend pods are not running with the correct image tag."
  echo "Expected tag: $BACKEND_TAG"
  echo "Found tags: $BACKEND_PODS"
  exit 1
fi

# Check if all pods are running
FAILED_PODS=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running,status.phase!=Succeeded -o jsonpath='{.items[*].metadata.name}')
if [ -n "$FAILED_PODS" ]; then
  echo "Some pods are not running or have failed:"
  echo "$FAILED_PODS"
  exit 1
fi

# Check if required services are available
SERVICES=$(kubectl get services -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}')
if [[ $SERVICES != *"frontend"* ]]; then
  echo "Frontend service is not available."
  exit 1
fi
if [[ $SERVICES != *"backend"* ]]; then
  echo "Backend service is not available."
  exit 1
fi

# Check if ingress is configured
INGRESS=$(kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}')
if [ -z "$INGRESS" ]; then
  echo "Ingress is not configured."
  exit 1
fi

echo "Deployment verification completed successfully!"
