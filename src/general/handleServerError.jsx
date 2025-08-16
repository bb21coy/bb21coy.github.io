// Displays an error message when the json response from
// the backend is an error
function handleServerError(status) {
	if (status === 401) {
		showMessage("Unable to verify user. Please login again.");
	} else if (status === 404) {
		showMessage("The requested resource was not found.");
	} else if (status === 406) {
		showMessage('One of the fields provided is incorrect! \nPlease try again.')
	} else if (status === 306) {
		showMessage('One of the fields has already been taken! \nPlease check the existing list.')
	} else {
		showMessage("Something went wrong on our end. Please try again later.");
	}
}

const showMessage = (message, type='error') => {
	const newError = document.createElement('div');
	newError.classList.add('error');
	if (type === 'success') newError.classList.add('success');
	newError.textContent = message;
	document.querySelector('.error-container').appendChild(newError);

	setTimeout(() => newError.remove(), 5000);
}

export { handleServerError, showMessage }