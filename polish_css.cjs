const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf8');

// Replace all remaining rgba(...) backgrounds/borders with solid colors for 8-bit
css = css.replace(/rgba\([^)]+\)/g, 'transparent'); // Mostly leftover glassmorphism

// Fix .btn-secondary
css = css.replace(/\.btn-secondary \{[\s\S]*?\.btn-secondary:hover \{[\s\S]*?\}/, `.btn-secondary {
  background: #000;
  border: 4px solid #0038ce;
  color: #fff;
  text-transform: uppercase;
  padding: 10px 24px;
  cursor: pointer;
  border-radius: 0;
  font-size: 12px;
  box-shadow: 4px 4px 0 0 #000;
}
.btn-secondary:hover {
  background: #ff5a00;
  border-color: #ffce00;
  color: #fff;
}`);

// Fix primary active state
css = css.replace(/\.btn-primary:active:not\(:disabled\) \{[\s\S]*?\}/, `.btn-primary:active:not(:disabled) {
  transform: translate(4px, 4px);
  box-shadow: 0px 0px 0 0 #000;
}`);

fs.writeFileSync('src/style.css', css);
console.log('CSS polished');
