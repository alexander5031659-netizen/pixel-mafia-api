# Pixel Mafia API

Backend API con MongoDB Atlas para Pixel Mafia.

## 🚀 Configuración Rápida

### 1. Crear cuenta MongoDB Atlas (GRATIS)

1. Ve a https://www.mongodb.com/atlas
2. Crea cuenta gratuita (M0 tier - 512MB, forever free)
3. Crea un cluster nuevo
4. En "Database Access", crea usuario:
   - Username: `pixeladmin`
   - Password: genera uno seguro
5. En "Network Access", agrega IP:
   - `0.0.0.0/0` (permitir desde cualquier lugar)
6. En "Clusters", click "Connect" → "Connect your application"
7. Copia la connection string:
   ```
   mongodb+srv://pixeladmin:<password>@cluster0.xxxxx.mongodb.net/pixelmafia?retryWrites=true&w=majority
   ```

### 2. Configurar variables de entorno

Crear archivo `api/.env`:

```
MONGODB_URI=mongodb+srv://pixeladmin:TU_PASSWORD@cluster0.xxxxx.mongodb.net/pixelmafia?retryWrites=true&w=majority
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_esto
PORT=3000
```

### 3. Instalar dependencias

```bash
cd api
npm install
```

### 4. Iniciar servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

## 📁 Estructura

```
api/
├── server.js           # Entry point
├── package.json        # Dependencies
├── .env               # Environment variables
├── middleware/
│   └── auth.js        # JWT authentication
├── models/
│   ├── User.js        # User model
│   ├── Bot.js         # Bot instance model
│   ├── Payment.js     # Payment model
│   └── Cuenta.js      # IMVU account pool model
└── routes/
    ├── auth.js        # Auth endpoints
    ├── bots.js        # Bot management
    ├── payments.js    # Payments & tokens
    └── cuentas.js     # Account pool
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Bots
- `GET /api/bots/my-bots` - Get user's bots
- `POST /api/bots/create` - Create new bot (requires tokens)
- `POST /api/bots/:id/status` - Update bot status
- `DELETE /api/bots/:id` - Delete bot
- `GET /api/bots/all` - Get all bots (admin only)

### Payments
- `POST /api/payments/create` - Create payment
- `GET /api/payments/my-payments` - Get my payments
- `POST /api/payments/confirm/:id` - Confirm payment (admin)
- `GET /api/payments/all` - Get all payments (admin)

### Cuentas (Account Pool)
- `GET /api/cuentas/available/:categoria` - Get available account
- `POST /api/cuentas/assign/:id` - Assign account to bot
- `POST /api/cuentas/release/:id` - Release account
- `GET /api/cuentas/all` - List all accounts (admin)
- `POST /api/cuentas/add` - Add account (admin)

## 🚀 Despliegue en Render (GRATIS)

1. Sube a GitHub
2. Ve a https://render.com
3. "New Web Service"
4. Conecta tu repo
5. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Agrega Environment Variables:
   - `MONGODB_URI`: tu connection string
   - `JWT_SECRET`: secreto seguro
7. Deploy!

## 💳 Integrar PayPal

1. Crear app en https://developer.paypal.com
2. Obtener Client ID
3. Agregar webhook en dashboard PayPal:
   - URL: `https://tu-api.render.com/api/payments/paypal-webhook`
4. Implementar verificación de webhook en `routes/payments.js`

## 📝 Notas

- El tier M0 de MongoDB Atlas es **gratis para siempre**
- 512MB de almacenamiento (suficiente para 1000+ usuarios)
- Render tiene tier gratis (duerme tras 15min de inactividad)
- Para producción real, considera VPS pagado ($5-10/mes)
