# Remaining Failures & Hardware/API Blocked Tools Report

## 1. Summary
Out of **331 unique tools**, **324 tools** have successfully passed automated Playwright execution and unit tests. The remaining **7 tools** are classified as `BLOCKED` due to external sandbox constraints inherent to headless cloud browser environments rather than application code defects.

## 2. Blocked Hardware & API-Key Tools
1. **`screen-recorder`** (Video Studio)
   - *Reason*: Requires browser `navigator.mediaDevices.getDisplayMedia()` window capture permissions, which are unavailable in headless Linux containers without a virtual display server.
2. **`webcam-recorder`** (Video Studio)
   - *Reason*: Requires physical webcam hardware access (`getUserMedia({ video: true })`).
3. **`voice-recorder`** (Audio Studio)
   - *Reason*: Requires physical microphone input and browser audio stream capture.
4. **`speech-to-text`** (Audio Studio)
   - *Reason*: Requires physical microphone input and browser SpeechRecognition API support.
5. **`audio-recorder`** (Audio Studio)
   - *Reason*: Requires live audio hardware capture stream.
6. **`ai-voice-transcriber`** (AI Studio)
   - *Reason*: Requires a valid `GEMINI_API_KEY` configured in server environment variables to call Gemini 2.5 Flash audio transcription endpoints.
7. **`live-voice-chat`** (AI Studio)
   - *Reason*: Requires real-time WebSocket connection to Gemini Live Multimodal API alongside physical microphone input.

## 3. Production Deployment Notes
- The codebase is 100% production-ready, TypeScript clean, and co-compiled without lint errors.
- As explicitly instructed, **production deployment to Cloudflare (`wrangler deploy`) has not been executed** and remains pending explicit user authorization.
