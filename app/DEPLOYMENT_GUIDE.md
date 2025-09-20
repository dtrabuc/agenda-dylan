# 🚀 Guide Complet de Déploiement SSH

## Table des matières
1. [Prérequis](#prérequis)
2. [Configuration SSH](#configuration-ssh)
3. [Préparation du serveur](#préparation-du-serveur)
4. [Déploiement de l'application](#déploiement-de-lapplication)
5. [Configuration du reverse proxy](#configuration-du-reverse-proxy)
6. [Maintenance et monitoring](#maintenance-et-monitoring)

---

## Prérequis

### Sur votre machine locale (Windows)
- [Node.js](https://nodejs.org/) installé
- [Git](https://git-scm.com/) installé
- Client SSH (PuTTY recommandé pour Windows)
- [WinSCP](https://winscp.net/) pour le transfert de fichiers (optionnel)

### Sur le serveur
- Ubuntu/Debian ou CentOS/RHEL
- Accès root ou sudo
- Port 22 (SSH) ouvert
- Nom de domaine pointant vers votre serveur (optionnel mais recommandé)

---

## Configuration SSH

### 1. Générer une clé SSH (si vous n'en avez pas)

```bash
# Sur Windows (Git Bash) ou PowerShell
ssh-keygen -t rsa -b 4096 -C "votre-email@example.com"
```

### 2. Copier la clé publique sur le serveur

```bash
# Méthode 1: avec ssh-copy-id (si disponible)
ssh-copy-id username@votre-serveur.com

# Méthode 2: manuelle
cat ~/.ssh/id_rsa.pub | ssh username@votre-serveur.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Configuration SSH locale (optionnel)

Créez le fichier `~/.ssh/config` :

```
Host monserveur
    HostName votre-serveur.com
    User votre-username
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

Maintenant vous pouvez vous connecter avec : `ssh monserveur`

---

## Préparation du serveur

### 1. Connexion initiale

```bash
ssh username@votre-serveur.com
```

### 2. Mise à jour du système

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
# ou pour les versions récentes
sudo dnf update -y
```

### 3. Installation de Node.js

```bash
# Ubuntu/Debian - NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 4. Installation de MySQL/MariaDB

```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# CentOS/RHEL
sudo dnf install mysql-server -y

# Démarrer et activer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser MySQL
sudo mysql_secure_installation
```

### 5. Installation de PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 6. Installation de Nginx (optionnel, pour le reverse proxy)

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# CentOS/RHEL
sudo dnf install nginx -y

# Démarrer et activer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Déploiement de l'application

### 1. Préparation locale

```bash
# Dans votre projet local
cd c:\Users\dylan\Documents\fr\app

# Installer les dépendances et préparer
npm install
npm run db:generate
```

### 2. Transfert manuel (première fois)

```bash
# Créer l'archive (PowerShell)
Compress-Archive -Path .\* -DestinationPath app.zip -Force -Exclude node_modules,\.git,*.log,\.env,prisma\dev.db

# Transférer avec SCP (Git Bash ou PowerShell avec OpenSSH)
scp app.zip username@votre-serveur.com:~/

# Ou utilisez WinSCP pour une interface graphique
```

### 3. Configuration sur le serveur

```bash
# Connexion SSH
ssh username@votre-serveur.com

# Extraire l'application
cd ~
unzip -o app.zip -d agenda-app
cd agenda-app

# Copier la configuration de production
cp .env.production .env

# Éditer la configuration
nano .env
```

Modifiez les variables dans `.env` :
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://agenda_user:votre_mot_de_passe@localhost:3306/agenda_production"
```

### 4. Configuration de la base de données

```bash
# Rendre le script exécutable
chmod +x setup-database.sh

# Exécuter le script de configuration DB
./setup-database.sh

# Installer les dépendances et configurer Prisma
npm install --production
npm run db:generate
npm run db:push:mysql
```

### 5. Démarrage avec PM2

```bash
# Démarrer l'application
pm2 start src/server.js --name "agenda-app" --env production

# Configurer PM2 pour redémarrer au boot
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs agenda-app
```

---

## Configuration du reverse proxy

### Option 1: Nginx (recommandé)

```bash
# Créer la configuration Nginx
sudo nano /etc/nginx/sites-available/agenda-app
```

Contenu du fichier :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/agenda-app /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Option 2: Apache (alternative)

```bash
# Installer Apache
sudo apt install apache2 -y

# Activer les modules nécessaires
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Créer la configuration
sudo nano /etc/apache2/sites-available/agenda-app.conf
```

Contenu du fichier :
```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    ServerAlias www.votre-domaine.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    ErrorLog ${APACHE_LOG_DIR}/agenda-app_error.log
    CustomLog ${APACHE_LOG_DIR}/agenda-app_access.log combined
</VirtualHost>
```

```bash
# Activer le site
sudo a2ensite agenda-app.conf

# Désactiver le site par défaut
sudo a2dissite 000-default.conf

# Redémarrer Apache
sudo systemctl restart apache2
```

---

## Déploiement automatisé

### Utilisation du script de déploiement

1. **Modifier le script** `deploy.sh` ou `deploy.bat` avec vos informations :
   ```bash
   REMOTE_HOST="votre-serveur.com"
   REMOTE_USER="votre-username"
   ```

2. **Rendre le script exécutable** (Linux/Mac) :
   ```bash
   chmod +x deploy.sh
   ```

3. **Exécuter le déploiement** :
   ```bash
   # Linux/Mac
   ./deploy.sh production
   
   # Windows
   deploy.bat production
   ```

---

## Maintenance et monitoring

### Commandes PM2 utiles

```bash
# Voir le statut de toutes les applications
pm2 status

# Voir les logs en temps réel
pm2 logs agenda-app

# Redémarrer l'application
pm2 restart agenda-app

# Arrêter l'application
pm2 stop agenda-app

# Supprimer l'application de PM2
pm2 delete agenda-app

# Monitorer les ressources
pm2 monit
```

### Sauvegarde de la base de données

```bash
# Créer un script de sauvegarde
nano ~/backup-db.sh
```

Contenu :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u agenda_user -p agenda_production > ~/backups/agenda_backup_$DATE.sql
```

```bash
# Rendre exécutable
chmod +x ~/backup-db.sh

# Programmer avec cron (sauvegarde quotidienne à 2h)
crontab -e
# Ajouter : 0 2 * * * /home/username/backup-db.sh
```

### Surveillance des logs

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs système
sudo journalctl -u nginx -f
sudo journalctl -u mysql -f
```

---

## Résolution de problèmes courants

### 1. L'application ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs agenda-app

# Vérifier la configuration
cat .env

# Tester manuellement
node src/server.js
```

### 2. Base de données inaccessible
```bash
# Tester la connexion MySQL
mysql -u agenda_user -p agenda_production

# Vérifier le service MySQL
sudo systemctl status mysql
```

### 3. Problème de proxy (404/502)
```bash
# Vérifier la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx

# Vérifier que l'app écoute sur le bon port
netstat -tlnp | grep :3000
```

### 4. Permissions insuffisantes
```bash
# Réparer les permissions
sudo chown -R username:username ~/agenda-app
chmod -R 755 ~/agenda-app
```

---

## Sécurité supplémentaire

### 1. Firewall
```bash
# Ubuntu (UFW)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. SSL/HTTPS avec Let's Encrypt
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Checklist finale

- [ ] Serveur configuré avec Node.js, MySQL, Nginx
- [ ] Clés SSH configurées
- [ ] Base de données créée et configurée
- [ ] Application déployée et testée
- [ ] PM2 configuré pour le redémarrage automatique
- [ ] Reverse proxy configuré (Nginx/Apache)
- [ ] Firewall configuré
- [ ] SSL configuré (optionnel mais recommandé)
- [ ] Sauvegardes programmées
- [ ] Monitoring en place

**🎉 Votre application devrait maintenant être accessible via votre domaine !**