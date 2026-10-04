const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf8');

// Global font
css = css.replace(/font-family:.*?;/g, "font-family: 'Press Start 2P', monospace; image-rendering: pixelated;");

// UI Panel
css = css.replace(/\.ui-panel \{[\s\S]*?\.ui-panel:hover \{[\s\S]*?\}/, `.ui-panel {
  background: #000;
  border: 4px solid #d50000;
  box-shadow: 4px 4px 0 0 #0038ce;
  border-radius: 0;
  pointer-events: auto;
}
.ui-panel:hover {
  border-color: #ffce00;
}`);

// Buttons
css = css.replace(/\.btn-primary \{[\s\S]*?\.btn-primary:hover:not\(:disabled\)::before \{[\s\S]*?\}/, `.btn-primary {
  background: #0038ce;
  border: 4px solid #ffffff;
  color: #FFFFFF;
  text-transform: uppercase;
  padding: 14px 32px;
  cursor: pointer;
  border-radius: 0;
  font-size: 14px;
  box-shadow: 4px 4px 0 0 #000;
}

.btn-primary:hover:not(:disabled) {
  background: #d50000;
  border-color: #ffce00;
  color: #ffce00;
  box-shadow: 2px 2px 0 0 #000;
  transform: translate(2px, 2px);
}`);

fs.writeFileSync('src/style.css', css);
console.log('CSS updated');
