/**
 * QA Testing Panel for Pomodoro Plant
 * 
 * This module provides a testing interface to inspect and manipulate plant growth stages,
 * allowing you to visualize how plants grow through all 5 stages.
 */

export function createQATestingPanel() {
  const panelId = "qa-testing-panel";
  
  // Check if panel already exists
  if (document.getElementById(panelId)) {
    return;
  }

  // Create panel HTML
  const panel = document.createElement("div");
  panel.id = panelId;
  panel.innerHTML = `
    <div class="qa-panel">
      <div class="qa-header">
        <h3>🧪 QA Testing Panel</h3>
        <button id="qa-close" class="qa-close-btn">×</button>
      </div>
      
      <div class="qa-content">
        <section class="qa-section">
          <h4>Current State</h4>
          <div id="qa-current-state" class="qa-info-box">
            <div class="qa-info-row">
              <span>Plant:</span>
              <strong id="qa-current-plant">-</strong>
            </div>
            <div class="qa-info-row">
              <span>Stage:</span>
              <strong id="qa-current-stage">-</strong>
            </div>
            <div class="qa-info-row">
              <span>Progress:</span>
              <strong id="qa-current-progress">-</strong>
            </div>
            <div class="qa-info-row">
              <span>Focused Minutes:</span>
              <strong id="qa-focused-minutes">-</strong>
            </div>
            <div class="qa-info-row">
              <span>Goal Minutes:</span>
              <strong id="qa-goal-minutes">-</strong>
            </div>
          </div>
        </section>

        <section class="qa-section">
          <h4>Stage Controls</h4>
          <div class="qa-stage-buttons">
            <button class="qa-btn qa-stage-btn" data-stage="1">Stage 1: Seedling</button>
            <button class="qa-btn qa-stage-btn" data-stage="2">Stage 2: Sprout</button>
            <button class="qa-btn qa-stage-btn" data-stage="3">Stage 3: Young</button>
            <button class="qa-btn qa-stage-btn" data-stage="4">Stage 4: Mature</button>
            <button class="qa-btn qa-stage-btn" data-stage="5">Stage 5: Full Grown</button>
          </div>
        </section>

        <section class="qa-section">
          <h4>Quick Actions</h4>
          <div class="qa-actions">
            <button class="qa-btn qa-action-btn" id="qa-animate-growth">
              🌱 Animate Full Growth
            </button>
            <button class="qa-btn qa-action-btn" id="qa-test-all-plants">
              🔄 Cycle Through All Plants
            </button>
            <button class="qa-btn qa-action-btn" id="qa-progress-slider-toggle">
              🎚️ Show Progress Slider
            </button>
          </div>
        </section>

        <section class="qa-section qa-slider-section" style="display: none;">
          <h4>Manual Progress Control</h4>
          <input 
            type="range" 
            id="qa-progress-slider" 
            min="0" 
            max="100" 
            value="0" 
            class="qa-slider"
          />
          <div class="qa-slider-value">
            <span id="qa-slider-value-display">0%</span>
          </div>
        </section>

        <section class="qa-section">
          <h4>Tips</h4>
          <ul class="qa-tips">
            <li>Click stage buttons to jump to specific growth stages</li>
            <li>Use "Animate Full Growth" to see smooth transitions</li>
            <li>The progress slider gives fine-grained control over growth</li>
            <li>Press <kbd>Ctrl + Q</kbd> to toggle this panel</li>
          </ul>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
  
  // Add styles
  injectQAStyles();
  
  // Return control functions
  return {
    show: () => panel.style.display = "block",
    hide: () => panel.style.display = "none",
    toggle: () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
  };
}

function injectQAStyles() {
  const styleId = "qa-testing-styles";
  
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    #qa-testing-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 380px;
      max-height: 90vh;
      overflow-y: auto;
      z-index: 10000;
      font-family: "Avenir Next", "Trebuchet MS", "Segoe UI", sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .qa-panel {
      background: #ffffff;
      border-radius: 16px;
      border: 2px solid #e0e0e0;
      overflow: hidden;
    }

    .qa-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .qa-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .qa-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      line-height: 1;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
    }

    .qa-close-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .qa-content {
      padding: 20px;
    }

    .qa-section {
      margin-bottom: 20px;
    }

    .qa-section:last-child {
      margin-bottom: 0;
    }

    .qa-section h4 {
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .qa-info-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #e0e0e0;
    }

    .qa-info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #e8e8e8;
    }

    .qa-info-row:last-child {
      border-bottom: none;
    }

    .qa-info-row span {
      color: #666;
      font-size: 0.9rem;
    }

    .qa-info-row strong {
      color: #333;
      font-weight: 600;
    }

    .qa-stage-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .qa-btn {
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.9rem;
      pointer-events: auto;
      user-select: none;
    }

    .qa-stage-btn {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #bbdefb;
      display: block;
      width: 100%;
      text-align: left;
    }

    .qa-stage-btn:hover {
      background: #bbdefb;
      transform: translateX(4px);
    }

    .qa-stage-btn.active {
      background: #1976d2;
      color: white;
      border-color: #1565c0;
    }

    .qa-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .qa-action-btn {
      background: #f3e5f5;
      color: #7b1fa2;
      border: 1px solid #e1bee7;
    }

    .qa-action-btn:hover {
      background: #e1bee7;
      transform: translateY(-2px);
    }

    .qa-slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: #e0e0e0;
      outline: none;
      -webkit-appearance: none;
    }

    .qa-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      transition: all 0.2s;
    }

    .qa-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: #764ba2;
    }

    .qa-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #667eea;
      cursor: pointer;
      border: none;
    }

    .qa-slider-value {
      margin-top: 8px;
      text-align: center;
      font-weight: 600;
      color: #667eea;
      font-size: 1.1rem;
    }

    .qa-tips {
      margin: 0;
      padding-left: 20px;
      font-size: 0.85rem;
      color: #666;
      line-height: 1.6;
    }

    .qa-tips li {
      margin-bottom: 6px;
    }

    .qa-tips kbd {
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 0.85em;
    }

    @media (max-width: 768px) {
      #qa-testing-panel {
        top: 10px;
        right: 10px;
        left: 10px;
        width: auto;
        max-width: 400px;
      }
    }

    /* Animation for panel entrance */
    @keyframes qa-slide-in {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    #qa-testing-panel {
      animation: qa-slide-in 0.3s ease-out;
    }
  `;

  document.head.appendChild(style);
}

export function setupQATestingControls(getState, setState, render) {
  const panel = createQATestingPanel();
  
  // Update current state display
  function updateStateDisplay() {
    const state = getState();
    const plantVisual = document.getElementById("plantVisual");
    const currentStage = plantVisual?.dataset.stage || "1";
    const progressFill = document.getElementById("progressFill");
    const progress = progressFill?.style.width || "0%";
    
    const currentPlantEl = document.getElementById("qa-current-plant");
    const currentStageEl = document.getElementById("qa-current-stage");
    const currentProgressEl = document.getElementById("qa-current-progress");
    const focusedMinutesEl = document.getElementById("qa-focused-minutes");
    const goalMinutesEl = document.getElementById("qa-goal-minutes");
    
    if (currentPlantEl) currentPlantEl.textContent = state.selectedPlantId || "snake";
    if (currentStageEl) currentStageEl.textContent = currentStage + " / 5";
    if (currentProgressEl) currentProgressEl.textContent = progress;
    if (focusedMinutesEl) focusedMinutesEl.textContent = state.focusedMinutesTotal + " min";
    
    // Calculate goal minutes (default: 10 rounds * 48 min = 480 min)
    const roundGoal = state.roundGoal || 10;
    const goalMinutes = roundGoal * 48;
    if (goalMinutesEl) goalMinutesEl.textContent = goalMinutes + " min";
    
    // Highlight active stage button
    document.querySelectorAll(".qa-stage-btn").forEach(btn => {
      if (btn.dataset.stage === currentStage) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Handler for stage button clicks
  function handleStageClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const targetStage = parseInt(btn.dataset.stage);
    
    console.log("Stage button clicked:", targetStage);
    
    const state = getState();
    const roundGoal = state.roundGoal || 10;
    const goalMinutes = roundGoal * 48;
    
    // Calculate minutes needed for this stage
    // Stages: 1 (0-20%), 2 (20-40%), 3 (40-60%), 4 (60-80%), 5 (80-100%)
    let minProgress, maxProgress;
    if (targetStage === 1) {
      minProgress = 0;
      maxProgress = 0.19;
    } else if (targetStage === 2) {
      minProgress = 0.20;
      maxProgress = 0.39;
    } else if (targetStage === 3) {
      minProgress = 0.40;
      maxProgress = 0.59;
    } else if (targetStage === 4) {
      minProgress = 0.60;
      maxProgress = 0.79;
    } else {
      minProgress = 0.80;
      maxProgress = 1.0;
    }
    
    // Set to middle of stage range
    const targetProgress = (minProgress + maxProgress) / 2;
    const targetMinutes = Math.floor(goalMinutes * targetProgress);
    
    console.log(`Setting stage ${targetStage}: ${targetMinutes} min (${(targetProgress * 100).toFixed(1)}%)`);
    
    setState({
      focusedMinutesTotal: targetMinutes,
      lastCompletedStage: targetStage
    });
    
    render();
    setTimeout(updateStateDisplay, 100);
  }

  // Set up stage button handlers with proper event delegation
  document.querySelectorAll(".qa-stage-btn").forEach(btn => {
    btn.addEventListener("click", handleStageClick, false);
  });

  // Animate growth handler
  const animateBtn = document.getElementById("qa-animate-growth");
  if (animateBtn) {
    animateBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const state = getState();
      const roundGoal = state.roundGoal || 10;
      const goalMinutes = roundGoal * 48;
      
      let currentMinutes = 0;
      const increment = goalMinutes / 100; // 100 steps
      
      const interval = setInterval(() => {
        currentMinutes += increment;
        
        if (currentMinutes >= goalMinutes) {
          currentMinutes = goalMinutes;
          clearInterval(interval);
        }
        
        // Determine stage
        const progress = currentMinutes / goalMinutes;
        let stage = 1;
        if (progress >= 0.80) stage = 5;
        else if (progress >= 0.60) stage = 4;
        else if (progress >= 0.40) stage = 3;
        else if (progress >= 0.20) stage = 2;
        
        setState({
          focusedMinutesTotal: Math.floor(currentMinutes),
          lastCompletedStage: stage
        });
        
        render();
        updateStateDisplay();
      }, 50);
    });
  }

  // Cycle through plants handler
  let plantCycleInterval = null;
  const cycleBtn = document.getElementById("qa-test-all-plants");
  if (cycleBtn) {
    cycleBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const plants = ["snake", "zz", "begonia"];
      let currentIndex = 0;
      
      if (plantCycleInterval) {
        clearInterval(plantCycleInterval);
        plantCycleInterval = null;
        return;
      }
      
      plantCycleInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % plants.length;
        const plantId = plants[currentIndex];
        
        setState({ selectedPlantId: plantId });
        render();
        updateStateDisplay();
      }, 2000);
      
      // Stop after cycling through all plants
      setTimeout(() => {
        if (plantCycleInterval) {
          clearInterval(plantCycleInterval);
          plantCycleInterval = null;
        }
      }, 6000);
    });
  }

  // Progress slider toggle
  const sliderSection = document.querySelector(".qa-slider-section");
  const toggleBtn = document.getElementById("qa-progress-slider-toggle");
  if (toggleBtn && sliderSection) {
    toggleBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      sliderSection.style.display = sliderSection.style.display === "none" ? "block" : "none";
    });
  }

  // Progress slider handler
  const slider = document.getElementById("qa-progress-slider");
  const sliderValue = document.getElementById("qa-slider-value-display");
  
  if (slider && sliderValue) {
    slider.addEventListener("input", (e) => {
      const progress = parseInt(e.target.value);
      sliderValue.textContent = progress + "%";
      
      const state = getState();
      const roundGoal = state.roundGoal || 10;
      const goalMinutes = roundGoal * 48;
      const targetMinutes = Math.floor((goalMinutes * progress) / 100);
      
      // Determine stage
      let stage = 1;
      if (progress >= 80) stage = 5;
      else if (progress >= 60) stage = 4;
      else if (progress >= 40) stage = 3;
      else if (progress >= 20) stage = 2;
      
      setState({
        focusedMinutesTotal: targetMinutes,
        lastCompletedStage: stage
      });
      
      render();
      updateStateDisplay();
    });
  }

  // Close button handler
  const closeBtn = document.getElementById("qa-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      panel.hide();
    });
  }

  // Keyboard shortcut (Ctrl+Q or Cmd+Q)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "q") {
      e.preventDefault();
      panel.toggle();
      if (document.getElementById("qa-testing-panel").style.display !== "none") {
        updateStateDisplay();
      }
    }
  });

  // Initial state update
  updateStateDisplay();
  
  // Update state periodically
  setInterval(updateStateDisplay, 1000);
  
  return panel;
}
