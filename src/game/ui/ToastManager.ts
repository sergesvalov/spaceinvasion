export class ToastManager {
  public static showAchievement(title: string, desc: string) {
    const achEl = document.createElement('div');
    achEl.className = 'achievement-toast ui-panel';
    achEl.style.position = 'absolute';
    achEl.style.top = '20px';
    achEl.style.left = '50%';
    achEl.style.transform = 'translateX(-50%) translateY(-100px)';
    achEl.style.zIndex = '1000';
    achEl.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    achEl.style.display = 'flex';
    achEl.style.flexDirection = 'column';
    achEl.style.alignItems = 'center';
    achEl.style.background = 'rgba(0, 50, 20, 0.8)';
    achEl.style.border = '1px solid #00ff00';
    
    achEl.innerHTML = `
      <div style="color: #00ff00; font-weight: bold; font-size: 14px; margin-bottom: 4px;">🏆 ACHIEVEMENT UNLOCKED</div>
      <div style="color: #ffffff; font-weight: bold; font-size: 18px;">${title}</div>
      <div style="color: #cccccc; font-size: 12px; text-align: center;">${desc}</div>
    `;

    document.getElementById('ui-container')?.appendChild(achEl);

    // Slide in
    setTimeout(() => {
      achEl.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);

    // Slide out and remove
    setTimeout(() => {
      achEl.style.transform = 'translateX(-50%) translateY(-150px)';
      setTimeout(() => achEl.remove(), 500);
    }, 4000);
  }
}
