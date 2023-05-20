## IDATT2104 - Terrain Network Signal Simulation (TNSS)

Terrain Network Signal Simulation (TNSS) er en applikasjon med formål om å løse problemstillingen:

>  “Implementer en simuleringsmodell som visualiserer hvordan ulikt terreng påvirker signalstyrken for ulike nettverk”. 

Med den kontinuerlige utviklingen av kommunikasjonsteknologi, spesielt innen trådløs teknologi, har forståelsen av hvordan fysiske omgivelser påvirker signalstyrken blitt avgjørende. TNSS har som mål å gi svar på disse utfordringene på en intuitiv og brukervennlig måte.


### Implementert funksjonalitet

* Sandbox for å designe terreng på kartet
  * Vi har utviklet en "sandbox" som gir brukeren muligheten til å skape og tilpasse sitt helt eget terreng. Det er også mulig å laste ned kartet som en JSON-fil, som man kan dele med andre. Alle oppdateringer av terrenget blir sendt til serveren, hvor eventuelle nye beregninger for signal-spredningen blir utført.
  * "Sandboxen" er delt inn i felt ("tiles"), hvor hvert felt representerer 40x40 meter i virkeligheten. Alle beregningene samsvarer med hvordan det faktisk ville ha vært i den virkelige verden.

* Definere signalstyrke for signaltårn
  * Det er mulig å endre hvilket nettverk signaltårnene skal sende ut. Man kan bytte mellom 3G, 4G og 5G. Hvordan signalstyrken sprer seg for hver av disse nettverkene samsvarer med faktiske data. Det finnes varierte kilder til spredningen for hvert av nettverkene, men vi har tatt utgangspunkt i følgende maks-distanser for hver av dem:
    * 3G - 10km
    * 4G - 2km
    * 5G - 500m
   *  Dette er basert på følgende kilder:
      * [Verizon](https://www.verizon.com/about/news/how-far-does-5g-reach)
      * [Dgtl Infra](https://dgtlinfra.com/cell-tower-range-how-far-reach/)
      * [Digitaltrends](https://www.digitaltrends.com/mobile/5g-vs-4g/#dt-heading-5g-vs-4g-coverage)


* Visualisere signalspredning og styrke fra signaltårn
  * Signalspredning blir visualisert på terrenget. Som bruker vil du kunne observere hvordan signalene dynamisk endrer og tilpasser seg basert på terrenget. Hver terrengtype påvirker signalene forskjellig. For eksempel er hav det enkleste terrenget for signalene å navigere gjennom, og vil derfor være det terrenget som reduserer signalstyrken minst. Fjell derimot, vil redusere signalstyrken relativt raskt.
  * Hvis man derimot plasserer et signal-tårn på toppen av et fjell, vil signalene kunne spre seg langt over fjellene.
  
  
* Visualisere videresendt signal fra signalforsterkere
  * Det finnes to måter å sende signaler på i TNSS:
    * Signaltårn
    * Signalforsterkere
  * Signaltårn vil generere nye signaler ut av ingenting, som den vil sende utover terrenget. Man kan velge mellom å sende 3G-, 4G- eller 5G-signaler.
  * Signalforsterkere genererer ikke nye signaler, men videresender og forsterker signalene som den får inn. Altså dersom en signalforsterker ikke får inn noen signaler fra et signaltårn eller en annen signalforsterker, så gjør den ingenting.   
  * Signalforsterkere forsterker signalene som den får inn med 50 prosentpoeng, og videresender signalene utover terrenget.



### Fremtidig arbeid

TNSS er implementert med tiltenkt funksjonalitet. Under følger en liste av potensielle utvidelser, som eksempler på funksjonalitet som kan implementeres ved fremtidig arbeid:

* Innlasting av signalspredning for ulike bygninger i ulike tråder
  * Kan gi en mer dynamisk effekt av oppdatering av signaler i kartet.
* Meter over havet 
  * Kunne angitt ulike høydeforskjeller i fjellområder. Nåværende funksjonalitet støtter om signalkilder er på et fjell eller ikke.
* Flere terreng
  * Flere terreng ville muliggjort et mer realistisk kart.
  * Brukeren kunne for eksempel angitt og lagd et eget terreng.
* Ulike værtyper
  * Faktorer som regn, snø osv påvirker signalet i realiteten til en viss grad.



### Signalspredning i terreng

Algoritmen som overholder spredning av signal fra kilde er basert på **bredde-først-søk (BFS).**

I koden heter metoden som kalles ‘_spread\_signal()_’. Funksjonen starter med en kilde-node, som er et punkt definert på kartet der signalet kommer fra. Derfra sprer signalet seg til kildens nabo-noder, og så videre radielt utover i kartet. 

Først kjøres algoritmen for signaltårn. Deretter regnes signalet spredt videre fra signalforsterkere. Denne logikken sikrer korrekt funksjonalitet for forsterkere. 

Algoritmen behandler en rekke essensielle datastrukturer:

* _board_: 2D Vektor med informasjon om brettets ruter.
* _node\_queue_: Kø med Noder (brettets ruter med ekstra info). Denne strukturen overholder rekkefølgen av hvilke noder som skal få signal.
* _signal\_queue_: Kø med signal som samsvarer med nodekøen.
* _visited_: HashSet med brettets koordinater som har blitt besøkt av signalet som sprer seg utover.

Funksjonen tar inn nettverkstypen til signalet (3G, 4G, 5G). Beregning av signalstyrken påvirkes dermed av en variabel _network\_modifier,_ som kalkuleres basert på nettverkstypen.

Algoritmen tar hensyn til om en node er et signaltårn (tower) eller forsterker (extender). Først settes signalstyrken til den respektive kilden. Deretter traverserer algoritmen gjennom kildens nabo-noder ved BFS. Hver node har en funksjon for å hente posisjonene til sine naboer på brettet (node._adj\_positions()_). Denne brukes for å legge nabo-nodene til i traverserings-køen _node\_queue._

Algoritmen utfører så sjekker for å bestemme om signalet skal oppdateres ved å iterere gjennom alle nabo-noder, og deres naboer, og så videre. Ved oppdatering av signalet på en node, settes nodens output basert på nettverkstype, og terrengtype. På denne måten svekkes signalet over avstand. 

Algoritmen sikrer at det er det høyeste mulige signalet som en node kan ha, som blir satt. I tillegg blir ikke noder som allerede er sjekket, evaluert på nytt med mindre det nye signalet er høyere.

For å ta hensyn til diagonale avstander, sammenlignes koordinatene til den besøkte nabo-noden mot koordinatene til kilde-noden. Noder som er "diagonalt" fra kilden mister mer signal, ettersom avstanden er større langs diagonalen av rutene. Dette skaper et tilnærmet sirkulært spredningsmønster.

Hvis det er en endring i en rute innenfor brettet, vil endringen sendes over websocket.


### Websocket-kommunikasjon

* Websocket: En WebSocket er en kommunikasjonsprotokoll som tillater sanntidsinteraksjon mellom en klient (for eksempel en nettleser) og en server. Den skiller seg fra tradisjonelle HTTP-forespørsler ved å opprette en vedvarende toveisforbindelse mellom klienten og serveren, noe som muliggjør kontinuerlig utveksling av data uten behov for gjentatte forespørsler.

For å etablere en websocket kommunikasjonstjener bruker TNSS et bibliotek kalt Tungstenite. 


## Installasjonsinstruksjoner

#### Tjeneren:

For å kjøre tjener applikasjon må man installere “Rust-compiler”, “Cargo”. Nedlastings-link: [https://www.rust-lang.org/learn/get-started](https://www.rust-lang.org/learn/get-started)

#### HTTPS:

```plaintext
git clone https://github.com/HolyBarrel/IDATT2104-Backend.git
```

#### SSH: 

```plaintext
git clone git@github.com:HolyBarrel/IDATT2104-Backend.git
```

Etter kloning av Git repository eller nedlasting og dekompresjon av zip-filen med koden, kjører man tjener-applikasjonen med:

```plaintext
cd IDATT2104-Backend
cd backend
cargo run
```

#### Klienten:

For å kjøre klienten må man installere [Node.js](https://nodejs.org/en/download)

#### HTTPS:

```plaintext
git clone https://github.com/HolyBarrel/IDATT2104-Frontend.git
```

#### SSH: 

```plaintext
git clone git@github.com:HolyBarrel/IDATT2104-Frontend.git
```

##### Kjøring av tjener

Etter kloning av Git repository eller nedlasting og dekompresjon av zip-filen med koden, kjører man tjener-applikasjon med:

```plaintext
cd IDATT2104-Backend/backend
cargo run
```

###### Hvordan kjøre tester

Man kan kjøre tester i tjeneren ved kommando:

```plaintext
cargo test
```


##### Kjøring av klient

Etter kloning av Git repository eller nedlasting og dekompresjon av zip-filen med koden, kjører man klient-applikasjon med:

```plaintext
cd IDATT2104-Frontend
npm install
npm run dev
```

## Instruksjoner for å bruke applikasjonen

Start med å kjøre serveren, og deretter klienten.

Etter dette, åpne en nettleser på localhost:8080 for å besøke applikasjonen. (For utvikling har Chrome og Firefox Developer Edition blitt brukt).

Dermed kan du utforske sandboxen for å lage ulikt terreng og sette ut ulike bygninger som forteller deg om hvordan signal sprer seg i terrenget. 

### Funksjonalitet for verktøymenyen i høyre hjørne av skjermen:


![image](https://github.com/HolyBarrel/IDATT2104-Frontend/assets/58830226/2c6be7d0-eb87-4134-a018-30951406c4e9)


  **Endre og sette ut ulike typer terreng** 
  
    velg -> venstreklikk -> dra på kartet
    
  **Plassere ut signaltårn**
  
    velg -> venstreklikk
    
  **Plassere ut forsterker** 
  
    velg -> venstreklikk
    
  **Plassere ut signalmåler**
  
    velg -> venstreklikk
    
  **Plassere ut store mengder terreng (malebøtte)**
  
    velg -> venstreklikk
    
  **Fjerne bygninger**
  
    velg -> trykk på bygning som skal fjernes
    
  **Last opp kart**
  
    velg -> last opp et kart i form av en .json fil
    
  Her kan mappen med forhåndsdefinerte kart `/maps/[kart.json]` velges fra
     
  **Last ned kart**
  
    velg -> laster ned kartet som er tegnet som en .json-fil. Denne kan så lagres lokalt.
    
  
### Funksjonalitet for karttegning

   **Generell ruteplassering**
   
     -> venstreklikk i kart
   
   **Se informasjon om rute:** *viser koordinat og signalstryke*
   
     -> høyreklikk i kart
    
  
   ![image (1)](https://github.com/HolyBarrel/IDATT2104-Frontend/assets/58830226/d3896144-064b-4120-b9b2-e7a555fb81be)

 
### Applikasjonsflyt

![flowchart](https://github.com/HolyBarrel/IDATT2104-Frontend/assets/58830226/a749011a-0069-4c77-bf3a-9fd157eb70c4)


*Flytdiagrammet representerer tiltenkt flyt for TNSS*

## Lenker til kjøringer av CICD

### Backend
  * Link: https://github.com/HolyBarrel/IDATT2104-Backend/actions/runs/5031479274/jobs/9024575497

### Frontend
  * Link: https://github.com/HolyBarrel/IDATT2104-Frontend/actions/runs/5031449352/jobs/9024531116

## Eksterne avhengigheter

* Tungstenite: [https://docs.rs/tungstenite/latest/tungstenite/](https://docs.rs/tungstenite/latest/tungstenite/) 
  * Tungstenite er et enkelt WebSocket-bibliotek som støtter bruk av “full-duplex”-kommunikasjon mellom klienter og server. Biblioteket brukes for å åpne en port som lytter etter WebSocket-forespørsler fra klienter og etablerer en kommunikasjonskanal.
* Serde: [https://serde.rs/](https://serde.rs/)
  * Serde er et rammeverk som brukes til effektiv serialisering og deserialisering av Rust-datastrukturer. I TNSS brukes Serde til å serialisere datastrukturen "Node" og konverterer dette til et JSON-objekt.
* Serde\_json: [https://docs.rs/serde_json/latest/serde_json/](https://docs.rs/serde_json/latest/serde_json/)
  * Serde\_json er en utvidelsesbibliotek for Serde som brukes for a transformere serialiserte objekter til JSON-objekter. JSON-objektene bidrar til sikker og effektiv kommunikasjon mellom server og klient. 
* Queues: [https://docs.rs/queues/latest/queues/](https://docs.rs/queues/latest/queues/)
  * Queues gir en rekke effektive FIFO-kødatastrukturer. Disse er alle implementert i tillegg til rusts Vector-type. Køer brukes i algoritmen som sprer signalet utover kartet.
* Fontawesome: [https://fontawesome.com/](https://fontawesome.com/)
  * Font Awesome er et ikonbibliotek. Den er brukt for å generere SVG-ikoner som forbedrer UX av applikasjon.
