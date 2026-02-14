# Manueller Server-Setup Guide (Via PowerShell)

Du kannst diesen kompletten Prozess bequem von deiner **Windows PowerShell** aus erledigen.

## Vorbereitung: Verbindung zum Server herstellen
Öffne deine PowerShell auf dem PC und gib diesen Befehl ein, um dich mit dem Server zu verbinden:

```powershell
ssh root@178.254.9.68
```
*(Danach fragt er nach deinem Passwort: **SQU3Z-3ANX** - beim Tippen des Passworts siehst du keine Zeichen, das ist normal!)*

---

**WICHTIG:** Sobald du eingeloggt bist, akzeptiert dein PowerShell-Fenster die Linux-Befehle für den Server.

## Schritt 1: Server Absichern & Ordner erstellen (In der SSH Verbindung)
Kopiere diese Zeilen nacheinander in dein PowerShell-Fenster (während du eingeloggt bist):

| Befehl | Erklärung |
| :--- | :--- |
| `apt update && apt upgrade -y` | Aktualisiert das System. |
| `apt install ufw fail2ban -y` | Installiert Schutz-Software. |
| `ufw allow 22/tcp` | Schaltet SSH frei. |
| `ufw allow 80/tcp` | Schaltet Web frei. |
| `ufw allow 443/tcp` | Schaltet HTTPS frei. |
| `ufw --force enable` | Aktiviert den Schutz. |
| `mkdir -p /var/www/auto-shop` | Erstellt den App-Ordner. |

## Schritt 2: Dateien hochladen (NEUES PowerShell-Fenster)
Öffne ein **zweites** PowerShell-Fenster auf deinem PC (nicht dort, wo du eingeloggt bist), gehe in deinen Projektordner und gib dies ein:

| Befehl | Erklärung |
| :--- | :--- |
| `npm run build` | Erstellt die fertige App. |
| `scp -r .next public prisma package.json .env root@178.254.9.68:/var/www/auto-shop/` | Kopiert alles auf den Server. |

## Schritt 3: Software installieren (Zurück im ersten Fenster)
Gehe zurück in das Fenster, in dem du auf dem Server eingeloggt bist:

| Befehl | Erklärung |
| :--- | :--- |
| `curl -fsSL https://deb.nodesource.com/setup_20.x \| bash -` | Node.js 20 Vorbereitung. |
| `apt install nodejs nginx certbot python3-certbot-nginx -y` | Installation der Haupt-Programme. |
| `npm install -g pm2` | Installiert den Prozess-Manager. |

## Schritt 4: App starten (Im ersten Fenster)
| Befehl | Erklärung |
| :--- | :--- |
| `cd /var/www/auto-shop` | In den Shop-Ordner wechseln. |
| `npm install --production` | Module installieren. |
| `npx prisma generate` | Datenbank-Brücke bauen. |
| `npx prisma db push` | Datenbank-Datei erstellen. |
| `pm2 start npm --name "auto-shop" -- start` | Shop starten. |
| `pm2 save` | Dauerhaft speichern. |

## Schritt 5: Webserver & HTTPS (Im ersten Fenster)
| Befehl | Erklärung |
| :--- | :--- |
| `nano /etc/nginx/sites-available/mato-automobile` | Konfiguration erstellen (Inhalt siehe unten). |
| `ln -s /etc/nginx/sites-available/mato-automobile /etc/nginx/sites-enabled/` | Aktivieren. |
| `rm /etc/nginx/sites-enabled/default` | Standard-Seite löschen. |
| `nginx -t && systemctl restart nginx` | Webserver neu starten. |
| `certbot --nginx -d mato-automobile.de` | **HTTPS aktivieren.** |

---

### Nginx Konfiguration für Schritt 5:
(Diesen Text mit rechter Maustaste in den `nano` Editor einfügen)

```nginx
server {
    listen 80;
    server_name mato-automobile.de www.mato-automobile.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
*(In nano speichern: `Strg+O`, `Enter`, dann zum Beenden: `Strg+X`)*
