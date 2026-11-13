// Main JS for MHEnt Universe Apps Hub
document.addEventListener('DOMContentLoaded', () => {
  initCosmicCanvas();
  bindDownloadButtons();
  handleAutoDownload();
  fetchLiveReleaseInfo();
});

// Subtle ambient cosmic stars canvas
function initCosmicCanvas() {
  const canvas = document.querySelector('.cosmic-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const stars = [];
  const starCount = Math.floor((width * height) / 12000);

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.005 + 0.002
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(s => {
      s.alpha += Math.sin(Date.now() * s.speed) * 0.01;
      s.alpha = Math.max(0.1, Math.min(0.85, s.alpha));
      ctx.fillStyle = `rgba(180, 220, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(render);
  }
  render();
}

// Bind config values to download buttons
function bindDownloadButtons() {
  const cfg = window.MHENT_APPS_CONFIG;
  if (!cfg) return;

  // Horizon Buttons
  const horizonBtns = document.querySelectorAll('[data-app="horizon"]');
  horizonBtns.forEach(btn => {
    if (btn.tagName === 'A' && cfg.horizon?.downloadUrl) {
      btn.href = cfg.horizon.downloadUrl;
    }
  });

  // Orbit Buttons
  const orbitBtns = document.querySelectorAll('[data-app="orbit"]');
  orbitBtns.forEach(btn => {
    if (btn.tagName === 'A' && cfg.orbit?.downloadUrl) {
      btn.href = cfg.orbit.downloadUrl;
    }
  });

  // Study Buttons
  const studyBtns = document.querySelectorAll('[data-app="study"]');
  studyBtns.forEach(btn => {
    if (btn.tagName === 'A' && cfg.study?.downloadUrl) {
      btn.href = cfg.study.downloadUrl;
    }
  });

  const studyPortableBtns = document.querySelectorAll('[data-app="study-portable"]');
  studyPortableBtns.forEach(btn => {
    if (btn.tagName === 'A' && cfg.study?.portableUrl) {
      btn.href = cfg.study.portableUrl;
    }
  });

  const studyAndroidBtns = document.querySelectorAll('[data-app="study-android"]');
  studyAndroidBtns.forEach(btn => {
    if (btn.tagName === 'A' && cfg.study?.androidUrl) {
      btn.href = cfg.study.androidUrl;
    }
  });
}

// Handle auto-download query (?download=true or ?direct=1)
function handleAutoDownload() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('download') === '1' || params.get('download') === 'true') {
    const mainBtn = document.querySelector('.download-btn-main');
    if (mainBtn && mainBtn.href && mainBtn.href !== '#' && !mainBtn.href.startsWith('javascript:')) {
      const notice = document.createElement('div');
      notice.className = 'hero-pill';
      notice.style.marginTop = '16px';
      notice.innerHTML = '<span class="hero-pill-dot"></span> Đang bắt đầu tải xuống bản cài đặt...';
      mainBtn.parentNode.insertBefore(notice, mainBtn.nextSibling);

      setTimeout(() => {
        window.location.href = mainBtn.href;
      }, 1200);
    }
  }
}

// Live GitHub release info fetching for apps that support dynamic assets
async function fetchLiveReleaseInfo() {
  const studyReleaseEl = document.getElementById('study-live-release');
  if (!studyReleaseEl) return;

  try {
    const res = await fetch('https://api.github.com/repos/mhentuniverse/mhent-study/releases/latest');
    if (!res.ok) return;
    const data = await res.json();

    const ver = data.tag_name || 'v2.2.0';
    const verBadges = document.querySelectorAll('.study-version-badge');
    verBadges.forEach(badge => badge.textContent = `Phiên bản ${ver}`);

    if (data.published_at) {
      const date = new Date(data.published_at);
      const dateStr = date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
      const dateEl = document.getElementById('study-release-date');
      if (dateEl) dateEl.textContent = dateStr;
    }

    const assets = data.assets || [];
    const setupExe = assets.find(a => a.name.includes('Setup') && a.name.endsWith('.exe'));
    const portableExe = assets.find(a => (a.name.includes('Portable') || !a.name.includes('Setup')) && a.name.endsWith('.exe'));
    const releaseApk = assets.find(a => a.name.includes('Release') && a.name.endsWith('.apk'));

    if (setupExe) {
      document.querySelectorAll('[data-app="study"]').forEach(btn => {
        if (btn.tagName === 'A') btn.href = setupExe.browser_download_url;
      });
      const sizeEl = document.getElementById('size-study-setup');
      if (sizeEl) sizeEl.textContent = `${(setupExe.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (portableExe) {
      document.querySelectorAll('[data-app="study-portable"]').forEach(btn => {
        if (btn.tagName === 'A') btn.href = portableExe.browser_download_url;
      });
      const sizeEl = document.getElementById('size-study-portable');
      if (sizeEl) sizeEl.textContent = `${(portableExe.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (releaseApk) {
      document.querySelectorAll('[data-app="study-android"]').forEach(btn => {
        if (btn.tagName === 'A') btn.href = releaseApk.browser_download_url;
      });
      const sizeEl = document.getElementById('size-study-android');
      if (sizeEl) sizeEl.textContent = `${(releaseApk.size / (1024 * 1024)).toFixed(1)} MB`;
    }
  } catch (err) {
    console.debug('Using fallback config for study release assets');
  }
}
