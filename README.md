# Snip - Collaborative Code Editor

> Snip is a lightweight, local-first code editor in the browser. It features file/folder management, drag-and-drop support, code execution with error handling, and a VS Code–like tabbed interface using Monaco Editor. Built for developers who want a fast and interactive experience!

## Built With

- **Next.js App Router**
- **React**
- **TypeScript**
- **Monaco Editor**
- **Material UI (MUI)**
- **@dnd-kit**
- **Lodash**
- **Node.js (API Routes)**
- **File-based storage (no DB needed)**

---

## Getting Started

To get a local copy up and running follow these simple example steps:

---

## Setup

### Clone and Install

```bash
git clone https://github.com/uzairali19/snip.git
cd snip
npm install
npm run dev
```

> 🚀 Visit `http://localhost:3000` to launch the app.

---

## Features

✅ **File Explorer**

- Create files and folders via modal
- Right-click context menu for **Rename** and **Delete**
- Drag-and-drop reordering of files/folders
- Active folder selection and tab tracking

✅ **Code Editor**

- Powered by Monaco Editor
- Tabbed file interface (like VS Code)
- Auto-save on code change with debounce
- Syntax highlighting and error detection

✅ **Execution Panel**

- Run JavaScript files with the **▶ Run** button
- See output logs, runtime errors, and line number tracing
- Handles both syntax and runtime exceptions gracefully

✅ **Persistence**

- File structure and content stored locally via a `snippets.json` file on the server
- No database or login required

---

## Author

👤 **Uzair Ali**

- GitHub: [@uzairali19](https://github.com/uzairali19)
- Twitter: [@Uzairali751](https://twitter.com/Uzairali751)
- LinkedIn: [linkedin.com/in/uzairali19](https://www.linkedin.com/in/uzairali19/)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to check the [issues page](https://github.com/uzairali19/snip/issues).

---

## Show your support

Give a ⭐️ if you like this project and want more features like multi-user collaboration or backend sync!
