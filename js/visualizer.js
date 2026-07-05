/* ==========================================================================
   XING FLOORS — visualizer.js
   Front-end-only flooring preview demo. No image ever leaves the browser —
   there is no upload to any server. This is intentionally the "AI preview
   coming soon" placeholder described on the page: it lets a visitor try
   the interaction (upload a photo, choose a swatch, position an overlay)
   without any real rendering intelligence behind it yet.

   FUTURE AI HOOK
   ---------------
   When a real rendering service is ready, replace the body of
   `applySwatchOverlay()` with a call like:
     renderAIFloorPreview(photoDataUrl, selectedMaterial, overlayRect)
       .then(function (resultImageUrl) { ... swap viz-photo src ... });
   Keeping the upload/selection/UI code unchanged — only the rendering step
   needs to move from "CSS overlay" to "server-rendered image".
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var stage = document.getElementById("vizStage");
    var prompt = document.getElementById("vizPrompt");
    var fileInput = document.getElementById("vizFileInput");
    var uploadBtn = document.getElementById("vizUploadBtn");
    var resetBtn = document.getElementById("vizResetBtn");
    var swatchButtons = Array.prototype.slice.call(document.querySelectorAll("#vizSwatches .viz-swatch"));

    if (!stage || !fileInput || !uploadBtn) return;

    var currentMat = "mat-vinyl";
    var overlayEl = null;
    var photoEl = null;

    swatchButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        swatchButtons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        currentMat = btn.getAttribute("data-mat");
        if (overlayEl) {
          var fill = overlayEl.querySelector(".swatch-fill");
          fill.className = "swatch-fill " + currentMat;
        }
      });
    });

    uploadBtn.addEventListener("click", function () { fileInput.click(); });

    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!file.type.match(/^image\//)) {
        window.XingFloors && window.XingFloors.showToast("Please upload an image file.");
        return;
      }
      var reader = new FileReader();
      reader.onload = function (e) {
        loadPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    function loadPhoto(dataUrl) {
      prompt.style.display = "none";
      stage.classList.add("has-photo");

      if (photoEl) photoEl.remove();
      photoEl = document.createElement("img");
      photoEl.className = "viz-photo";
      photoEl.alt = "Uploaded room photo";
      photoEl.src = dataUrl;
      stage.insertBefore(photoEl, stage.firstChild);

      createOverlay();
      resetBtn.disabled = false;
    }

    function createOverlay() {
      if (overlayEl) overlayEl.remove();
      overlayEl = document.createElement("div");
      overlayEl.className = "viz-overlay";
      overlayEl.style.left = "15%";
      overlayEl.style.top = "55%";
      overlayEl.style.width = "70%";
      overlayEl.style.height = "35%";
      overlayEl.innerHTML = '<div class="swatch-fill ' + currentMat + '"></div><div class="handle" tabindex="0" aria-label="Resize floor area"></div>';
      stage.appendChild(overlayEl);
      makeDraggable(overlayEl);
    }

    function makeDraggable(el) {
      var handle = el.querySelector(".handle");
      var dragging = false, resizing = false;
      var startX, startY, startLeft, startTop, startW, startH;

      function pointerPos(e) {
        var p = e.touches ? e.touches[0] : e;
        return { x: p.clientX, y: p.clientY };
      }

      el.addEventListener("mousedown", function (e) {
        if (e.target === handle) return;
        dragging = true;
        var pos = pointerPos(e);
        startX = pos.x; startY = pos.y;
        startLeft = el.offsetLeft; startTop = el.offsetTop;
      });
      el.addEventListener("touchstart", function (e) {
        if (e.target === handle) return;
        dragging = true;
        var pos = pointerPos(e);
        startX = pos.x; startY = pos.y;
        startLeft = el.offsetLeft; startTop = el.offsetTop;
      }, { passive: true });

      handle.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        resizing = true;
        var pos = pointerPos(e);
        startX = pos.x; startY = pos.y;
        startW = el.offsetWidth; startH = el.offsetHeight;
      });
      handle.addEventListener("touchstart", function (e) {
        e.stopPropagation();
        resizing = true;
        var pos = pointerPos(e);
        startX = pos.x; startY = pos.y;
        startW = el.offsetWidth; startH = el.offsetHeight;
      }, { passive: true });

      function onMove(e) {
        if (!dragging && !resizing) return;
        var pos = pointerPos(e);
        var dx = pos.x - startX, dy = pos.y - startY;
        var stageRect = stage.getBoundingClientRect();

        if (dragging) {
          var newLeft = Math.min(Math.max(startLeft + dx, 0), stageRect.width - el.offsetWidth);
          var newTop = Math.min(Math.max(startTop + dy, 0), stageRect.height - el.offsetHeight);
          el.style.left = newLeft + "px";
          el.style.top = newTop + "px";
        } else if (resizing) {
          var newW = Math.min(Math.max(startW + dx, 60), stageRect.width - el.offsetLeft);
          var newH = Math.min(Math.max(startH + dy, 60), stageRect.height - el.offsetTop);
          el.style.width = newW + "px";
          el.style.height = newH + "px";
        }
      }
      function onEnd() { dragging = false; resizing = false; }

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    }

    resetBtn.addEventListener("click", function () {
      if (photoEl) { photoEl.remove(); photoEl = null; }
      if (overlayEl) { overlayEl.remove(); overlayEl = null; }
      stage.classList.remove("has-photo");
      prompt.style.display = "";
      fileInput.value = "";
      resetBtn.disabled = true;
    });
  });
})();
