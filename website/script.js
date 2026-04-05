/* script.js */

// Greeting form logic
const form = document.querySelector('form');
const greeting = document.querySelector('#greeting');

if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.querySelector('#name').value;
        greeting.textContent = `Hello, ${name}!`;
    });
}

// Cloud-based counter (NO local increment)
const counter = document.getElementById("count");

async function updateCounter() {
    try {
        let response = await fetch(
            "https://vliyl26fl3g75lwtuxtzrgkuva0rxmqc.lambda-url.ap-south-1.on.aws/"
        );

        let data = await response.json();

        // Expecting Lambda to return the count
        counter.textContent = data;
    } catch (error) {
        console.error("Error fetching counter:", error);
        counter.textContent = "Error";
    }
}

// Call only once on page load (no refresh increment logic here)

updateCounter();
