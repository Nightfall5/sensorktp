# Security Policy

SensorKTP handles identity-document images, which may contain highly sensitive personal information. Please report security concerns responsibly.

## Reporting a vulnerability

Do not create a public issue containing a vulnerability that could expose personal data or compromise users. Use GitHub's **Report a vulnerability** feature in the repository's Security tab when it is available. Include a concise description, impact, reproduction steps, and any suggested mitigation.

Never attach real KTP images, NIKs, addresses, or other personal data. Use synthetic examples.

## Important limitations

- Automatic OCR and face detection can miss sensitive content or produce inaccurate regions. Users must inspect the final image before sharing it.
- Browser face detection is not supported in every browser.
- Blur is not a reliable security control for highly sensitive information. Prefer solid redaction.
- A watermark does not prevent copying, screenshots, modification, or misuse.
