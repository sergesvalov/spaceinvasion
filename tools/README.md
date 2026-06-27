# Utility Tools & Scripts 🧰

This directory contains generic utility scripts intended to automate development tasks, asset processing, or testing.

## 🤖 AI Agent Instructions

When you (an AI agent) determine that a utility script is needed to accomplish a task (e.g., image manipulation, data extraction, code generation), you MUST adhere to the following rules:

### 1. File Location
All utility scripts MUST be placed in this `tools/` directory. **Do not create scripts in the project root.**

### 2. Generality & CLI Arguments
Scripts should be reusable. Avoid hardcoding specific input/output paths for a single task inside the script. Instead:
- Accept parameters via command line arguments (`process.argv` in Node.js, `sys.argv` in Python).
- Print a clear `Usage: ...` message if the wrong number of arguments is provided.

### 3. Dependencies
- **Node.js**: If you use Node.js scripts (preferred for a TS/JS project), make sure to use standard `require` or modern ES module imports appropriately (`.mjs` extension is recommended for ESM if `package.json` isn't set to type="module"). If you add a new dependency (like `jimp`), ensure it's installed via `npm install` and ideally save it to `devDependencies` if it's meant to be persistent.
- **Python**: If you write Python scripts, consider that the environment might not have all packages installed. Provide an instruction comment at the top of the script indicating which `pip install` commands are required.

### 4. Logging & Errors
- Print `console.log` or `print` statements detailing the progress (e.g., "Loaded file X", "Processed Y items").
- Ensure the script exits with code `1` (`process.exit(1)` or `sys.exit(1)`) on error, so the agent's bash runner catches the failure properly.

---

## 📜 Available Tools

### `remove_bg.mjs`
Strips near-white background colors from an image, turning them fully transparent (alpha=0). Extremely useful for processing AI-generated sprites.
**Usage**:
```bash
node tools/remove_bg.mjs <absolute_input_path> <absolute_output_path>
```

### `generate_pew.cjs`
Generates a retro 8-bit laser/pew sound effect and saves it as a `.wav` file.
**Usage**:
```bash
node tools/generate_pew.cjs <output_path.wav>
```

### Alternative Background Removal Scripts
If `remove_bg.mjs` is unavailable or you lack Node.js dependencies, there are Python and PowerShell alternatives provided:
- `remove_bg.py` & `remove_bg_floodfill.py`: Python implementations. Require `Pillow`.
- `remove-bg.ps1` & `remove-bg-floodfill.ps1`: PowerShell implementations (slower, but no external dependencies required on Windows).
