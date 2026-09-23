(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    root.SIRModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    function countStates(agents) {
        return agents.reduce(
            (counts, agent) => {
                counts[agent.state] += 1;
                return counts;
            },
            { susceptible: 0, infected: 0, recovered: 0 }
        );
    }

    function createPopulation(options) {
        const {
            population,
            initialInfected,
            vaccinatedPercent,
            width,
            height,
            speed,
            random = Math.random,
        } = options;
        const vaccinated = Math.min(
            population - initialInfected,
            Math.round((population * vaccinatedPercent) / 100)
        );

        return Array.from({ length: population }, (_, index) => {
            const angle = random() * Math.PI * 2;
            let state = "susceptible";
            if (index < vaccinated) state = "recovered";
            else if (index < vaccinated + initialInfected) state = "infected";

            return {
                x: 7 + random() * Math.max(1, width - 14),
                y: 7 + random() * Math.max(1, height - 14),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 4,
                state,
                infectedFor: 0,
            };
        });
    }

    function reflectAtWalls(agent, width, height) {
        if (agent.x - agent.radius < 0) {
            agent.x = agent.radius;
            agent.vx = Math.abs(agent.vx);
        } else if (agent.x + agent.radius > width) {
            agent.x = width - agent.radius;
            agent.vx = -Math.abs(agent.vx);
        }
        if (agent.y - agent.radius < 0) {
            agent.y = agent.radius;
            agent.vy = Math.abs(agent.vy);
        } else if (agent.y + agent.radius > height) {
            agent.y = height - agent.radius;
            agent.vy = -Math.abs(agent.vy);
        }
    }

    function transmit(a, b, probability, random) {
        const pair = [a, b];
        const infected = pair.find((agent) => agent.state === "infected");
        const susceptible = pair.find((agent) => agent.state === "susceptible");
        if (infected && susceptible && random() < probability) {
            susceptible.state = "infected";
            susceptible.infectedFor = 0;
        }
    }

    function collide(a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minimumDistance = a.radius + b.radius;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared > minimumDistance * minimumDistance) return false;

        const distance = Math.sqrt(distanceSquared) || minimumDistance;
        const nx = dx / distance;
        const ny = dy / distance;
        const overlap = minimumDistance - distance;
        a.x -= (nx * overlap) / 2;
        a.y -= (ny * overlap) / 2;
        b.x += (nx * overlap) / 2;
        b.y += (ny * overlap) / 2;

        const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relativeVelocity < 0) {
            a.vx += relativeVelocity * nx;
            a.vy += relativeVelocity * ny;
            b.vx -= relativeVelocity * nx;
            b.vy -= relativeVelocity * ny;
        }
        return true;
    }

    function stepSimulation(agents, options) {
        const {
            width,
            height,
            transmissionProbability,
            infectiousDuration,
            deltaTime,
            random = Math.random,
        } = options;

        agents.forEach((agent) => {
            agent.x += agent.vx * deltaTime;
            agent.y += agent.vy * deltaTime;
            reflectAtWalls(agent, width, height);
            if (agent.state === "infected") {
                agent.infectedFor += deltaTime;
                if (agent.infectedFor >= infectiousDuration) agent.state = "recovered";
            }
        });

        for (let i = 0; i < agents.length; i += 1) {
            for (let j = i + 1; j < agents.length; j += 1) {
                if (collide(agents[i], agents[j])) {
                    transmit(agents[i], agents[j], transmissionProbability, random);
                }
            }
        }
        return countStates(agents);
    }

    return { createPopulation, stepSimulation, countStates };
});
