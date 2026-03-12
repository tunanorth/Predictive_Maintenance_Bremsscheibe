# Liste aller Munitionstypen für Bilder

Diese Datei enthält alle Munitionstypen, die im System verwendet werden. 
Bitte packe die entsprechenden Bilder in den Ordner `public/images/munition/` mit den folgenden Dateinamen:

## Munitionstypen und Dateinamen

1. **155mm HE-Granate**
   - Dateiname: `155mm-he-granate.jpg` oder `.png`
   - Alternativ: `it_155mm.jpg`

2. **9mm Pistolenmunition**
   - Dateiname: `9mm-pistolenmunition.jpg` oder `.png`
   - Alternativ: `it_9mm.jpg`

3. **Panzerabwehrrakete**
   - Dateiname: `panzerabwehrrakete.jpg` oder `.png`
   - Alternativ: `it_rocket.jpg`

4. **120mm Panzergranate**
   - Dateiname: `120mm-panzergranate.jpg` oder `.png`
   - Alternativ: `it_120mm.jpg`

5. **7.62mm Gewehrmunition**
   - Dateiname: `7-62mm-gewehrmunition.jpg` oder `.png`
   - Alternativ: `it_7_62mm.jpg`

6. **5.56mm Gewehrmunition**
   - Dateiname: `5-56mm-gewehrmunition.jpg` oder `.png`
   - Alternativ: `it_5_56mm.jpg`

7. **40mm Granate**
   - Dateiname: `40mm-granate.jpg` oder `.png`
   - Alternativ: `it_40mm.jpg`

8. **81mm Mörsergranate**
   - Dateiname: `81mm-moersergranate.jpg` oder `.png`
   - Alternativ: `it_81mm.jpg`

9. **105mm Artilleriegranate**
   - Dateiname: `105mm-artilleriegranate.jpg` oder `.png`
   - Alternativ: `it_105mm.jpg`

10. **12.7mm Maschinengewehrmunition**
    - Dateiname: `12-7mm-maschinengewehrmunition.jpg` oder `.png`
    - Alternativ: `it_12_7mm.jpg`

11. **Handgranate**
    - Dateiname: `handgranate.jpg` oder `.png`
    - Alternativ: `it_handgrenade.jpg`

12. **Panzerabwehrmine**
    - Dateiname: `panzerabwehrmine.jpg` oder `.png`
    - Alternativ: `it_mine.jpg`

13. **Nebelgranate**
    - Dateiname: `nebelgranate.jpg` oder `.png`
    - Alternativ: `it_smoke.jpg`

14. **Leuchtgranate**
    - Dateiname: `leuchtgranate.jpg` oder `.png`
    - Alternativ: `it_flare.jpg`

15. **30mm Maschinenkanone**
    - Dateiname: `30mm-maschinengranate.jpg` oder `.png`
    - Alternativ: `it_30mm.jpg`

## Ordnerstruktur

```
public/
  images/
    munition/
      ├── 155mm-he-granate.jpg
      ├── 9mm-pistolenmunition.jpg
      ├── panzerabwehrrakete.jpg
      ├── 120mm-panzergranate.jpg
      ├── 7-62mm-gewehrmunition.jpg
      ├── 5-56mm-gewehrmunition.jpg
      ├── 40mm-granate.jpg
      ├── 81mm-moersergranate.jpg
      ├── 105mm-artilleriegranate.jpg
      ├── 12-7mm-maschinengewehrmunition.jpg
      ├── handgranate.jpg
      ├── panzerabwehrmine.jpg
      ├── nebelgranate.jpg
      ├── leuchtgranate.jpg
      └── 30mm-maschinengranate.jpg
```

## Empfohlene Bildformate

- **Format**: JPG oder PNG
- **Größe**: Mindestens 400x300px, optimal 800x600px
- **Aspect Ratio**: 4:3 oder 16:9
- **Dateigröße**: Maximal 500KB pro Bild (für schnelles Laden)

## Verwendung im System

Die Bilder werden automatisch geladen, wenn sie im Ordner `public/images/munition/` mit den oben genannten Dateinamen vorhanden sind.

Falls ein Bild fehlt, wird automatisch das 3D-SVG-Icon verwendet.

## ItemType IDs (für Referenz)

- `it_155mm` → 155mm HE-Granate
- `it_9mm` → 9mm Pistolenmunition
- `it_rocket` → Panzerabwehrrakete
- `it_120mm` → 120mm Panzergranate
- `it_7_62mm` → 7.62mm Gewehrmunition
- `it_5_56mm` → 5.56mm Gewehrmunition
- `it_40mm` → 40mm Granate
- `it_81mm` → 81mm Mörsergranate
- `it_105mm` → 105mm Artilleriegranate
- `it_12_7mm` → 12.7mm Maschinengewehrmunition
- `it_handgrenade` → Handgranate
- `it_mine` → Panzerabwehrmine
- `it_smoke` → Nebelgranate
- `it_flare` → Leuchtgranate
- `it_30mm` → 30mm Maschinenkanone

