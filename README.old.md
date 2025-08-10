# roguelike-path-maker

## roadmap:

## **1. Grundidee: Technologiestack**

* **Frontend**:

  * **React** (wegen State-Management und modularer UI)
  * **Konva.js** oder **PixiJS** (Canvas-Library für interaktive 2D-Grafiken – perfekt für Knoten & Linien)
  * **Tailwind CSS** (schnelles, sauberes Styling)


---

## **2. Kernfunktionen**


1. **Ebenen-Struktur festlegen**

   * Eingabefeld: Anzahl Ebenen (z. B. 5)
   * Auto-Generierung von Platzhaltern für jede Ebene

2. **Knoten hinzufügen/entfernen**

   * Klick auf Ebene → „Node hinzufügen“
   * Node-Drag & Drop auf Canvas
   * Knoten-Properties (Name, Typ, Farbe/Icon für z. B. Kampf, Schatz, Shop …)

3. **Verbindungen zeichnen**

   * Verbindung starten per Klick auf Node A → Klick auf Node B
   * Linien können Kurven oder gerade Segmente sein (für den „Roguelike-Look“)

4. **Manuelles Eingreifen**

   * Auto-Layout (verteilt Nodes gleichmäßig)
   * Manuelle Positionierung möglich
   * Wege entfernen/hinzufügen ohne Einschränkungen

5. **Roguelike-Charme**

   * Stil mit leicht versetzten Linien, kleinen Icons, evtl. animiertem Hintergrund
   * Nodes mit „handgezeichnetem“ Rahmen (SVG/CSS-Filter)

6. **Speichern & Laden**

   * Export als JSON (Map-Daten)
   * Optional: Export als PNG/SVG-Image

---

## **3. Datenstruktur (JSON)**

So könnte deine Map intern gespeichert werden:

```json
{
  "levels": [
    {
      "id": 0,
      "nodes": [{ "id": "n1", "x": 100, "y": 200, "type": "start" }]
    },
    {
      "id": 1,
      "nodes": [
        { "id": "n2", "x": 80, "y": 150, "type": "combat" },
        { "id": "n3", "x": 120, "y": 250, "type": "treasure" }
      ]
    },
    {
      "id": 4,
      "nodes": [{ "id": "nEnd", "x": 100, "y": 200, "type": "boss" }]
    }
  ],
  "connections": [
    { "from": "n1", "to": "n2" },
    { "from": "n1", "to": "n3" },
    { "from": "n2", "to": "nEnd" }
  ]
}
```

So hast du volle Kontrolle über Layout und Logik.

---

## **4. Vorgehensweise (professionell & simpel)**

1. **MVP planen**

   * Nur Start- & Endpunkt + X Ebenen mit je Y Knoten
   * Verbindungen per Klick erstellen/löschen
   * JSON-Speicherfunktion

2. **Interaktive Canvas-UI bauen**

   * Mit **React + Konva.js**
   * Nodes als draggable Kreise
   * Linien als Bezier-Kurven (schöner Look)

3. **UI-Steuerung**

   * Sidebar mit „+ Ebene hinzufügen“, „+ Node hinzufügen“, „Linie ziehen“-Modus
   * Icons für Node-Typen

4. **Style & Roguelike-Charme**

   * Leicht versetzte Kurvenlinien (Perlin-Noise)
   * Handgezeichnete Icons (SVG-Set)
   * Farbpalette wie Slay the Spire (warme, kontrastreiche Farben)

5. **Optional: Prozedurale Generierung**

   * Button „zufällige Map“ → Basis-Struktur erzeugen
   * Danach manuell anpassen

---

## **5. Beispiel-Workflow im fertigen Tool**

1. Du gibst ein: **5 Ebenen**
2. Tool generiert leere Slots mit Platzhaltern
3. Du klickst bei Ebene 3 → **+ Node** → wählst „Elite-Kampf“
4. Du ziehst Node 1 auf Ebene 0 zu Node 4 auf Ebene 1 → Verbindung wird gezeichnet
5. Du verschiebst Nodes für schöneres Layout
6. Exportierst als JSON → direkt nutzbar im Spiel

