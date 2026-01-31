# ▶️ RUN THIS FIRST - Финальный набор команд

**Выполни эти команды на твоей локальной машине в точном порядке**

---

## 📋 STEP 1: Подготовить SSH ключ

```bash
# Создай файл с приватным ключом
mkdir -p ~/.ssh
cat > ~/.ssh/parrot_shop_deploy << 'KEYEOF'
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsgAAAKBt9d5zbfXe
cwAAAAtzc2gtZWQyNTUxOQAAACDPwxE1kOeMvERedwBVMjCRm8N1vemxScQdv6qwiprBsg
AAAEBhByuLWSzGIxx2oYOdK9S3dCqO4Z3Q6B9eXp97+o6+OM/DETWQ54y8RF53AFUyMJGb
w3W96bFJxB2/qrCKmsGyAAAAGmdpdGh1Yi1hY3Rpb25zQHBhcnJvdC1zaG9wAQID
-----END OPENSSH PRIVATE KEY-----
KEYEOF

chmod 600 ~/.ssh/parrot_shop_deploy

echo "✅ SSH приватный ключ сохранён"
```

---

## 📋 STEP 2: Установить публичный ключ на сервер

```bash
# Установи публичный ключ на сервер (будет запрос пароля)
ssh-copy-id -i ~/.ssh/parrot_shop_deploy.pub root@144.31.212.184

# Когда будет запрос пароля, введи: eh5gRDe4yCsK
```

---

## 📋 STEP 3: Проверить SSH подключение

```bash
# Тест - должно работать БЕЗ пароля!
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184 "echo '✅ SSH works!'"
```

---

## 📋 STEP 4: Показать приватный ключ для GitHub Secrets

```bash
# Скопируй этот вывод (весь текст между BEGIN и END)
cat ~/.ssh/parrot_shop_deploy
```

---

## 📋 STEP 5: Добавить GitHub Secrets

Открой: **https://github.com/YOUR_USERNAME/Optimal-Functionality**

1. Нажми **Settings**
2. Слева: **Secrets and variables** → **Actions**
3. Нажми **New repository secret**
4. Добавь ЭТИ 4 СЕКРЕТА:

### Секрет #1
```
Name: SSH_PRIVATE_KEY
Value: [вставь содержимое из STEP 4 включая строки BEGIN/END]
```

### Секрет #2
```
Name: SERVER_HOST
Value: 144.31.212.184
```

### Секрет #3
```
Name: SERVER_USER
Value: root
```

### Секрет #4
```
Name: DEPLOY_PATH
Value: /opt/parrot-shop
```

---

## 📋 STEP 6: Запустить деплой

```bash
# Всё уже готово, просто пушим в main!
git push origin main
```

---

## 📋 STEP 7: Смотреть деплой

1. Открой: https://github.com/YOUR_USERNAME/Optimal-Functionality
2. Нажми вкладку **Actions**
3. Выбери **Deploy to VPS**
4. Смотри логи каждого шага (зелёные ✅ = хорошо)

---

## ✅ STEP 8: Проверить что всё работает

```bash
# Когда деплой завершится (должна быть зелёная галочка):

# Проверка API
curl http://144.31.212.184/api/products

# Проверка health endpoint
curl http://144.31.212.184/health

# Проверка статуса на сервере
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184 "systemctl status parrot-shop"
```

---

## 🎯 Результат

После выполнения всех шагов:
- ✅ Каждый `git push` в `main` автоматически деплоится
- ✅ GitHub Actions собирает код
- ✅ Загружает на сервер
- ✅ Перезапускает приложение
- ✅ Отправляет Telegram уведомление (если настроено)

---

## 🆘 Если что-то не работает

### SSH не работает
```bash
# Проверить что ключ на месте
ls -la ~/.ssh/parrot_shop_deploy

# Проверить права
chmod 600 ~/.ssh/parrot_shop_deploy

# Попробовать с verbose
ssh -i ~/.ssh/parrot_shop_deploy -vvv root@144.31.212.184
```

### GitHub Actions падает
- Проверить GitHub Actions логи (какой step провалился)
- Убедиться что все 4 Secrets добавлены без пробелов
- SSH_PRIVATE_KEY должен включать BEGIN/END строки

### Приложение не работает
```bash
# Посмотреть логи на сервере
ssh -i ~/.ssh/parrot_shop_deploy root@144.31.212.184
journalctl -u parrot-shop -n 50 --no-pager
exit
```

---

## 📚 Дополнительные файлы справки

- `DEPLOY_SETUP.md` - подробная инструкция
- `GITHUB_ACTIONS_SETUP.md` - детальное руководство
- `GITHUB_ACTIONS_QUICK_START.md` - краткая справка
- `.kiro/steering/ci-cd.md` - документация для Kiro AI

---

**Всё готово! Начинай с STEP 1** 🚀
