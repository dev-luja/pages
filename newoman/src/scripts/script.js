document.addEventListener('DOMContentLoaded', () => {
  try {
    const container = document.querySelector('.woman-comparison');
    const newContainer = container ? container.querySelector('.woman-new-container') : null;
    const slider = container ? container.querySelector('.comparison-slider') : null;

    if (!container || !newContainer || !slider) {
      throw new Error('Elementos del slider no encontrados');
    }

    let isDragging = false;
    let isUserInteracted = false;
    let animationFrameId = null;
    let dragRafId = null;
    let pendingClientX = null;

    const setPosition = (percentage) => {
      const clamped = Math.max(0, Math.min(100, percentage));
      newContainer.style.width = `${clamped}%`;
      slider.style.left = `${clamped}%`;
    };

    setPosition(95);

    const updateSliderPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      let mouseX = clientX - rect.left;

      const minPercentage = 40;
      const maxPercentage = 100;

      let percentage = (mouseX / containerWidth) * 100;

      if (percentage < minPercentage) percentage = minPercentage;
      if (percentage > maxPercentage) percentage = maxPercentage;

      setPosition(percentage);
    };

    const runIntroAnimation = () => {
      let progress = 0;
      const duration = 2000;
      const startPos = 95;
      const scanPos = 40;
      const finalPos = 71;
      let startTime = null;

      const animateScan = (timestamp) => {
        if (isUserInteracted) return;

        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        progress = Math.min(elapsed / duration, 1);

        let currentPos;
        if (progress < 0.5) {
          const p = progress / 0.5;
          currentPos = startPos - (startPos - scanPos) * Math.sin(p * (Math.PI / 2));
        } else {
          const p = (progress - 0.5) / 0.5;
          currentPos = scanPos + (finalPos - scanPos) * Math.sin(p * (Math.PI / 2));
        }

        setPosition(currentPos);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animateScan);
        } else {
          animationFrameId = null;
        }
      };

      setTimeout(() => {
        if (!isUserInteracted) {
          animationFrameId = requestAnimationFrame(animateScan);
        }
      }, 350);
    };

    runIntroAnimation();

    const startDragging = (e) => {
      isUserInteracted = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updateSliderPosition(clientX);
    };

    const stopDragging = () => {
      isDragging = false;
      if (dragRafId) {
        cancelAnimationFrame(dragRafId);
        dragRafId = null;
      }
    };

    const onMove = (e) => {
      if (!isDragging) return;
      pendingClientX = e.touches ? e.touches[0].clientX : e.clientX;
      if (dragRafId) return;
      dragRafId = requestAnimationFrame(() => {
        updateSliderPosition(pendingClientX);
        dragRafId = null;
      });
    };

    container.addEventListener('mousedown', startDragging);
    container.addEventListener('touchstart', startDragging, { passive: true });

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchend', stopDragging);
  } catch (e) {
    console.warn('Slider error:', e.message);
  }
});
