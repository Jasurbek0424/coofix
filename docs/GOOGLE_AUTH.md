# Реализация авторизации через Google с Firebase

Этот документ объясняет, как реализована авторизация через Google в проекте `ecommerce-server` с использованием Firebase Admin SDK.

## Обзор

Процесс авторизации позволяет пользователям входить в систему, используя свои Google аккаунты. Процесс включает в себя вход через Google на стороне клиента (frontend), получение ID токена и его проверку на стороне сервера (backend) с помощью Firebase.

## Архитектура процесса

1.  **Frontend**: Пользователь нажимает "Войти через Google". Фронтенд использует Firebase Client SDK (или Google Identity Services) для авторизации пользователя в Google.
2.  **Frontend**: Получает **Firebase ID Token** (JWT) от Google после успешного входа.
3.  **Frontend**: Отправляет этот ID токен на эндпоинт бэкенда `POST /api/v1/auth/google`.
4.  **Backend**: Получает ID токен.
5.  **Backend**: Проверяет ID токен с помощью **Firebase Admin SDK**.
6.  **Backend**: Извлекает информацию о пользователе (email, имя) из проверенного токена.
7.  **Backend**: Проверяет, существует ли пользователь в локальной базе данных MongoDB:
    *   **Если существует**: Авторизует пользователя.
    *   **Если новый**: Создает новую запись пользователя с полем `provider: 'google'`.
8.  **Backend**: Генерирует собственный JWT access токен (долгоживущий, 7 дней) и возвращает его на фронтенд вместе с данными пользователя.

## Детали реализации

### 1. Конфигурация Firebase

**Файл**: `src/core/config/firebase.js`

Этот файл отвечает за инициализацию Firebase Admin SDK. Он требует файл ключа сервисного аккаунта.

*   **Инициализация**: Пытается загрузить `serviceAccountKey.json` из нескольких возможных путей (корень проекта, родительские папки и т.д.).
*   **Экспорт**: Экспортирует экземпляр `admin` и `bucket` (для хранилища).

```javascript
const admin = require('firebase-admin');
// ... загрузка serviceAccountKey.json ...
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'ecommerce-jasuraka.appspot.com',
});
```

### 2. Контроллер Google Auth

**Файл**: `src/modules/auth/auth.google.controller.js`

Этот контроллер содержит бизнес-логику для проверки токена и управления пользователями.

*   **Эндпоинт**: `googleAuth`
*   **Основная логика**:
    ```javascript
    // 1. Проверка токена, полученного с фронтенда
    const googleUser = await admin.auth().verifyIdToken(idToken);
    
    // 2. Поиск или создание пользователя
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
        user = await User.create({
            name: googleUser.name,
            email: googleUser.email,
            provider: 'google',
            role: 'customer'
        });
    }

    // 3. Генерация внутреннего JWT
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });
    ```

### 3. Маршруты (Routes)

**Файл**: `src/modules/auth/auth.routes.js`

Маршрут определен следующим образом:

```javascript
router.post('/google', google.googleAuth);
```

В этом файле также содержится Swagger документация, описывающая ожидаемое тело запроса (`idToken`) и структуру ответа.

## Требования для настройки

Для работы авторизации в новой среде необходимо:

1.  **Firebase Project**: Проект, созданный в Firebase Console.
2.  **Service Account Key**:
    *   Перейдите в Project Settings > Service accounts.
    *   Сгенерируйте новый приватный ключ.
    *   Сохраните файл как `serviceAccountKey.json` в корне проекта (или проверьте путь в `src/core/config/firebase.js`).
    *   **ВАЖНО**: Никогда не добавляйте `serviceAccountKey.json` в систему контроля версий (git).

## Устранение неполадок (Troubleshooting)

### Ошибка: `auth/unauthorized-domain`

Если вы видите ошибку `Refused to display...` или `auth/unauthorized-domain` на клиенте (например, при деплое на Vercel), это означает, что домен, с которого идет запрос, не разрешен в настройках Firebase.

**Решение:**

1.  Перейдите в **Firebase Console**.
2.  Выберите ваш проект.
3.  В меню слева выберите **Authentication**.
4.  Перейдите на вкладку **Settings**.
5.  Перейдите на вкладку **Authorized domains** (Разрешенные домены).
6.  Нажмите **Add domain**.
7.  Введите домен вашего приложения (например, `myapp.vercel.app` или ваш кастомный домен `example.com`).
8.  Нажмите **Add**.

## Контракт API

### Запрос

**POST** `/api/v1/auth/google`

```json
{
  "idToken": "eyJhbGciOiJSU..." // Firebase ID Token с клиента
}
```

### Ответ (Успех)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUz...", // Внутренний JWT токен
  "user": {
    "_id": "...",
    "name": "Имя Пользователя",
    "email": "user@gmail.com",
    "role": "customer",
    "provider": "google"
  }
}
```
