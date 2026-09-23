"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createPopulation, stepSimulation, countStates } = require("../public/scripts/sir-model.js");

test("createPopulation assigns vaccinated and infected people without overlap", () => {
    const agents = createPopulation({
        population: 20,
        initialInfected: 2,
        vaccinatedPercent: 25,
        width: 400,
        height: 240,
        speed: 1,
        random: () => 0.5,
    });

    assert.deepEqual(countStates(agents), { susceptible: 13, infected: 2, recovered: 5 });
});

test("stepSimulation infects a susceptible agent after contact", () => {
    const agents = [
        { x: 50, y: 50, vx: 0, vy: 0, radius: 4, state: "infected", infectedFor: 0 },
        { x: 55, y: 50, vx: 0, vy: 0, radius: 4, state: "susceptible", infectedFor: 0 },
    ];

    stepSimulation(agents, {
        width: 100,
        height: 100,
        transmissionProbability: 1,
        infectiousDuration: 10,
        deltaTime: 1,
        random: () => 0,
    });

    assert.equal(agents[1].state, "infected");
});

test("stepSimulation recovers an agent after the infectious duration", () => {
    const agents = [
        { x: 50, y: 50, vx: 0, vy: 0, radius: 4, state: "infected", infectedFor: 9.5 },
    ];

    stepSimulation(agents, {
        width: 100,
        height: 100,
        transmissionProbability: 0,
        infectiousDuration: 10,
        deltaTime: 0.5,
        random: () => 0.5,
    });

    assert.equal(agents[0].state, "recovered");
});
