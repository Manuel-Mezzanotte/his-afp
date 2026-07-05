# Migrazione architetturale UF14

## Task 1 - Isolamento rete

### Obiettivo

Separare i frontend dal database. Prima i container erano tutti nella rete
Docker di default, quindi un frontend poteva potenzialmente vedere `db`.

La nuova configurazione usa due reti e lascia il gateway come unico punto di
passaggio.

### Modifica fatta

Nel `docker-compose.yml` ho aggiunto:

```yaml
networks:
  frontend-net:
  backend-net:
```

Assegnazione finale:

| Servizio | Rete |
| --- | --- |
| `fe-prod` | `frontend-net` |
| `fe-test` | `frontend-net` |
| `fe-sio` | `frontend-net` |
| `backend-blue` | `backend-net` |
| `backend-green` | `backend-net` |
| `db` | `backend-net` |
| `gateway` | `frontend-net` e `backend-net` |

Schema:

```text
Browser -> gateway
              |-> frontend-net: fe-prod, fe-test, fe-sio
              |-> backend-net: backend-blue, backend-green, db
```

Ho rimosso dal servizio `db`:

```yaml
ports:
  - "5432:5432"
```

Dopo la modifica solo `gateway` espone porte verso l'esterno.

### Avvio

```bash
PROD_VERSION=prod TEST_VERSION=test SVI_VERSION=svi docker compose up -d --build
```

Uso versioni diverse per evitare che i tre frontend costruiscano tutti
`his-afp:latest`.

### Test

Controllo porte:

```bash
PROD_VERSION=prod TEST_VERSION=test SVI_VERSION=svi docker compose ps
```

Risultato rilevante:

```text
sio-gateway    0.0.0.0:80->80/tcp, 0.0.0.0:8080->8080/tcp, 0.0.0.0:8999->8999/tcp
sio-postgres   5432/tcp
```

`sio-postgres` non pubblica `0.0.0.0:5432`, quindi il database non è esposto
direttamente.

Verifica da host:

```bash
nc -zv 127.0.0.1 5432
curl http://localhost:3000/health
```

Risultato: entrambe le connessioni falliscono.

Verifica frontend verso database:

```bash
docker exec sio-fe-prod sh -c 'getent hosts db'
docker exec sio-fe-prod sh -c 'ping -c 1 db'
```

Risultato:

```text
getent hosts db -> nessun output
ping -c 1 db    -> ping: bad address 'db'
```

Verifica backend verso database:

```bash
docker exec sio-backend-blue sh -c 'getent hosts db'
docker exec sio-backend-green sh -c 'getent hosts db'
```

Risultato: entrambi risolvono `db`, perché sono su `backend-net`.

Test API tramite gateway:

```bash
curl http://localhost/api/health
curl http://localhost:8080/api/health
curl http://localhost:8999/api/health
```

Risultato:

```json
{"status":"success","data":{"service":"UP","database":"CONNECTED"}}
```

## Task 2 - Blue/Green backend

### Obiettivo

Avere due backend attivi:

- `backend-blue`: versione stabile
- `backend-green`: nuova versione da provare

Il frontend continua a usare `/api/`. Lo switch viene gestito dal gateway.

### Modifica fatta

Nel `docker-compose.yml` il vecchio servizio `backend` è stato diviso in:

- `backend-blue`, container `sio-backend-blue`
- `backend-green`, container `sio-backend-green`

Entrambi usano `./backend`, stanno su `backend-net`, usano lo stesso database e
non espongono porte verso l'host.

Nel gateway ho aggiunto:

```nginx
upstream api_backend {
    server backend-blue:3000;
}
```

Le tre location `/api/` puntano a:

```nginx
proxy_pass http://api_backend;
```

### Switch e rollback

Per passare a Green:

```nginx
upstream api_backend {
    server backend-green:3000;
}
```

Poi ricarico NGINX:

```bash
docker exec sio-gateway nginx -s reload
```

Per il rollback si rimette:

```nginx
upstream api_backend {
    server backend-blue:3000;
}
```

e si ricarica di nuovo NGINX.

### Test

Ho verificato che siano attivi entrambi i backend:

```text
sio-backend-blue    3000/tcp
sio-backend-green   3000/tcp
```

Test switch a Green:

- gateway puntato a `backend-green:3000`
- ricaricato NGINX
- fermato temporaneamente `backend-blue`
- `curl http://localhost/api/health` ha continuato a rispondere

Test rollback a Blue:

- gateway riportato a `backend-blue:3000`
- ricaricato NGINX
- fermato temporaneamente `backend-green`
- `curl http://localhost/api/health` ha continuato a rispondere

Risposta ottenuta:

```json
{"status":"success","data":{"service":"UP","database":"CONNECTED"}}
```

### Nota sul database

Blue e Green condividono lo stesso database. Se Green scrive un dato e poi si
torna a Blue, quel dato rimane.

Il rollback del backend non annulla le scritture già fatte. Per questo le due
versioni devono restare compatibili con lo stesso schema dati.

## Conclusione

La Task 1 isola i frontend dal database. La Task 2 aggiunge due backend e
permette lo switch Blue/Green tramite gateway, senza cambiare URL al frontend.

Possibili miglioramenti futuri: healthcheck Docker, gestione migliore dei
segreti, logging centralizzato e TLS sul gateway.
