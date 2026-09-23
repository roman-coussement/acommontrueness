"use strict";

(function () {
    const canvas = document.querySelector("#simulation-canvas");
    const chart = document.querySelector("#sir-chart");
    if (!canvas || !chart || !window.SIRModel) return;

    const simulationContext = canvas.getContext("2d");
    const chartContext = chart.getContext("2d");
    const controls = Object.fromEntries(
        ["population", "initialInfected", "movement", "transmission", "duration", "vaccinated"].map((id) => [
            id,
            document.querySelector(`#${id}`),
        ])
    );
    const colors = {
        susceptible: "#5795b5",
        infected: "#cf5b46",
        recovered: "#8a9a5b",
    };
    const counts = {
        susceptible: document.querySelector("#susceptible-count"),
        infected: document.querySelector("#infected-count"),
        recovered: document.querySelector("#recovered-count"),
    };
    const toggleButton = document.querySelector("#simulation-toggle");
    const resetButton = document.querySelector("#simulation-reset");
    let agents = [];
    let history = [];
    let running = false;
    let lastFrame = 0;
    let sampleAccumulator = 0;

    function setCanvasSize(target) {
        const rect = target.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        target.width = Math.max(1, Math.round(rect.width * ratio));
        target.height = Math.max(1, Math.round(rect.height * ratio));
        const context = target.getContext("2d");
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { width: rect.width, height: rect.height };
    }

    function dimensions(target) {
        const rect = target.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
    }

    function updateOutputs() {
        document.querySelector("#population-value").textContent = controls.population.value;
        document.querySelector("#initialInfected-value").textContent = controls.initialInfected.value;
        document.querySelector("#movement-value").textContent = `${Number(controls.movement.value).toFixed(1)}×`;
        document.querySelector("#transmission-value").textContent = `${controls.transmission.value}%`;
        document.querySelector("#duration-value").textContent = `${controls.duration.value}s`;
        document.querySelector("#vaccinated-value").textContent = `${controls.vaccinated.value}%`;
    }

    function updateCounts(stateCounts) {
        Object.keys(counts).forEach((key) => {
            counts[key].textContent = stateCounts[key];
        });
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
        const stateCounts = window.SIRModel.countStates(agents);
        history = [stateCounts];
        updateCounts(stateCounts);
        drawSimulation(size);
        drawChart();
    }

    function drawSimulation(size = dimensions(canvas)) {
        simulationContext.clearRect(0, 0, size.width, size.height);
        agents.forEach((agent) => {
            simulationContext.beginPath();
            simulationContext.arc(agent.x, agent.y, agent.radius, 0, Math.PI * 2);
            simulationContext.fillStyle = colors[agent.state];
            simulationContext.fill();
        });
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

        Object.keys(colors).forEach((state) => {
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
        });
    }

    function animate(timestamp) {
        const deltaTime = Math.min((timestamp - lastFrame) / 1000 || 0, 0.04);
        lastFrame = timestamp;
        if (running) {
            const size = dimensions(canvas);
            const stateCounts = window.SIRModel.stepSimulation(agents, {
                width: size.width,
                height: size.height,
                transmissionProbability: Number(controls.transmission.value) / 100,
                infectiousDuration: Number(controls.duration.value),
                deltaTime,
            });
            sampleAccumulator += deltaTime;
            if (sampleAccumulator >= 0.25) {
                history.push({ ...stateCounts });
                if (history.length > 240) history.shift();
                sampleAccumulator = 0;
                updateCounts(stateCounts);
                drawChart();
            }
            drawSimulation(size);
            if (stateCounts.infected === 0) {
                running = false;
                toggleButton.dataset.state = "paused";
                toggleButton.setAttribute("aria-label", "Restart outbreak");
            }
        }
        window.requestAnimationFrame(animate);
    }

    toggleButton.addEventListener("click", () => {
        if (toggleButton.getAttribute("aria-label") === "Restart outbreak") resetSimulation();
        running = !running;
        toggleButton.dataset.state = running ? "running" : "paused";
        toggleButton.setAttribute("aria-label", running ? "Pause outbreak" : "Play outbreak");
    });
    resetButton.addEventListener("click", resetSimulation);
    Object.values(controls).forEach((control) => {
        control.addEventListener("input", updateOutputs);
        control.addEventListener("change", resetSimulation);
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
    window.requestAnimationFrame(animate);
})();
