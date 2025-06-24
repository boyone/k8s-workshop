# Lab 04: Services

## Create Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: hello-api-service
spec:
  type: ClusterIP
  selector:
    app: hello-api
  ports:
    - name: http
      port: 3000
      targetPort: 3000
      protocol: TCP
```

```sh
kubectl apply -f deploy.hello-api.yml
kubectl apply -f service.hello-api.yml
```

## Display Resources

```sh
kubectl get pod
kubectl get pod -o wide
kubectl get replicasets # rs
kubectl get deployments # deploy
kubectl get service # svc
```

```sh
kubectl describe pod
kubectl describe replicasets # rs
kubectl describe deployments # deploy
kubectl describe service # svc
```

## Call Api by port-forward

```sh
kubectl port-forward service/hello-api-service 3000:3000
```
