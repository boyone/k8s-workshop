# Lab 05: Ingress

## Create Cluster with Config

```sh
kind create cluster --config=config/kind-multi-node.yml
kind create cluster --config=config/kind-multi-node-patches.yml
```

## Setup Nginx Ingress

```sh
#no-patch
kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml

#patch
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

## Load Image To Kind Cluster

```sh
kind load docker-image hello-api:0.0.1
kind load docker-image hello-api:0.0.2
```

## Create Objects

```sh
kubectl apply -f deploy.hello-api.yml 
kubectl apply -f service.hello-api.yml 
kubectl apply -f ingress.hello-api.yml
```

## Display Resources

```sh
kubectl get pod
kubectl get pod -o wide
kubectl get replicasets # rs
kubectl get deployments # deploy
kubectl get ingress # ing
```

```sh
kubectl describe pod
kubectl describe replicasets # rs
kubectl describe deployments # deploy
kubectl describe ingress # ing
```

```sh
kubectl -n ingress-nginx get services
```

## Call `api/hello`

```sh
curl http://localhost/api/hello
```
