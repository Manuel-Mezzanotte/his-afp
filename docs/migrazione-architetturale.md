# Migrazione architetturale UF14 - Task 1

## Obiettivo

L'obiettivo della Task 1 è isolare i frontend dal database. Prima tutti i
container erano nella rete Docker di default, quindi un frontend poteva
potenzialmente vedere il servizio `db`.

La nuova configurazione divide l'infrastruttura in due reti e usa il gateway
come unico punto di passaggio.

## Prima della modifica

Servizi presenti:

- `fe-prod`, `fe-test`, `fe-sio`
- `backend`
- `db`
- `gateway`

Problemi principali:

- servizi nella stessa rete Docker
- database raggiungibile direttamente dall'host con `5432:5432`
- gateway non unico punto di controllo

## Modifica fatta

Nel file `docker-compose.yml` ho aggiunto due reti:

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
| `backend` | `backend-net` |
| `db` | `backend-net` |
| `gateway` | `frontend-net` e `backend-net` |

Schema:

```text
Browser -> gateway
              |-> frontend-net: fe-prod, fe-test, fe-sio
              |-> backend-net: backend, db
```

Ho anche rimosso dal servizio `db`:

```yaml
ports:
  - "5432:5432"
```

Dopo la modifica solo `gateway` espone porte verso l'esterno.

## Avvio

Comando usato:

```bash
PROD_VERSION=prod TEST_VERSION=test SVI_VERSION=svi docker compose up -d --build
```

Le tre variabili servono per dare tag diversi ai frontend ed evitare che
costruiscano tutti `his-afp:latest`.

## Test eseguiti

### Porte esposte

```bash
PROD_VERSION=prod TEST_VERSION=test SVI_VERSION=svi docker compose ps
```

Risultato rilevante:

```text
sio-gateway    0.0.0.0:80->80/tcp, 0.0.0.0:8080->8080/tcp, 0.0.0.0:8999->8999/tcp
sio-postgres   5432/tcp
```

`sio-postgres` mostra solo la porta interna Docker, non `0.0.0.0:5432`.

Verifica da host:

```bash
nc -zv 127.0.0.1 5432
curl http://localhost:3000/health
```

Risultato: entrambe le connessioni falliscono. Quindi database e backend non
sono esposti direttamente.

### Frontend verso database

```bash
docker exec sio-fe-prod sh -c 'getent hosts db'
docker exec sio-fe-prod sh -c 'ping -c 1 db'
```

Risultato:

```text
getent hosts db -> nessun output
ping -c 1 db    -> ping: bad address 'db'
```

Questo conferma che `fe-prod` non riesce a vedere il database.

### Backend verso database

```bash
docker exec sio-backend sh -c 'getent hosts db'
```

Risultato:

```text
172.19.0.2        db  db
```

Questo è corretto: backend e database devono comunicare sulla rete
`backend-net`.

### Test tramite gateway

Frontend:

```text
http://localhost
http://localhost:8080
http://localhost:8999
```

API:

```bash
curl http://localhost/api/health
curl http://localhost:8080/api/health
curl http://localhost:8999/api/health
```

Risultato:

```json
{"status":"success","data":{"service":"UP","database":"CONNECTED"}}
```

## Conclusione

La Task 1 è completata perché:

- frontend e database sono separati
- `gateway` è l'unico ponte tra le reti
- il database non espone più la porta `5432` verso l'host
- i frontend non risolvono `db`
- backend e database continuano a comunicare
- frontend e API funzionano passando dal gateway

Possibili miglioramenti futuri: healthcheck Docker, gestione migliore dei
segreti, logging centralizzato e TLS sul gateway.
