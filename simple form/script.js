document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the values from the input fields
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validation: Check if fields are empty
    if (username === '' || password === '') {
        alert('Please fill all fields');
        return;
    }

    // If validation passes, show success message
    alert('Login successful');

    // Optional: Clear the form
    document.getElementById('loginForm').reset();
});
