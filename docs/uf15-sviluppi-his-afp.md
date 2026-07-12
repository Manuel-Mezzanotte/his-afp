# UF15 - Sviluppi HIS-AFP

## Task 1 - Gestione personale

La nuova pagina si trova nel frontend Angular alla route:

```text
/gestione-personale
```

Dal menu principale è raggiungibile con il pulsante `Personale`.

### Cosa fa

- mostra l'elenco degli utenti del personale
- permette di inserire un nuovo collaboratore
- controlla lo username prima del salvataggio
- permette di cambiare il ruolo di un utente già presente

I ruoli gestiti sono:

| Codice | Ruolo |
| --- | --- |
| `DOC` | Medico |
| `INF` | Infermiere |
| `AMM` | Amministrativo |

### File principali

```text
his-afp/src/app/core/Staff/staff.model.ts
his-afp/src/app/core/Staff/staff-manager.ts
his-afp/src/app/features/gestione-personale/gestione-personale.ts
his-afp/src/app/features/gestione-personale/gestione-personale.html
```

### API usate

```text
GET /api/users
GET /api/users/check/:username
POST /api/users
PATCH /api/users/:id/editrole
```

### Verifica

```bash
cd his-afp
npm run build
```

La build deve completare senza errori. Il warning sul budget iniziale del bundle era già presente e non blocca il funzionamento.
