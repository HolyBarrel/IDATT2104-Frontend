## IDATT2104 - Terrain Network Signal Simulation (TNSS)

Terrain Network Signal Simulation (TNSS) er en applikasjon med formål om å løse problemstillingen: “Implementer en simuleringsmodell som visualiserer hvordan ulikt terreng påvirker signalstyrken for ulike nettverk”. Med den kontinuerlige utviklingen av kommunikasjonsteknologi, spesielt innen trådløs teknologi, har forståelsen av hvordan fysiske omgivelser påvirker signalstyrken blitt avgjørende. TNSS har som mål å gi svar på disse utfordringene på en intuitiv og brukervennlig måte.

### Implementert funksjonalitet

* Sandbox for å designe terreng på kartet
* Vi har utviklet en sandbox, som gir brukeren mulighet til å skape og tilpasse sitt helt eget terreng. Det er også mulig å laste ned et kart som json-fil, som kan lastes opp 
* Definere signalstyrke for alle signaltårn
* Signal
* Visualisere signalspredning og styrke fra signaltårn
* Visualisere videresendt signal fra signalutvidere

### Fremtidig arbeid

jkrngr

### Eksterne avhengigheter

* Tungstenite: [https://docs.rs/tungstenite/latest/tungstenite/](https://docs.rs/tungstenite/latest/tungstenite/) 
* Tungstenite er en kraftig og enkel WebSocket-bibliotek som muliggjør "full-duplex" kommunikasjon mellom klienter og serveren. Biblioteket brukes til å åpne en port som lytter etter WebSocket-forespørsler fra klienter og etablerer en kommunikasjonskanal.
* Serde: [https://serde.rs/](https://serde.rs/)
* Serde er et rammeverk som brukes til effektiv og generisk serialisering og deserialisering av Rust-datastrukturer. I dette tilfellet brukes Serde til å serialisere en datastruktur kalt "Node" og konvertere den til et JSON-objekt.
* Serde\_json: [https://docs.rs/serde_json/latest/serde_json/](https://docs.rs/serde_json/latest/serde_json/)
* Serde\_json er en utvidelsesbibliotek for Serde som konverterer serialiserte objekter til JSON-objekter. JSON-objekter brukes til sikker og effektiv kommunikasjon mellom servere og klienter. Ved å bruke Serde\_json kan man enkelt håndtere serialisering og deserialisering av data i JSON-format, og dermed oppnå pålitelig datautveksling mellom klienter og tjeneren.
* Queues: [https://docs.rs/queues/latest/queues/](https://docs.rs/queues/latest/queues/)
* Queues gir en rekke effektive FIFO-kødatastrukturer for bruk i bibliotekene dine. Disse er alle implementert på toppen av rusts Vector-type. Køer brukes i algoritmer som regner ut signal styrke.
* Fontawesome: [https://fontawesome.com/](https://fontawesome.com/)
* Font Awesome er Internetts ikonbibliotek og verktøysett, brukt av millioner av designere, utviklere og innholdsskapere. Den er brukt for å generere SVG ikoner som forbedre UX av applikasjon.

### Installasjonsinstruksjoner

#### Tjeneren:

For å kjøre tjener applikasjon må man installere “Rust-compiler”, “Cargo”. Nedlasting linken: [https://www.rust-lang.org/learn/get-started](https://www.rust-lang.org/learn/get-started)

#### HTTPS:

```plaintext
git clone https://github.com/HolyBarrel/IDATT2104-Backend.git
```

#### SSH: 

```plaintext
git clone git@github.com:HolyBarrel/IDATT2104-Backend.git
```

Etter klonasjon av Git repository eller nedlasting og dekompresjon av zip-filen med koden, kjører man tjeneren-applikasjon med:

```plaintext
cd IDATT2104-Backend
cd backend
cargo run
```

#### Klienten:

For å kjøre tjener applikasjon må man installere enten “npm”. Nedlasting linken: [https://nodejs.org/en/download](https://nodejs.org/en/download) 

#### HTTPS:

```plaintext
git clone https://github.com/HolyBarrel/IDATT2104-Frontend.git
```

#### SSH: 

```plaintext
git clone git@github.com:HolyBarrel/IDATT2104-Frontend.git
```

Etter klonasjon av Git repository eller nedlasting og dekompresjon av zip-filen med koden, kjører man klienten-applikasjon med:

```plaintext
cd IDATT2104-Frontend
npm install
npm run dev
```

### Instruksjoner for å bruke applikasjonen

fewfew

### Hvordan kjøre tester

Man kan kjøre tester i tjeneren ved kommando:

```plaintext
cargo test
```