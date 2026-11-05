# Contributing to SensorKTP

Thanks for considering a contribution. Small, focused changes make the project easier to review and maintain.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- For substantial changes, open an issue first to discuss the approach.
- Never include real KTP images, NIKs, addresses, faces, or other personal information in commits, screenshots, fixtures, or issue reports. Use synthetic data only.

## Development setup

```bash
git clone https://github.com/Nightfall5/sensorktp.git
cd sensorktp
npm install
npm run dev
```

## Before opening a pull request

Run all project checks:

```bash
npm run lint
npm run typecheck
npm run build
```

Please keep pull requests focused and include:

- A clear description of the problem and the proposed change.
- Steps to reproduce or verify the change.
- Screenshots or a short recording for visible UI changes, using synthetic data only.
- Notes about browser compatibility when using browser-specific APIs.

## Pull request guidelines

- Use descriptive branch and commit names.
- Avoid unrelated formatting or dependency changes.
- Update the README when user-facing behavior or setup instructions change.
- Do not add analytics, remote image uploads, or third-party services that receive user images without first discussing the privacy implications in an issue.

By contributing, you agree that your contributions will be distributed under the project's MIT License.
