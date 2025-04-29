const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const metaDataContainer = document.getElementById('metaDataContainer');
const uploadBox = document.querySelector('.upload-box');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// Create overlay element
const overlay = document.createElement('div');
overlay.classList.add('nav-overlay');
document.body.appendChild(overlay);

function handleFile(file) {
  const previewSection = document.getElementById('previewSection');
  const reader = new FileReader();
  
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      // Show preview section
      previewSection.classList.add('active');
      
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image">`;

      const basicInfo = [
        ['<i class="fas fa-file"></i> File Name', file.name],
        ['<i class="fas fa-file-code"></i> File Type', file.type],
        ['<i class="fas fa-ruler-combined"></i> Dimensions', `${img.width} x ${img.height} px`],
        ['<i class="fas fa-database"></i> File Size', `${(file.size / 1024).toFixed(2)} KB`],
        ['<i class="fas fa-clock"></i> Last Modified', new Date(file.lastModified).toLocaleString()]
      ];

      let html = `<details open><summary><i class="fas fa-info-circle"></i> Basic File Info</summary><table>`;
      basicInfo.forEach(([label, val]) => {
        html += `<tr><th>${label}</th><td>${val}</td></tr>`;
      });
      html += `</table></details>`;

      EXIF.getData(file, function () {
        const exif = EXIF.getAllTags(this);
        if (Object.keys(exif).length > 0) {
          html += `<details><summary><i class="fas fa-camera-retro"></i> EXIF Metadata</summary><table>`;
          for (let key in exif) {
            let value = exif[key];
            
            // Skip thumbnail data
            if (key === 'thumbnail' || key.toLowerCase().includes('thumbnail')) {
              continue;
            }
            
            // Format the value based on its type
            if (value instanceof Array) {
              value = value.join(', ');
            } else if (typeof value === 'object') {
              value = JSON.stringify(value, null, 2);
            }
            
            // Convert undefined or null to 'Not available'
            if (value === undefined || value === null) {
              value = 'Not available';
            }

            html += `
              <tr>
                <th title="${key}">${key}</th>
                <td>${String(value)}</td>
              </tr>
            `;
          }
          html += `</table></details>`;
        } else {
          html += `<details><summary><i class="fas fa-exclamation-triangle"></i> EXIF Metadata</summary><div style="padding: 1rem;">No EXIF metadata found.</div></details>`;
        }

        metaDataContainer.innerHTML = html;
        metaDataContainer.style.display = 'block';
        metaDataContainer.classList.remove('fade');
        void metaDataContainer.offsetWidth;
        metaDataContainer.classList.add('fade');
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Add this to reset the preview when needed (optional)
function resetPreview() {
  const previewSection = document.getElementById('previewSection');
  previewSection.classList.remove('active');
  imagePreview.innerHTML = '';
  metaDataContainer.innerHTML = '';
  metaDataContainer.style.display = 'none';
}

// Input listener
imageInput.addEventListener('change', function () {
  if (this.files[0]) handleFile(this.files[0]);
});

// Drag and drop
uploadBox.addEventListener('dragover', e => {
  e.preventDefault();
  uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
  uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', e => {
  e.preventDefault();
  uploadBox.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    document.getElementById('imageInput').files = e.dataTransfer.files;
    handleFile(file);
  }
});

// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Enhanced sticky header behavior
let lastScroll = 0;
const nav = document.querySelector('.sticky-nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  // Add shadow and background when scrolling
  if (currentScroll > 0) {
    nav.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    nav.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
  } else {
    nav.style.boxShadow = 'none';
    nav.style.backgroundColor = 'var(--primary-color)';
  }
  
  lastScroll = currentScroll;
});

// Navigation highlighting
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  let current = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= (sectionTop - 200)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').substring(1) === current) {
      link.classList.add('active');
    }
  });
});

// Toggle menu function
function toggleMenu() {
  hamburgerMenu.classList.toggle('active');
  navLinks.classList.toggle('active');
  overlay.classList.toggle('active');
  body.classList.toggle('menu-open');
}

// Event listeners
hamburgerMenu.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);

// Close menu when clicking on nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) {
      toggleMenu();
    }
  });
});

// Close menu on window resize if open
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
    toggleMenu();
  }
});
