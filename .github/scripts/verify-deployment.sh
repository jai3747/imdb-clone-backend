# .github/scripts/verify-deployment.sh
#!/bin/bash
set -e

NAMESPACE=$1

echo "=== Helm Releases ===" 
helm list -n $NAMESPACE

echo -e "\n=== All Resources ==="
kubectl get all -n $NAMESPACE

echo -e "\n=== Pods Status ==="
kubectl get pods -n $NAMESPACE

echo -e "\n=== Services Status ==="
kubectl get svc -n $NAMESPACE

echo -e "\n=== Deployments Status ==="
kubectl get deployments -n $NAMESPACE

echo -e "\n=== Pod Logs ==="
for pod in $(kubectl get pods -n $NAMESPACE -l app=imdb-clone -o jsonpath='{.items[*].metadata.name}'); do
  echo -e "\nLogs for $pod:"
  kubectl logs -n $NAMESPACE $pod --tail=50
done
