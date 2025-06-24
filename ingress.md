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

```yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-world-ingress
  labels:
    app: hello-world
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: 'false'
spec:
  ingressClassName: nginx
  rules:
    - host: hello-api.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-api-service
                port:
                  number: 3000
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-api-service
                port:
                  number: 3000
```

```sh
kubectl apply -f deploy.hello-api.yml
kubectl apply -f service.hello-api.yml
kubectl apply -f ingress.hello-api.yml
```

1. Understanding how the path is matched

   | PathType               | Description                                                                                        |
   | ---------------------- | -------------------------------------------------------------------------------------------------- |
   | Exact                  | The requested URL path must exactly match the path specified in the ingress rule.                  |
   | Prefix                 | The requested URL path must begin with the path specified in the ingress rule, element by element. |
   | ImplementationSpecific | Path matching depends on the implementation of the ingress controller.                             |

2. Matching paths using the Exact path type

   | Path in rule | Matches request path | Doesn’t match              |
   | ------------ | -------------------- | -------------------------- |
   | /            | /                    | /foo<br/>/bar              |
   | /foo         | /foo                 | /foo/<br/>/bar             |
   | /foo/        | /foo/                | /foo<br/>/foo/bar<br/>/bar |
   | /FOO         | /FOO                 | /foo                       |

3. Matching paths using the Prefix path type

   | Path in rule          | Matches request paths                            | Doesn’t match    |
   | --------------------- | ------------------------------------------------ | ---------------- |
   | /                     | All paths; for example:<br/>/<br/>/foo<br/>/foo/ |                  |
   | /foo<br/>or<br/>/foo/ | /foo<br/>/foo/<br/>/foo/bar                      | /foobar<br/>/bar |
   | /FOO                  | /FOO                                             | /foo             |

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
