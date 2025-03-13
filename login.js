// document.addEventListener('DOMContentLoaded', function() {
//     const container = document.querySelector('.container-card');
//     const registerBtn = document.querySelector('.register-btn');
//     const loginBtn = document.querySelector('.login-btn');
    
//     registerBtn.addEventListener('click', () => {
//         container.classList.add('active');
//     });
    
//     loginBtn.addEventListener('click', () => {
//         container.classList.remove('active');
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container-card');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');

    // Toggle to Register form
    registerBtn.addEventListener('click', function() {
        container.classList.add('active');
    });

    // Toggle to Login form
    loginBtn.addEventListener('click', function() {
        container.classList.remove('active');
    });
});