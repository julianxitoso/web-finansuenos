// ============================================
// Finansueños — script compartido del sitio
// ============================================

// ---- MENÚ MÓVIL ----
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu   = document.getElementById('mobile-menu');

if (hamburgerBtn && mobileMenu) {
  const setMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    hamburgerBtn.classList.toggle('active', open);
    hamburgerBtn.setAttribute('aria-expanded', String(open));
    hamburgerBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  hamburgerBtn.addEventListener('click', () => {
    setMenu(!mobileMenu.classList.contains('open'));
  });

  // Cerrar el menú al elegir una opción
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });
}

// ---- ANIMACIÓN DE ENTRADA ----
const fadeEls = document.querySelectorAll('.fade-in');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  fadeEls.forEach(el => observer.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// ---- FORMULARIO "REGISTRA TU COMERCIO" → GOOGLE SHEETS ----
const form = document.getElementById('form-contacto');

if (form) {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbzoFiICgggezKq5wrKsL0Qse7vcEpee79YvFIDMbYwYb5MAlz9o0niZvQZlD_P30Fr9/exec';
  const toastSuccess = document.getElementById('toast-success');
  const btnSubmit = form.querySelector('.btn-submit');
  const originalText = btnSubmit.textContent;
  const loadedAt = Date.now();

  const showSuccess = () => {
    toastSuccess.classList.add('show');
    setTimeout(() => toastSuccess.classList.remove('show'), 5000);
    form.reset();
  };

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = new FormData(form);

    // Antispam: los bots llenan el campo oculto o envían en menos de 3 segundos.
    // Se les muestra el mensaje de éxito pero no se envía nada a la hoja.
    const isBot = data.get('website') || (Date.now() - loadedAt) < 3000;
    data.delete('website');
    if (isBot) {
      showSuccess();
      return;
    }

    // Normaliza el celular a solo dígitos (ej. 3001234567)
    data.set('telefono', String(data.get('telefono')).replace(/\D/g, ''));

    btnSubmit.textContent = 'Enviando información...';
    btnSubmit.disabled = true;

    fetch(scriptURL, { method: 'POST', body: data })
      .then(response => {
        if (!response.ok) throw new Error('Respuesta ' + response.status);
        showSuccess();
      })
      .catch(error => {
        console.error('Error!', error.message);
        alert('Hubo un error al enviar. Por favor intenta de nuevo.');
      })
      .finally(() => {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
      });
  });
}
