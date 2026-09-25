import re

with open('script.js', 'r') as f:
    content = f.read()

new_logic = r"""// Lógica de pasos del wizard
function setupWizardLogic() {
  const serviceCards = document.querySelectorAll('.service-card');
  const barberCards = document.querySelectorAll('.barber-card-premium');
  
  // Step 1: Servicios
  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingData.service = card.dataset.service;
      bookingData.serviceName = card.querySelector('h4').innerText;
      document.getElementById('btn-next-1').disabled = false;
    });
  });

  // Step 2: Barberos
  barberCards.forEach(card => {
    card.addEventListener('click', () => {
      barberCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingData.barber = card.dataset.barber;
      bookingData.barberName = card.querySelector('h4').innerText;
      document.getElementById('btn-next-2').disabled = false;
    });
  });

  // Step 3: Fecha y Hora (Chips)
  const dateChipsContainer = document.getElementById('dateChipsContainer');
  const timeChipsContainer = document.getElementById('timeChipsContainer');
  const btnNext3 = document.getElementById('btn-next-3');

  // Generar próximos 14 días
  const today = new Date();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  for (let i = 0; i < 14; i++) {
    let d = new Date(today);
    d.setDate(d.getDate() + i);
    // Saltamos domingos si la barbería no abre (opcional, aquí los dejamos todos)
    
    const chip = document.createElement('div');
    chip.className = 'date-chip';
    chip.dataset.date = d.toISOString().split('T')[0];
    
    chip.innerHTML = `
      <div class="date-chip-day">${dayNames[d.getDay()]}</div>
      <div class="date-chip-num">${d.getDate()}</div>
      <div class="date-chip-month">${monthNames[d.getMonth()]}</div>
    `;
    
    chip.addEventListener('click', () => {
      document.querySelectorAll('.date-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      bookingData.date = `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]}`;
      
      // Mostrar horas disponibles
      renderTimeChips();
      checkStep3();
    });
    
    dateChipsContainer.appendChild(chip);
  }

  function renderTimeChips() {
    timeChipsContainer.innerHTML = '';
    const times = ['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'];
    
    times.forEach(time => {
      const chip = document.createElement('div');
      chip.className = 'time-chip';
      chip.innerText = time;
      chip.addEventListener('click', () => {
        document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        bookingData.time = time;
        checkStep3();
      });
      timeChipsContainer.appendChild(chip);
    });
  }

  function checkStep3() {
    if (bookingData.date && bookingData.time) {
      btnNext3.disabled = false;
    } else {
      btnNext3.disabled = true;
    }
  }

  // Step 4: Datos
  const nameInput = document.getElementById('user-name');
  const phoneInput = document.getElementById('user-phone');
  const btnConfirm = document.getElementById('btn-confirm');

  function checkStep4() {
    if (nameInput.value.trim().length > 2 && phoneInput.value.trim().length > 6) {
      btnConfirm.style.pointerEvents = 'auto';
      btnConfirm.style.opacity = '1';
    } else {
      btnConfirm.style.pointerEvents = 'none';
      btnConfirm.style.opacity = '0.5';
    }
  }

  nameInput.addEventListener('input', (e) => { bookingData.name = e.target.value; checkStep4(); });
  phoneInput.addEventListener('input', (e) => { bookingData.phone = e.target.value; checkStep4(); });

  // Botones de navegación
  document.getElementById('btn-next-1').addEventListener('click', () => goToStep(2));
  
  document.getElementById('btn-prev-2').addEventListener('click', () => goToStep(1));
  document.getElementById('btn-next-2').addEventListener('click', () => goToStep(3));
  
  document.getElementById('btn-prev-3').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-next-3').addEventListener('click', () => goToStep(4));
  
  document.getElementById('btn-prev-4').addEventListener('click', () => goToStep(3));
  
  btnConfirm.addEventListener('click', () => {
    btnConfirm.innerText = "Procesando...";
    setTimeout(() => {
      goToStep('success');
    }, 1500);
  });

  document.getElementById('btn-finish').addEventListener('click', () => {
    closeBookingModal();
  });
}

function updateSummary() {
  document.getElementById('summary-service').innerText = bookingData.serviceName || '-';
  document.getElementById('summary-barber').innerText = bookingData.barberName || '-';
  document.getElementById('summary-date').innerText = bookingData.date || '-';
  document.getElementById('summary-time').innerText = bookingData.time || '-';
}

function goToStep(stepNum) {
  const steps = document.querySelectorAll('.wizard-step');
  steps.forEach(s => s.classList.remove('active'));
  
  if (stepNum === 'success') {
    document.getElementById('step-success').classList.add('active');
    document.querySelector('.wizard-timeline').style.display = 'none'; // Esconder timeline al final
  } else {
    document.getElementById(`step-${stepNum}`).classList.add('active');
    document.querySelector('.wizard-timeline').style.display = 'flex';
    
    if (stepNum === 4) {
      updateSummary();
    }

    // Actualizar Timeline UI
    const timelineSteps = document.querySelectorAll('.timeline-step');
    timelineSteps.forEach((stepEl, index) => {
      if (index + 1 < stepNum) {
        stepEl.className = 'timeline-step completed';
      } else if (index + 1 === stepNum) {
        stepEl.className = 'timeline-step active';
      } else {
        stepEl.className = 'timeline-step';
      }
    });
  }
}"""

# Use regex to find everything from "function setupWizardLogic() {" down to the end of "function goToStep(stepNum) { ... }"
pattern = r"// Lógica de pasos del wizard\nfunction setupWizardLogic\(\) \{.*?\n\}\n\nwindow\.openBookingModal"
updated_content = re.sub(pattern, new_logic + "\n\nwindow.openBookingModal", content, flags=re.DOTALL)

with open('script.js', 'w') as f:
    f.write(updated_content)

print("Logic updated.")
