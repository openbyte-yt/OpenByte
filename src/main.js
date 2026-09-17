// Pure JavaScript implementation of OpebByte downloads hub

const DEFAULT_LLAMA_TAG = 'b10992';
let currentReleaseTag = DEFAULT_LLAMA_TAG;

// Direct download URLs
const HARDWARE_CHECK_URL = 'https://github.com/openbyte-yt/HardwareChecker-llamacpp/blob/main/HardwareChecker.exe';
const SMOLLM_GGUF_URL = 'https://www.dropbox.com/scl/fi/h57rwcy41h42lpkt1s0p0/SmolLM2.gguf?rlkey=6mnphwbuidj7an3598h3t0etj&st=ltruutk1&dl=1';

// All 10 Windows builds definition generator
function getLlamaBuilds(tag) {
  return [
    {
      id: 'win-x64-cpu',
      name: 'Windows x64 (CPU)',
      arch: 'x86_64',
      backend: 'CPU (AVX / AVX2)',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-cpu-x64.zip`,
      description: 'Standard CPU binary for modern Intel and AMD processors.',
      badge: 'CPU',
    },
    {
      id: 'win-arm64-cpu',
      name: 'Windows arm64 (CPU)',
      arch: 'ARM64',
      backend: 'CPU Native',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-cpu-arm64.zip`,
      description: 'Native ARM64 for Snapdragon X Elite / Plus laptops and Windows on ARM.',
      badge: 'ARM64',
    },
    {
      id: 'win-arm64-opencl',
      name: 'Windows arm64 (OpenCL Adreno)',
      arch: 'ARM64',
      backend: 'OpenCL Adreno GPU',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-opencl-adreno-arm64.zip`,
      description: 'GPU acceleration for Qualcomm Adreno GPUs on Windows ARM64.',
      badge: 'Adreno',
    },
    {
      id: 'win-x64-cuda-12',
      name: 'Windows x64 (CUDA 12)',
      arch: 'x86_64',
      backend: 'NVIDIA CUDA 12.4',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-cuda-12.4-x64.zip`,
      dllUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/cudart-llama-bin-win-cuda-12.4-x64.zip`,
      dllName: 'CUDA 12.4 DLLs',
      description: 'NVIDIA RTX / GTX GPUs with CUDA 12.x drivers installed.',
      badge: 'CUDA 12',
    },
    {
      id: 'win-x64-cuda-13',
      name: 'Windows x64 (CUDA 13)',
      arch: 'x86_64',
      backend: 'NVIDIA CUDA 13.4',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-cuda-13.4-x64.zip`,
      dllUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/cudart-llama-bin-win-cuda-13.4-x64.zip`,
      dllName: 'CUDA 13.4 DLLs',
      description: 'Next-gen NVIDIA GPUs and environments targeting CUDA 13.x.',
      badge: 'CUDA 13',
    },
    {
      id: 'win-arm64-cuda-13',
      name: 'Windows arm64 (CUDA 13)',
      arch: 'ARM64',
      backend: 'NVIDIA CUDA 13.4 ARM',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-cuda-13.4-arm64.zip`,
      dllUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/cudart-llama-bin-win-cuda-13.4-arm64.zip`,
      dllName: 'CUDA 13.4 DLLs',
      description: 'CUDA acceleration for ARM64 Windows devices with NVIDIA hardware.',
      badge: 'CUDA ARM',
    },
    {
      id: 'win-x64-vulkan',
      name: 'Windows x64 (Vulkan)',
      arch: 'x86_64',
      backend: 'Vulkan Cross-Vendor',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-vulkan-x64.zip`,
      description: 'Cross-vendor GPU acceleration (AMD Radeon, Intel Arc, NVIDIA).',
      badge: 'Vulkan',
    },
    {
      id: 'win-x64-openvino',
      name: 'Windows x64 (OpenVINO)',
      arch: 'x86_64',
      backend: 'Intel OpenVINO',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-openvino-2026.3.1-x64.zip`,
      description: 'Optimized for Intel Core Ultra NPU, Iris Xe, and Arc GPUs.',
      badge: 'OpenVINO',
    },
    {
      id: 'win-x64-sycl',
      name: 'Windows x64 (SYCL)',
      arch: 'x86_64',
      backend: 'Intel oneAPI SYCL',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-sycl-x64.zip`,
      description: 'High-performance computing for Intel Arc / Data Center Flex GPUs.',
      badge: 'SYCL',
    },
    {
      id: 'win-x64-rocm',
      name: 'Windows x64 (ROCm 10.0)',
      arch: 'x86_64',
      backend: 'AMD ROCm 10.0',
      downloadUrl: `https://github.com/ggml-org/llama.cpp/releases/download/${tag}/llama-${tag}-bin-win-rocm-10.0-x64.zip`,
      description: 'Native AMD ROCm compute stack for supported Radeon graphics cards.',
      badge: 'ROCm',
    },
  ];
}

// Icons in inline SVG for pure dependency-free execution
const ICONS = {
  download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
  copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkCheck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`,
  externalLink: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>`,
};

// Download helper with auto raw URL conversion
function downloadFile(url, fileName) {
  let target = url.trim();
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `https://${target}`;
  }
  if (target.includes('github.com') && target.includes('/blob/')) {
    target = target.replace('/blob/', '/raw/');
  }
  const a = document.createElement('a');
  a.href = target;
  if (fileName) {
    a.setAttribute('download', fileName);
  }
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Copy link helper with visual feedback on button
function copyLink(url, btnElement) {
  let target = url.trim();
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `https://${target}`;
  }
  navigator.clipboard.writeText(target).then(() => {
    const originalHTML = btnElement.innerHTML;
    btnElement.innerHTML = ICONS.checkCheck;
    setTimeout(() => {
      btnElement.innerHTML = originalHTML;
    }, 1800);
  });
}

// Render builds into modal list
function renderBuildsList(filterText = '') {
  const container = document.getElementById('llama-builds-list');
  const countBadge = document.getElementById('filter-count');
  if (!container) return;

  const builds = getLlamaBuilds(currentReleaseTag);
  const q = filterText.toLowerCase().trim();

  const filtered = builds.filter(b => 
    b.name.toLowerCase().includes(q) ||
    b.backend.toLowerCase().includes(q) ||
    b.arch.toLowerCase().includes(q) ||
    (b.dllName && b.dllName.toLowerCase().includes(q))
  );

  if (countBadge) {
    countBadge.textContent = `${filtered.length} builds`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: #71717a; font-family: 'Patrick Hand', cursive;">
        No builds matched "${filterText}". Try searching for CPU, CUDA, or Vulkan.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(build => {
    const hasDll = Boolean(build.dllUrl && build.dllName);
    return `
      <div class="build-card" id="build-${build.id}">
        <div class="build-info">
          <div class="build-meta">
            <span class="build-badge">${build.badge || 'BUILD'}</span>
            <span class="build-arch">${build.arch}</span>
            <span class="build-backend">${build.backend}</span>
          </div>
          <h3 class="build-name font-hand">${build.name}</h3>
          ${build.description ? `<p class="build-desc font-hand">${build.description}</p>` : ''}
        </div>

        <div class="build-actions">
          ${hasDll ? `
            <button
              type="button"
              class="dll-download-btn font-hand"
              data-dll-url="${build.dllUrl}"
              title="Download ${build.dllName}"
            >
              ${ICONS.download}
              <span>${build.dllName}</span>
            </button>
          ` : ''}

          <button
            type="button"
            class="icon-action-btn copy-build-btn"
            data-url="${build.downloadUrl}"
            title="Copy direct ZIP download link"
          >
            ${ICONS.copy}
          </button>

          <button
            type="button"
            class="btn-zip-download font-hand download-build-btn"
            data-url="${build.downloadUrl}"
            title="Download ${build.name}"
          >
            ${ICONS.download}
            <span>Download ZIP</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners for dynamic build items
  container.querySelectorAll('.download-build-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      if (url) downloadFile(url);
    });
  });

  container.querySelectorAll('.dll-download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-dll-url');
      if (url) downloadFile(url);
    });
  });

  container.querySelectorAll('.copy-build-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.getAttribute('data-url');
      if (url) copyLink(url, btn);
    });
  });
}

// Modal open/close controls
function openModal() {
  const modal = document.getElementById('llama-modal');
  if (modal) {
    modal.classList.add('active');
    const input = document.getElementById('search-builds');
    if (input) {
      input.value = '';
      input.focus();
    }
    renderBuildsList('');
  }
}

function closeModal() {
  const modal = document.getElementById('llama-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Setup all page listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Query params
  const params = new URLSearchParams(window.location.search);
  const customTag = params.get('tag') || params.get('version');
  if (customTag) {
    currentReleaseTag = customTag;
  }

  // Update release tag badge
  const releaseTagBadge = document.getElementById('modal-release-tag');
  if (releaseTagBadge) {
    releaseTagBadge.textContent = `Tag: ${currentReleaseTag}`;
  }

  // Fetch latest release tag from GitHub in background
  fetch('https://api.github.com/repos/ggml-org/llama.cpp/releases?per_page=1')
    .then(res => res.json())
    .then(releases => {
      if (Array.isArray(releases) && releases[0]?.tag_name) {
        currentReleaseTag = releases[0].tag_name;
        if (releaseTagBadge) {
          releaseTagBadge.textContent = `Tag: ${currentReleaseTag}`;
        }
        renderBuildsList(document.getElementById('search-builds')?.value || '');
      }
    })
    .catch(() => {});

  // ITEM 1: HardwareCheck
  const cardHwCheck = document.getElementById('card-hwcheck');
  const btnHwCheck = document.getElementById('btn-download-hardware-check');
  const btnCopyHwCheck = document.getElementById('btn-copy-hardware-check');
  if (cardHwCheck) {
    cardHwCheck.addEventListener('click', () => {
      downloadFile(HARDWARE_CHECK_URL, 'HardwareChecker.zip');
    });
  }
  if (btnHwCheck) {
    btnHwCheck.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadFile(HARDWARE_CHECK_URL, 'HardwareChecker.zip');
    });
  }
  if (btnCopyHwCheck) {
    btnCopyHwCheck.addEventListener('click', (e) => {
      e.stopPropagation();
      copyLink(HARDWARE_CHECK_URL, btnCopyHwCheck);
    });
  }

  // ITEM 2: llama cpp (Windows) -> Opens Modal
  const cardLlama = document.getElementById('card-llama');
  const btnLlama = document.getElementById('btn-open-llama-builds-modal');
  if (cardLlama) {
    cardLlama.addEventListener('click', () => {
      openModal();
    });
  }
  if (btnLlama) {
    btnLlama.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal();
    });
  }

  // ITEM 3: SmolLM - AI model
  const cardSmolLm = document.getElementById('card-smollm');
  const btnSmolLm = document.getElementById('btn-download-smollm');
  const btnCopySmolLm = document.getElementById('btn-copy-smollm');
  if (cardSmolLm) {
    cardSmolLm.addEventListener('click', () => {
      downloadFile(SMOLLM_GGUF_URL, 'SmolLM2.gguf');
    });
  }
  if (btnSmolLm) {
    btnSmolLm.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadFile(SMOLLM_GGUF_URL, 'SmolLM2.gguf');
    });
  }
  if (btnCopySmolLm) {
    btnCopySmolLm.addEventListener('click', (e) => {
      e.stopPropagation();
      copyLink(SMOLLM_GGUF_URL, btnCopySmolLm);
    });
  }

  // Search input filter in modal
  const searchInput = document.getElementById('search-builds');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderBuildsList(e.target.value);
    });
  }

  // Modal close triggers
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnDoneModal = document.getElementById('btn-done-modal');
  const modalOverlay = document.getElementById('llama-modal');

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnDoneModal) btnDoneModal.addEventListener('click', closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // Initial render of builds
  renderBuildsList();
});
