<div align="center">
  <img src="public/favicon.svg" alt="SensorKTP logo" width="76" height="76" />
  <h1>SensorKTP</h1>
  <p><strong>Protect personal information before sharing an Indonesian ID card.</strong></p>
  <p>
    <a href="https://github.com/Nightfall5/sensorktp/actions/workflows/ci.yml"><img src="https://github.com/Nightfall5/sensorktp/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License" /></a>
    <img src="https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white" alt="Vite" />
  </p>
</div>

SensorKTP is a browser-based tool for preparing safer copies of **Kartu Tanda Penduduk (KTP)**, Indonesia's national identity card. It helps identify personal information that should not be exposed, lets you review and adjust the covered areas, and exports a watermarked image for a specific purpose.

The interface is currently in **Bahasa Indonesia**.

## Why SensorKTP?

A photo of an identity card can expose more information than a recipient actually needs. SensorKTP helps you reduce that exposure before sending a copy.

- **Local image processing** — the selected image is processed in the browser; the application does not upload it to an application backend.
- **Sensitive-area assistance** — OCR helps locate a 16-digit NIK and the address field. Face detection is attempted when the browser supports the `FaceDetector` API.
- **Manual redaction** — draw additional areas over any information that should be hidden.
- **Two redaction styles** — use a solid black cover or a blur effect.
- **Purpose and date watermark** — add context to the exported image to discourage reuse for another purpose.
- **Image export** — download the processed result as a JPEG.

## How it works

1. Enter the purpose for sharing the KTP copy.
2. Select or drag and drop a JPG, PNG, or WEBP image.
3. Let SensorKTP scan the image for supported sensitive fields.
4. Review every detected area. Enable, disable, or supplement the suggested areas manually.
5. Choose a redaction style and download the watermarked image.

> **Always review the result before sharing it.** Automatic detection is a helper, not a guarantee. OCR can miss text or select the wrong area, and automatic face detection depends on browser support. Add or adjust redaction areas manually whenever needed.

## Privacy and security notes

- The image is rendered and processed locally in the browser. SensorKTP does not send the selected image to an application server.
- The OCR engine may need to download its worker and Indonesian language data when it runs. This does not mean the selected KTP image is uploaded.
- Image data is held in the current browser session. Reloading or closing the page clears the in-memory working image.
- For sensitive information, prefer **Hitam penuh** (solid black) rather than blur. Do not rely on blur as a strong security boundary.
- A watermark is a deterrent and context marker; it does not prevent screenshots, editing, or misuse.
- Do not use sample images containing real identity information in issues, pull requests, tests, or screenshots. Use synthetic or fully anonymized examples.

SensorKTP is a privacy aid, not a substitute for a careful review or an official identity-verification process. Share identity documents only when necessary and with trusted recipients.

## Requirements

- Node.js 20.19+ or 22.12+ (recommended: Node.js 22 LTS)
- npm 10+
- A modern browser with JavaScript and WebAssembly enabled

Face detection is optional and browser-dependent. If it is unavailable, use the manual redaction tool to cover the face.

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/Nightfall5/sensorktp.git
cd sensorktp

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`). An internet connection may be needed for the OCR worker and language data on the first scan.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Check the application TypeScript types. |

## Tech stack

- [React](https://react.dev/) 18
- [TypeScript](https://www.typescriptlang.org/) 5
- [Vite](https://vite.dev/) 7
- [Tailwind CSS](https://tailwindcss.com/) 3
- [Tesseract.js](https://tesseract.projectnaptha.com/) for Indonesian OCR
- [Lucide React](https://lucide.dev/) for icons
- HTML Canvas API for image processing and export

## Project structure

```text
sensorktp/
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── RedactionCanvas.tsx
│   │   ├── ReviewStep.tsx
│   │   └── UploadStep.tsx
│   ├── lib/
│   │   ├── detectSensitiveRegions.ts
│   │   ├── loadImageToCanvas.ts
│   │   ├── regions.ts
│   │   └── renderSanitized.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
└── package.json
```

## Contributing

Contributions are welcome. If you have an idea, bug report, or improvement:

1. Check existing issues before opening a new one.
2. Create a focused branch for your change.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
4. Open a pull request with a clear explanation and screenshots where useful.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

## Security

If you discover a security issue, please do not publish real KTP images, NIKs, addresses, or other personal data in a public issue. Read [SECURITY.md](SECURITY.md) for safe reporting guidance.

## License

SensorKTP is released under the [MIT License](LICENSE).

---

<div align="center">
  Built to make sharing identity documents a little safer.
</div>
