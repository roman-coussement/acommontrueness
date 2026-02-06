// script.js - Interactive name toggle with baffle.js

document.addEventListener('DOMContentLoaded', function() {
    if (typeof baffle !== 'function') {
        console.error('baffle.js failed to load');
        return;
    }

    const titleElement = document.querySelector('.site-title');
    if (!titleElement) return;

    const states = {
        name: 'roman coussement',
        title: 'a common trueness'
    };
    let currentState = sessionStorage.getItem('titleState') || 'name';
    if (currentState !== 'name' && currentState !== 'title') {
        currentState = 'name';
    }
    let activeBaffle = null;

    titleElement.textContent = states[currentState];

    titleElement.style.cursor = 'pointer';
    titleElement.style.userSelect = 'none';

    titleElement.addEventListener('click', function() {
        // Stop any existing animation
        if (activeBaffle) {
            activeBaffle.stop();
        }

        const targetState = currentState === 'name' ? 'title' : 'name';
        const targetText = states[targetState];

        activeBaffle = baffle('.site-title', {
            characters: '~!@#$%^&*-+=<>?/\\|abcdefghijklmnopqrstuvwxyz',
            speed: 50
        });

        activeBaffle.start();

        setTimeout(function() {
            activeBaffle.text(function() {
                return targetText;
            });
            activeBaffle.reveal(1000);

            setTimeout(function() {
                currentState = targetState;
                sessionStorage.setItem('titleState', currentState);
            }, 1000);
        }, 1000);
    });
});
