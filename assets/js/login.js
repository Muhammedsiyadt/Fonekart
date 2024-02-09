

function loginSubmit() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const emailErr = document.getElementById('emailErr')
    const passwordErr = document.getElementById('passwordErr')

    const emailErrorMessage = []
    const passwordErrorMessage = []

    if(email.trim() === ''){
        emailErrorMessage.push('This feild is required')
    }
    emailErr.innerHTML = emailErrorMessage.join(", ")

    if(password.trim() === ''){
        passwordErrorMessage.push('This feild is required')
    }
    passwordErr.innerHTML = passwordErrorMessage.join(", ")

    if(emailErrorMessage.length === 0 &&  passwordErrorMessage.length === 0){
        form.submit()
    }
}

