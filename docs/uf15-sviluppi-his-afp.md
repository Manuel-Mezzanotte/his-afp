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

## Task 2 - Ricerca e accettazione paziente

Prima di iniziare una nuova accettazione viene richiesto di cercare il paziente.
La ricerca può essere fatta tramite codice fiscale oppure usando nome, cognome e
data di nascita.

Se il paziente è già presente viene selezionato e si prosegue con i dati di
accettazione. Se non viene trovato è possibile compilare anche la nuova
anagrafica.

File principali:

```text
his-afp/src/app/core/Pazienti/patient-manager.ts
his-afp/src/app/features/ricerca-paziente/
his-afp/src/app/features/workflow-accettazione/
his-afp/src/app/features/accettazione-pz/
```

API utilizzate:

```text
GET /api/patients/search
POST /api/admissions
```

Ho verificato sia la ricerca per codice fiscale sia quella con i dati
anagrafici. La creazione dell'accesso porta poi alla scheda del paziente.

## Task 3 - Report dei dimessi

La pagina del report è disponibile alla route `/report` e mostra i pazienti
dimessi nelle ultime 24 ore.

Per ogni riga vengono visualizzati il numero del braccialetto, il paziente e
l'orario esatto di dimissione. L'elenco può essere ordinato dal più recente al
meno recente e viceversa. Il pulsante `Aggiorna` ricarica i dati.

File principali:

```text
his-afp/src/app/core/Report/report.model.ts
his-afp/src/app/core/Report/report-manager.ts
his-afp/src/app/features/report-dimessi/
```

API utilizzata:

```text
GET /api/admissions/reports/discharged
```

Il componente ha due test dedicati all'ordinamento crescente e decrescente.
La verifica completa è stata eseguita con:

```bash
cd his-afp
npm test -- --watch=false
npm run build
```
