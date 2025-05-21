# Project Topsyde

## Description
Project Topsyde is a web application built using Vue 3, TypeScript, and Vite. It features real-time chat, user authentication, a "match" functionality, and utilizes WebSockets for real-time communication.

## Features
- Real-time chat functionality
- User authentication (Login/Logout)
- "Match" feature for core application functionality
- Websocket integration for live data updates and interactions
- User-configurable settings

## Getting Started

### Prerequisites
- Node.js (version specified in `.nvmrc` if available, otherwise latest LTS)
- Bun (as `bun.lockb` is present)

### Installation & Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. **Install dependencies:**
   ```bash
   bun install
   ```
3. **Run the development server:**
   ```bash
   bun run dev
   ```
   The application should now be running on the development server (typically `http://localhost:5173` or similar).

## Project Structure
A brief overview of the key directories:
- `src/`: Contains the main source code for the Vue application.
  - `api/`: Handles API integrations and communication with the backend.
  - `assets/`: Stores static assets like CSS, images, and fonts.
  - `common/`: Includes shared utilities, composables, constants, and type definitions.
  - `components/`: Houses reusable Vue components.
  - `router/`: Defines the application's routing configuration using Vue Router.
  - `stores/`: Contains state management stores (e.g., Pinia).
  - `views/`: Top-level Vue components that represent application pages or views.
- `public/`: Static assets that are directly served by the webserver (e.g., `index.html`, favicons).
- `docs/`: Contains documentation, including deployment guides.
- `scripts/`: Shell scripts for various tasks like deployment.
- `.github/`: GitHub-specific files, including workflow definitions for CI/CD.
- `.cursor/`: Configuration files for the Cursor IDE or related tools.

## Deployment
For detailed instructions on how to deploy the application, please refer to the [Deployment Guide](./docs/README.md).

## Contributing
Contributions are welcome! Please feel free to open an issue to discuss a new feature or bug, or submit a pull request with your changes.

## License
This project is licensed under the terms of the [LICENSE](./LICENSE) file.
