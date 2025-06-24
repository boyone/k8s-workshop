# Lab 01: Pods

## Build Image

- Build version 0.0.1

  ```sh
  cd src
  docker build -t hello-api:0.0.1 .
  ```

- Build version 0.0.2

  ```diff
  # src/routes/helloRoutes.js
  function hello(req, res) {
    res.json({
      message: 'Hello, World!',
  -   version: '0.0.1',
  +   version: '0.0.2',
      hostname: os.hostname(),
    });
  }
  ```

    ```sh
  docker build -t hello-api:0.0.2 .
  ```

## Create Cluster

```sh
kind create cluster
```

## Create Pod

### Pod Manifest

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-api
  labels:
    app: hello-api
    version: "0.0.1"
    type: api
spec:
  containers:
    - name: hello-api
      image: hello-api:0.0.1
      ports:
      - containerPort: 3000
```

### Create Pod By Pod's Manifest

```sh
kubectl apply -f pod.hello-api.yml
```

### Display pod

```sh
kubectl get pod
```

### Load Image To Kind Cluster

```sh
kind load docker-image hello-api:0.0.1
kind load docker-image hello-api:0.0.2
```

### List Image In Kind Cluster

```sh
docker exec -it kind-control-plane crictl images
```

### Delete Pod From Kind Cluster

```sh
kubectl delete -f pod.hello-api.yml
```

### Create Pod

```sh
kubectl apply -f pod.hello-api.yml
```

### Display Pod

```sh
kubectl get pod
kubectl get pod -o wide
kubectl get pod hello-api
kubectl get pod hello-api -o yaml
kubectl describe pod hello-api
kubectl get events
```

## Call `api/hello`

```sh
kubectl run --image=curlimages/curl -it --restart=Never --rm client-pod curl <POD IP>:3000/api/hello
```

### Port-Forward

```sh
kubectl port-forward pod/hello-api 3000:3000
```

```sh
curl localhost:3000/api/hello
```

```sh
kubectl logs hello-api
```

## Delete Pods

```sh
kubectl delete -f pod.hello-api.yml
```