# UNBdev.board Wi-Fi and MQTT scope

This feature is part of the combined micro:bit V2-only UNBdev.board extension;
micro:bit V1 is not a supported hardware variant.

## Acceptance gate

This module is not ready for final acceptance until the installed ESP32
firmware identity/version is supplied and the physical test matrix below
passes. Controller firmware `2.17`, verified under issue #40, is separate from
the ESP32 AT firmware.

Record the response to `AT+GMR` before release:

```text
ESP32 AT firmware identity/version: NOT YET PROVIDED
```

The `Wi-Fi firmware version` block and `firmwareVersion()` API issue this
read-only query without exposing network credentials.

## Supported behavior

- Integrated ESP32 through the shared controller BuiltIn UART and UART event.
- ESP-AT station mode, access-point join, status, disconnect, and restart.
- MQTT 3.1.1 anonymous clean sessions over unencrypted TCP port 1883, marked
  connected only after a successful broker CONNACK.
- QoS 0 publish and subscribe (SUBACK validated), 60-second keep-alive, and
  multiple topic handlers. MQTT field sizes are encoded UTF-8 byte lengths.
- Single-byte MQTT remaining lengths only (packet body smaller than 127 bytes).

TLS, MQTT credentials, QoS 1/2, retained messages, wills, multi-byte remaining
lengths, arbitrary ESP-AT connection IDs, access-point mode, and automatic
credential-based reconnect are not supported. The legacy Brilliant Labs Cloud
SSL/credential blocks are intentionally excluded until its service contract
and credential policy are approved.

## Credential safety

SSID/password values are supplied by the user's project, used only to form the
ESP-AT join command, and are never retained globally, logged, or embedded in
examples. Secrets entered into a MakeCode project remain in that project's
compiled program; never publish a project containing real credentials.

## Intentional differences

The deployed source enters permanent display loops on several failures and
prints MQTT details. This module instead returns `false`, exposes a non-secret
`lastError()`, and uses bounded timeouts. Restart uses `AT+RST`; it does not
factory-restore the ESP32 or send placeholder credentials. Publish while
disconnected and malformed/oversized input fail explicitly.

## Required physical verification

Record board, ESP32 version, controller version, extension revision, procedure,
expected result, and actual result for:

1. correct-credential connection and status;
2. wrong-credential rejection/timeout without freezing;
3. broker connection and QoS 0 publish;
4. text and numeric subscription events on multiple topics;
5. fragmented/malformed response handling;
6. broker disconnect, explicit reconnect, and resubscription;
7. Wi-Fi disconnect/restart followed by recovery.

Never record real credentials or private broker tokens in test evidence.

## Provenance and licence

The behavioral baseline is the deployed Brilliant Labs MakeCode target's
browser-exposed `core/bBoardWiFi.ts`, inspected 2026-09-24. It uses ESP-AT over
`bBoard_Control` UART and locally constructs MQTT packets. This implementation
was reorganized around the shared UNBdev.board control layer and the safety
constraints above. See `THIRD_PARTY_NOTICES.md` for attribution and the
upstream MIT notice.
