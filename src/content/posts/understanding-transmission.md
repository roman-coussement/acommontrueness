---
title: "Understanding Transmission of Infectious Diseases"
description: "A framework for understanding how infectious diseases reach, infect, and spread between hosts."
date: 2026-09-22
slug: understanding-transmission
---

<div class="transmission-layout">
<div class="article-body transmission-copy">

## Combes&#39; Two Filters

The question of whether an infectious disease can have a significant, harmful effect on a population can be reduced to two questions: can the pathogen meet and interact with a potential new host? Can it survive and cause harm once transmitted? One framework for thinking through these questions (and their answers for a given pathogen) is given by Claude Combes&#39; encounter and compatibility filters.<sup><a href="#note-1">1</a></sup>

## Encounter Filter

Whether an infectious disease can pass the encounter filter depends on its transmission mechanism. There are three stages of the transmission process: **emission**, **transfer**, and **reception**.

<details class="article-disclosure">
<summary><h3><strong>Emission</strong> of the pathogen from the original host into the environment.</h3></summary>
<div class="article-disclosure-content">
<p>Relevant variables include:</p>
<ol>
<li><strong>Exit route.</strong> Pathogens can leave through the airway, gut, blood, skin, and more.</li>
<li><strong>Shedding intensity.</strong> Number of infectious particles released per unit of time.</li>
<li><strong>Shedding duration.</strong> Time for which the host remains infectious.</li>
<li><strong>Latent period.</strong> Delay between the infection and the onset of emission.</li>
<li><strong>Symptom-driven emission.</strong> Coughing, sneezing, diarrhea, and skin lesions are all examples of symptoms that can drive emission.</li>
<li><strong>Particle size.</strong> Large particles normally fall within a short distance of the emission point, whereas fine particles and aerosols can remain in the air and be carried with airflow.</li>
</ol>
</div>
</details>

<details class="article-disclosure">
<summary><h3><strong>Transfer</strong> of infectious particles, either through the environment or via intermediary hosts.</h3></summary>
<div class="article-disclosure-content">
<ol>
<li><strong>Survival.</strong> Rate of decay of the pathogen during transfer (e.g., in air or water).</li>
<li><strong>Sensitivity.</strong> The effect of temperature, humidity, sunlight, pH, and other environmental variables.</li>
<li><strong>Transfer mode(s).</strong> Examples include direct contact, respiratory, fecal-oral, waterborne, and bloodborne transmission.</li>
<li><strong>Intermediate hosts.</strong> Some pathogens need one or more intermediates to complete the transfer, making transmission more challenging.</li>
<li><strong>Spatial scale.</strong> Distance over which transfer events can occur, ranging from a few meters to between countries.</li>
<li><strong>Seasonality.</strong> Transfer rates change through the seasons, in response to both physical variables (temperature, humidity) and social ones (indoor crowding).</li>
<li><strong>Dilution.</strong> Transfer through air or water typically lowers the concentration of infectious particles that reach the next host.</li>
</ol>
</div>
</details>

<details class="article-disclosure">
<summary><h3><strong>Reception</strong> of the particles from the environment by the host's body.</h3></summary>
<div class="article-disclosure-content">
<ol>
<li><strong>Entry point.</strong> For example, blood or lungs.</li>
<li><strong>Infectious dose.</strong> Number of particles necessary to start an infection.<sup><a href="#note-2">2</a></sup></li>
<li><strong>Physical barriers.</strong> Such as skin, mucus, cilia,<sup><a href="#note-3">3</a></sup> and stomach acid.</li>
</ol>
</div>
</details>

Our main tools for closing the encounter filter are public-health measures. These include preventive strategies (quarantine), environmental strategies (sanitation and mosquito/tick control), and behavioral strategies (remaining indoors, wearing personal protective equipment (PPE), and using protection during sex).

## Compatibility Filter

Having made it to a new host, the pathogen must then overcome various physical and immunological barriers to survive in the new host.

We can group the different compatibility factors into three broad buckets: establishment, growth, and harm. That is, the newly arrived pathogen must first establish itself, then reproduce (and outpace the new host&#39;s immune defenses in doing so), and, finally, trigger a response.

<details class="article-disclosure">
<summary><h3><strong>Establishment.</strong> This determines whether an infection is able to take hold.</h3></summary>
<div class="article-disclosure-content">
<p>This is determined by, among other things:</p>
<ul>
<li><strong>Infectious dose</strong> (see above).</li>
<li>Whether the pathogen can bind to a receptor on the host cell (<strong>receptor match</strong>).</li>
<li>The set of cells and cell types in which the pathogen can replicate (<strong>tissue tropism</strong>).</li>
<li><strong>Physical barriers</strong> (see above).</li>
</ul>
</div>
</details>

<details class="article-disclosure">
<summary><h3><strong>Growth.</strong> This roughly describes the race between the pathogen—which seeks to reproduce—and the host's immune response, which works to combat it.</h3></summary>
<div class="article-disclosure-content">
<ul>
<li>Some pathogens take more or less time than others to reproduce (<strong>replication rate</strong>).</li>
<li>The speed of the immune system's first line of defense against pathogens, the <em>innate</em> immune system (<strong>innate response</strong>).</li>
<li><strong>Adaptive response:</strong> antibodies, T cells, and other elements of the <em>adaptive</em> immune system.</li>
<li>IgA antibodies<sup><a href="#note-4">4</a></sup> at the entry site can help to block infection (<strong>mucosal immunity</strong>).</li>
<li>Whether the pathogen has developed any means of preventing an immune response: antigenic variation, latency, capsules, molecular mimicry, or immune suppression (<strong>immune evasion</strong>).</li>
</ul>
</div>
</details>

<details class="article-disclosure">
<summary><h3><strong>Response.</strong> This describes both the potential harm of the pathogen to the host and immune and other resistance-related responses.</h3></summary>
<div class="article-disclosure-content">
<ul>
<li>Some harm can come from the host's immune response, as opposed to the pathogen itself (<strong>immunopathology</strong>).<sup><a href="#note-5">5</a></sup></li>
<li><strong>Duration of immunity</strong> can vary widely, ranging from a few months to an entire lifetime.</li>
<li>Change in the antigenic nature of the pathogen—due to reproduction and random mutation—can reduce existing immune protection (<strong>antigenic change</strong>).</li>
<li>Exposure to related pathogens can have mixed effects: in some cases providing partial protection (<strong>cross-immunity</strong>)<sup><a href="#note-6">6</a></sup> and in others provoking a worse response (<strong>antibody-dependent enhancement</strong>).<sup><a href="#note-7">7</a></sup></li>
</ul>
</div>
</details>

## The Result

In the aggregate, these factors determine the rate at which an infectious disease is likely to spread from host to host.

Characterizing this number, epidemiologists often talk about R<sub>0</sub> (pronounced “R-zero” or “R-nought”), the *basic reproduction number*. This number describes the expected number of secondary infections of a disease and can be thought of as the number of new cases that would be generated by the first case of a new outbreak in a perfectly susceptible population.

This number varies widely between pathogens and depends heavily on particular studies and settings; some salient examples are provided below.

<div class="transmission-table-wrap">
<table class="transmission-table">
<colgroup><col class="pathogen-column"><col class="range-column"><col class="notes-column"></colgroup>
<thead><tr><th>Pathogen</th><th>Typical R<sub>0</sub> range</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Measles</td><td><a href="https://pubmed.ncbi.nlm.nih.gov/28757186/">12–18</a></td><td>Among the highest known values</td></tr>
<tr><td>SARS-CoV-2 (2019)</td><td><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7074654/">1.5–6.5</a></td><td></td></tr>
<tr><td>SARS (2003)</td><td><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7117038/">~3</a></td><td></td></tr>
<tr><td>HIV</td><td><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3880255/">2–5</a></td><td>Varies widely according to sexual behavior and treatment access; <a href="https://www.ovid.com/jnls/jphmp/abstract/10.1097/phh.0000000000001397~estimating-the-hiv-effective-reproduction-number-in-the?redirectionsource=fulltextview">estimated</a> to be &lt;1 for the United States</td></tr>
<tr><td>Ebola (West Africa, 2014)</td><td><a href="https://pubmed.ncbi.nlm.nih.gov/38181864/">1.75–2.15</a></td><td></td></tr>
<tr><td>Influenza (seasonal)</td><td><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4169819/">1.47–2.27</a></td><td></td></tr>
<tr><td>MERS</td><td><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7114943/">&lt;1</a></td><td>Hospital outbreaks can have local values greater than 1</td></tr>
</tbody>
</table>
</div>

To close the compatibility filter via immunization, it&#39;s not necessary to reach 100% of people: if a sufficient number of people are immunized such that each new case leads to fewer than one new case, on average, this will (in time) reduce the incidence of the pathogen. Technically, we say that the reproduction number must be brought below one.

<section class="article-notes" aria-labelledby="notes-title">
<h2 id="notes-title">Notes</h2>
<ol>
<li id="note-1"><em>Parasitism: The Ecology and Evolution of Intimate Interactions</em>, Claude Combes (2001).</li>
<li id="note-2">This is often characterized as Infectious Dose 50 (ID50): the quantity of a given pathogen required to cause infection in 50% of an exposed population.</li>
<li id="note-3"><a href="https://ciliopathyalliance.org/cilia">Ciliopathy Alliance: Cilia</a>.</li>
<li id="note-4"><a href="https://my.clevelandclinic.org/health/body/immunoglobulin-a">Cleveland Clinic: Immunoglobulin A</a>.</li>
<li id="note-5">One example is a <a href="https://my.clevelandclinic.org/health/diseases/cytokine-storm"><em>cytokine storm</em></a>, in which the immune system releases a large quantity of inflammatory proteins that lead to life-threatening inflammation in the host.</li>
<li id="note-6"><a href="https://www.betalifesci.com/blogs/news/cross-reactivity-in-immunology">Cross-reactivity in immunology</a>.</li>
<li id="note-7"><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7119964/">Antibody-dependent enhancement and SARS-CoV-2 vaccines and therapies</a>.</li>
</ol>
</section>

</div>

<aside class="simulator-panel" aria-labelledby="simulator-title">
<div class="simulator-sticky">
<div class="simulator-heading">
<h2 id="simulator-title">Interactive model</h2>
<div class="simulator-actions">
<button type="button" id="simulation-toggle" data-state="paused" aria-label="Play outbreak"><svg class="play-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg><svg class="pause-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"></path></svg></button>
<button type="button" id="simulation-reset" class="button-secondary" aria-label="Reset outbreak"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8l-4-4v3.1A7 7 0 1 0 19 13h-2a5 5 0 1 1-2-3.9V12z"></path></svg></button>
</div>
</div>
<p class="simulator-intro">Each dot is a person. When an infectious person meets a susceptible person, infection may spread. Recovered and vaccinated people remain immune in this simplified SIR model.</p>
<div class="simulator-legend" aria-label="Simulation legend"><span><i class="legend-dot susceptible"></i>Susceptible</span><span><i class="legend-dot infected"></i>Infectious</span><span><i class="legend-dot recovered"></i>Recovered</span></div>
<canvas id="simulation-canvas" class="simulation-canvas" role="img" aria-label="Animated outbreak simulation"></canvas>
<div class="simulator-counts" aria-live="polite"><span>S <strong id="susceptible-count">0</strong></span><span>I <strong id="infected-count">0</strong></span><span>R <strong id="recovered-count">0</strong></span></div>
<canvas id="sir-chart" class="sir-chart" role="img" aria-label="Live chart of susceptible, infectious, and recovered populations"></canvas>
<div class="simulator-controls">
<label for="population"><span>Population</span><output id="population-value">120</output></label><input id="population" type="range" min="40" max="220" step="10" value="120">
<label for="initialInfected"><span>Initial infections</span><output id="initialInfected-value">3</output></label><input id="initialInfected" type="range" min="1" max="15" step="1" value="3">
<label for="movement"><span>Movement / contact rate</span><output id="movement-value">1.0×</output></label><input id="movement" type="range" min="0.3" max="2.5" step="0.1" value="1">
<label for="transmission"><span>Transmission per contact</span><output id="transmission-value">35%</output></label><input id="transmission" type="range" min="5" max="100" step="5" value="35">
<label for="duration"><span>Infectious duration</span><output id="duration-value">8s</output></label><input id="duration" type="range" min="3" max="20" step="1" value="8">
<label for="vaccinated"><span>Vaccinated</span><output id="vaccinated-value">0%</output></label><input id="vaccinated" type="range" min="0" max="90" step="5" value="0">
</div>
<p class="simulator-caveat">This model is illustrative. It assumes random mixing, lasting immunity, and equal susceptibility and infectiousness.</p>
</div>
</aside>
</div>
