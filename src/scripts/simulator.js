let disposeSimulator = null;

export function initSimulator() {
  const canvas = document.querySelector("#simulation-canvas");
  const chart = document.querySelector("#sir-chart");
  const toggleButton = document.querySelector("#simulation-toggle");
  const resetButton = document.querySelector("#simulation-reset");
  if (!(canvas instanceof HTMLCanvasElement) || !(chart instanceof HTMLCanvasElement) || !toggleButton || !resetButton || !window.SIRModel) {
    return () => {};
  }

  const simulationContext = canvas.getContext("2d");
  const chartContext = chart.getContext("2d");
  if (!simulationContext || !chartContext) return () => {};

  const controlIds = ["population", "initialInfected", "movement", "transmission", "duration", "vaccinated"];
  const controls = Object.fromEntries(controlIds.map((id) => [id, document.querySelector(`#${id}`)]));
  if (Object.values(controls).some((control) => !(control instanceof HTMLInputElement))) return () => {};

  const colors = { susceptible: "#5795b5", infected: "#cf5b46", recovered: "#8a9a5b" };
  const counts = {
    susceptible: document.querySelector("#susceptible-count"),
    infected: document.querySelector("#infected-count"),
    recovered: document.querySelector("#recovered-count"),
  };
  let agents = [];
  let history = [];
  let running = false;
  let active = true;
  let lastFrame = 0;
  let sampleAccumulator = 0;
  let animationFrame = null;

  function dimensions(target) {
    const rect = target.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  function setCanvasSize(target) {
    const size = dimensions(target);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    target.width = Math.max(1, Math.round(size.width * ratio));
    target.height = Math.max(1, Math.round(size.height * ratio));
    target.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function updateOutputs() {
    for (const id of controlIds) {
      const output = document.querySelector(`#${id}-value`);
      if (!output) continue;
      const suffix = id === "movement" ? "×" : ["transmission", "vaccinated"].includes(id) ? "%" : id === "duration" ? "s" : "";
      const value = id === "movement" ? Number(controls[id].value).toFixed(1) : controls[id].value;
      output.textContent = `${value}${suffix}`;
    }
  }

  function updateCounts(values) {
    for (const key of Object.keys(counts)) {
      if (counts[key]) counts[key].textContent = String(values[key]);
    }
  }

  function drawSimulation(size = dimensions(canvas)) {
    simulationContext.clearRect(0, 0, size.width, size.height);
    for (const agent of agents) {
      simulationContext.beginPath();
      simulationContext.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
      simulationContext.fillStyle = colors[agent.state];
      simulationContext.fill();
    }
  }

  function drawChart() {
    const size = dimensions(chart);
    chartContext.clearRect(0, 0, size.width, size.height);
    const padding = { top: 14, right: 12, bottom: 24, left: 34 };
    const innerWidth = size.width - padding.left - padding.right;
    const innerHeight = size.height - padding.top - padding.bottom;
    const population = Number(controls.population.value);

    chartContext.strokeStyle = "#d7dce2";
    chartContext.lineWidth = 1;
    chartContext.beginPath();
    chartContext.moveTo(padding.left, padding.top);
    chartContext.lineTo(padding.left, padding.top + innerHeight);
    chartContext.lineTo(padding.left + innerWidth, padding.top + innerHeight);
    chartContext.stroke();
    chartContext.fillStyle = "#6b7280";
    chartContext.font = "11px 'Averia Serif Libre', Georgia, serif";
    chartContext.fillText(String(population), 4, padding.top + 4);
    chartContext.fillText("0", 20, padding.top + innerHeight + 4);
    chartContext.fillText("time", padding.left + innerWidth - 22, size.height - 5);

    for (const state of Object.keys(colors)) {
      chartContext.beginPath();
      history.forEach((point, index) => {
        const x = padding.left + (index / Math.max(1, history.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - (point[state] / population) * innerHeight;
        if (index === 0) chartContext.moveTo(x, y);
        else chartContext.lineTo(x, y);
      });
      chartContext.strokeStyle = colors[state];
      chartContext.lineWidth = 2;
      chartContext.stroke();
    }
  }

  function resetSimulation() {
    running = false;
    toggleButton.dataset.state = "paused";
    toggleButton.setAttribute("aria-label", "Play outbreak");
    updateOutputs();
    const size = dimensions(canvas);
    agents = window.SIRModel.createPopulation({
      population: Number(controls.population.value),
      initialInfected: Number(controls.initialInfected.value),
      vaccinatedPercent: Number(controls.vaccinated.value),
      width: size.width,
      height: size.height,
      speed: Number(controls.movement.value) * 28,
    });
    const values = window.SIRModel.countStates(agents);
    history = [values];
    sampleAccumulator = 0;
    updateCounts(values);
    drawSimulation(size);
    drawChart();
  }

  function animate(timestamp) {
    if (!active) return;
    const deltaTime = Math.min((timestamp - lastFrame) / 1000 || 0, 0.04);
    lastFrame = timestamp;
    if (running) {
      const size = dimensions(canvas);
      const values = window.SIRModel.stepSimulation(agents, {
        width: size.width,
        height: size.height,
        transmissionProbability: Number(controls.transmission.value) / 100,
        infectiousDuration: Number(controls.duration.value),
        deltaTime,
      });
      sampleAccumulator += deltaTime;
      if (sampleAccumulator >= 0.25) {
        history.push({ ...values });
        if (history.length > 240) history.shift();
        sampleAccumulator = 0;
        updateCounts(values);
        drawChart();
      }
      drawSimulation(size);
      if (values.infected === 0) {
        running = false;
        toggleButton.dataset.state = "paused";
        toggleButton.setAttribute("aria-label", "Restart outbreak");
      }
    }
    animationFrame = requestAnimationFrame(animate);
  }

  const handleToggle = () => {
    if (toggleButton.getAttribute("aria-label") === "Restart outbreak") resetSimulation();
    running = !running;
    toggleButton.dataset.state = running ? "running" : "paused";
    toggleButton.setAttribute("aria-label", running ? "Pause outbreak" : "Play outbreak");
  };
  const handleInput = () => updateOutputs();
  const handleChange = () => resetSimulation();
  toggleButton.addEventListener("click", handleToggle);
  resetButton.addEventListener("click", resetSimulation);
  Object.values(controls).forEach((control) => {
    control.addEventListener("input", handleInput);
    control.addEventListener("change", handleChange);
  });

  const resizeObserver = new ResizeObserver(() => {
    setCanvasSize(canvas);
    setCanvasSize(chart);
    resetSimulation();
  });
  resizeObserver.observe(canvas);
  resizeObserver.observe(chart);
  setCanvasSize(canvas);
  setCanvasSize(chart);
  resetSimulation();
  animationFrame = requestAnimationFrame(animate);

  return () => {
    active = false;
    running = false;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    toggleButton.removeEventListener("click", handleToggle);
    resetButton.removeEventListener("click", resetSimulation);
    Object.values(controls).forEach((control) => {
      control.removeEventListener("input", handleInput);
      control.removeEventListener("change", handleChange);
    });
  };
}

function initializeSimulator() {
  if (disposeSimulator) disposeSimulator();
  disposeSimulator = initSimulator();
}

initializeSimulator();
document.addEventListener("astro:page-load", initializeSimulator);
document.addEventListener("astro:before-swap", () => {
  if (disposeSimulator) disposeSimulator();
  disposeSimulator = null;
});
