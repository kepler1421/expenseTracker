
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

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    let user = localStorage.getItem(email);
    if (user){
        let parseUser = JSON.parse(user);
        if (parseUser.password === password){
            localStorage.getItem("user", JSON.stringify(parseUser));

            Swal.fire({
                title: 'Success!',
                text: 'Login successful',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "index.html";
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Invalid username or password',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        }
    } else {
        Swal.fire({
            title: 'Error!',
            text: 'User not found',
            icon: 'error',
            confirmButtonText: 'Try Again'
        });
    }
});

document.getElementById("register-form").addEventListener("submit", function (event) {
    event.preventDefault();
    let fullName = document.getElementById("fullName").value;
    let email = document.getElementById("register-email").value;
    let passwordReg = document.getElementById("register-password").value;

    let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$/;
    if (!emailRegex.test(email)) {
        Swal.fire({
            title: 'Error!',
            text: 'Invalid email address',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    let fullNameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
    if (!fullNameRegex.test(fullName)) {
        Swal.fire({
            title: 'Error!',
            text: 'Full name should be at least two names with space in between',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const user = {
        fullName: fullName,
        email: email,
        password: passwordReg,
};

localStorage.setItem(email, JSON.stringify(user));
alert("registration successfull");

});
