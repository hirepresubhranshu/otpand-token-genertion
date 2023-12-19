// Generate OTP
document.getElementById('generateOTP').addEventListener('click', function() {
  const phoneNumber = document.getElementById('phoneNumber').value;
  if (phoneNumber.trim() !== '') {
    fetch('/generateOTP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber }),
    })
    .then(response => response.json())
    .then(data => {
      alert('OTP sent to your phone!');
      document.querySelector('.form').style.display = 'none';
      document.querySelector('.otpInput').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
  } else {
    alert('Please enter a phone number!');
  }
});

// Verify OTP
document.getElementById('verifyOTP').addEventListener('click', function() {
  const enteredOTP = document.getElementById('otp').value;
  fetch('/verifyOTP', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enteredOTP }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.verified) {
      document.getElementById('verificationResult').innerText = 'OTP Verified!';
    } else {
      document.getElementById('verificationResult').innerText = 'Invalid OTP!';
    }
  })
  .catch(error => console.error('Error:', error));
});
