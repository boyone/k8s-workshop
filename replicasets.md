# Lab 02: ReplicaSets

## Create ReplicaSet

- rs.hello-api.yml

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: hello-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-api
      rel: stable
  template:
    metadata:
      labels:
        app: hello-api
        rel: stable
    spec:
      containers:
        - name: hello-api
          image: hello-api:0.0.1
          ports:
            - containerPort: 3000
          imagePullPolicy: IfNotPresent
```

```sh
kind load docker-image hello-api:0.0.1

kubectl apply -f rs.hello-api.yml
```

### Display Resources

```sh
kubectl get pod
kubectl get pod -o wide
kubectl get replicasets
```

```sh
kubectl describe pod
kubectl describe replicasets
```

### Port-Forward

```sh
kubectl port-forward rs/hello-api 3000:3000
```

## Create Service

```sh
kubectl expose rs hello-api --name hello-api-service --port 3000 --target-port 3000
```

### Display Service

```sh
kubectl get service
kubectl describe service
```

### Port-Forward

```sh
kubectl port-forward service/hello-api-service 3000:3000
```

## Scale Pod via ReplicaSet

```sh
kubectl get pod
kubectl get pod -w
kubectl get pod --watch-only
```

```sh
kubectl scale rs hello-api --replicas 5
```

## Edit Manifest and Apply

- rs.hello-api.yml

```diff
...
    spec:
      containers:
      - name: hello-api
-       image: hello-api:0.0.1
+       image: hello-api:0.0.2
        ports:
        - containerPort: 3000
        imagePullPolicy: IfNotPresent
```
