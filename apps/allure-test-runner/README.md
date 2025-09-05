#### Предикаты (функции валидации)
Доступны в выражениях без вызова скобками (их передают значениями), ожидают на вход проверяемое значение и возвращают `{ isValid: boolean, errors?: string[] }`:
- `isNonNegativeInt(value)` — число-целое ≥ 0.
- `isValidString(value)` — строка.
- `isValidRawAddressString(value)` — строка адреса в RAW-формате.
- `isValidNetwork(value)` — одно из `CHAIN.MAINNET | CHAIN.TESTNET` (значения: `-239`/`-3`).
- `isValidStateInitString(value)` — корректный BOC stateInit (base64).
- `isValidPublicKey(value)` — hex-ключ длиной 32 байта.
- `isValidFeatureList(value)` — список фич TON Connect; валидирует `SendTransaction` (обязательный, `maxMessages` обязателен; для v5 — 255, ранее — 4) и `SignData` (валидные типы: `text|binary|cell`).
- `isValidSendTransactionId(value)` — id совпадает с текущим `sendTransactionRpcRequest.id` из контекста.
- `isValidSignDataId(value)` — id совпадает с `signDataRpcRequest.id`.
- `isValidCurrentTimestamp(value)` — timestamp в интервале ±1 сутки от «сейчас».
- `isValidDataSignature(value)` — проверка подписи SignData по публичному ключу кошелька и payload.
- `isValidTonProofSignature(value)` — проверка подписи ton_proof (НЕ для продакшена).
- `isValidSendTransactionBoc(value)` — глубокая проверка BOC результата sendTransaction: тип external-in, walletId по версии кошелька/сети, `validUntil`, соответствие количества и полей сообщений (`address`, bounce, `payload`, `amount`, `stateInit`).

#### Провайдеры (утилиты и генераторы значений)
Это функции, которые надо вызывать со скобками, часть — с аргументами:
- Время/сеть: `nowPlusMinutes(n)`, `nowPlus5Minutes()`, `nowMinus5Minutes()`, `mainnet()`, `testnet()`.
- Адрес/отправитель: `sender(format)` где `format` — `raw | bounceable | non-bounceable`.
- Ton Proof/приложение: `tonProofPayload()`, `appHost()`, `appHostLength()`.
- Сообщения для тестов: `verifyMerkleProofMessage()`, `updateMerkleProofMessage()`, `mintJettonWithDeployMessage()`, `mintJettonWithoutDeployMessage()`.
- Ограничение сообщений: `maxMessages()` — генерирует массив сообщений нужной длины по версии кошелька (v5 → 255, иначе → 4).

Пример использования в проверках:
```json
{
  "id": isNonNegativeInt,
  "network": testnet(),
  "payload": {
    "timestamp": isValidCurrentTimestamp,
    "domain": { "lengthBytes": appHostLength(), "value": appHost() }
  }
}
```

## Кейсы

### 1) Connect

Метаданные кейса:
- `manifestUrl` — позволяет подменить URL манифеста dApp на время теста.
- `excludeTonProof` — если `true`, Ton Proof не запрашивается и не должен присутствовать в `payload.items` ответа.

```json
{
  "event": "connect",
  "id": isNonNegativeInt,
  "payload": {
    "items": [
      {
        "name": "ton_addr",
        "address": isValidRawAddressString,
        "network": isValidNetwork,
        "walletStateInit": isValidStateInitString,
        "publicKey": isValidPublicKey
      },
      {
        "name": "ton_proof",
        "proof": {
          "timestamp": isValidCurrentTimestamp,
          "domain": {
            "lengthBytes": appHostLength(),
            "value": appHost()
          },
          "payload": tonProofPayload(),
          "signature": isValidTonProofSignature
        }
      }
    ],
    "device": {
      "platform": "android",
      "appName": isValidString,
      "appVersion": isValidString,
      "maxProtocolVersion": 2,
      "features": isValidFeatureList
    }
  }
}
```

### 2) Sign Data

Пример запроса:
```json
{
  "type": "text",
  "text": "I confirm this test signature request.",
  "from": "0:74439727ac9daafcdca1a3120efe0c35de7b7167370cda19df3f15a37bd0bc66",
  "network": "-239"
}
```

Ожидаемый результат:

```json
{
  "id": isValidSignDataId,
  "result": {
    "signature": isValidDataSignature,
    "address": isValidRawAddressString,
    "timestamp": isValidCurrentTimestamp,
    "domain": appHost(),
    "payload": {
      "type": "text",
      "text": "I confirm this test signature request.",
      "from": "0:74439727ac9daafcdca1a3120efe0c35de7b7167370cda19df3f15a37bd0bc66",
      "network": "-239"
    }
  }
}
```

### 3) Send Transaction

Предусловие (пример параметров запроса):
```json
{
  "validUntil": nowPlusMinutes(10),
  "messages": [
    {
      "address": "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M",
      "amount": "5000000",
      "stateInit": "te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==",
      "payload": "te6ccsEBAQEADAAMABQAAAAASGVsbG8hCaTc/g=="
    }
  ]
}
```

Ожидаемый результат:
```json
{
  "result": isValidSendTransactionBoc,
  "id": isValidSendTransactionId
}
```

Пояснения к проверке `isValidSendTransactionBoc`:
- Парсит BOC, убеждается, что это external-in сообщение к кошельку корректной версии и сети.
- Сверяет `validUntil`, количество сообщений и каждый элемент `messages`:
  - адрес и признак bounce;
  - `payload` и `stateInit` (если указаны);
  - `amount` (строгое совпадение со строковым значением nanoTON).

## Как писать проверки в кейсах

В описании ожидаемого результата используйте блоки с ```json:
- значениями-предикатами (например, `isNonNegativeInt`),
- и провайдерами (например, `nowPlusMinutes(10)`, `appHost()`).

Если нужно отключить Ton Proof — используйте метадату кейса `excludeTonProof = true` и адаптируйте проверку `payload.items`.
Для тестов, где требуется другой манифест dApp, укажите `manifestUrl`.

