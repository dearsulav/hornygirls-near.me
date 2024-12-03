jQuery(document).ready(function ($) {
	var urlReg = '/reg.aspx';

	var currentStep = 1; // Current Step
	var nextBtn = $('.btn-next'); // Next Button
	var isMobile = /Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(navigator.userAgent);
	var isIOS = /iPhone|iPad|iPod/i.test(navigator.platform);
	var isAndroid = /Android/i.test(navigator.userAgent);
	var screenSize = $(window).width();
	var screenHeight = $(window).height();

	var errorTrls = {
		errAge1: 'Invalid age. You must be 18+.',
		errPassword1: 'Please enter a password.',
		errPassword2: 'Password must contain letters and numbers and be 6-16 characters.',
		errEmail1: 'Please enter a valid email address.',
		errEmail2: 'Email is not valid.'
	};

	var timerTrls = {
		timerFinal: 'Next '
	}

	if (typeof translationData === "function" && !!translationData()[language]) {
		if (translationData()[language].errAge1) errorTrls.errAge1 = translationData()[language].errAge1;
		if (translationData()[language].errPassword1) errorTrls.errPassword1 = translationData()[language].errPassword1;
		if (translationData()[language].errPassword2) errorTrls.errPassword2 = translationData()[language].errPassword2;
		if (translationData()[language].errEmail1) errorTrls.errEmail1 = translationData()[language].errEmail1;
		if (translationData()[language].errEmail2) errorTrls.errEmail2 = translationData()[language].errEmail2;
		if (translationData()[language].timerFinal) timerTrls.timerFinal = translationData()[language].timerFinal;
	}

	function validateEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	function validatePass(o, n) {
		var letter = /[a-zA-Z]/;
		var number = /[0-9]/;
		var valid = number.test(o) && letter.test(o) && o.length >= 6 && o.length <= 16;
		if (valid) {
			return '';
		} else return n;
	}

	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function iOSversion(v) {
		if (/iP(hone|od|ad)/.test(navigator.platform)) {
			var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
			return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
		}
	}
	ver = iOSversion();

	if(isMobile) {
		$('body').addClass('isMobile');
	}
	if(isIOS) {
		$('body').addClass('iOs');
	}
	else if(isAndroid) {
		$('body').addClass('isAndroid');
	}

	// Set Content height
	contentHeight();

	function handleSending() {

		var c = getParameterByName('c') ? getParameterByName('c') : '';
		var aid = getParameterByName('a') ? getParameterByName('a') : '';

		var formData = {
			'a': $('#age').val(),
			'e': $('#email').val(),
			'z': zip,
			'p': $('#password').val(),
			'c': c,
			'aid': aid,
			'l': 0
		};

		//console.log(formData);

		nextBtn.addClass('disabled');

		$.ajax({
			type: 'POST',
			url: urlReg,
			data: formData
		}).success(function (data) {
			if (data == "sent" || data == "msg") {
				$('#success-mail').text($('#email').val());

				show_next(1);
			} else {
				document.location.href = data; // url from server
			}
		}).error(function (jqXHR, status, error) {
			nextBtn.removeClass('disabled');
			console.log(jqXHR.responseText);
		});

	}

	function inputFocusMobile() {
		var inputFocus = document.querySelectorAll(".field input");
		var scrollVar = ($(document).height()/2);

		if(isIOS) {
			if(screenHeight > 400) {
				scrollVar = ($(document).height()/4) + 110;
			}
			else {
				scrollVar = ($(document).height()/4) + 120;
			}
		}

		for(var i = 0; i < inputFocus.length; i++){
			inputFocus[i].addEventListener("focus", function() {
				setTimeout(function () {
					$("html, body").animate({ scrollTop: scrollVar }, 100);
					$("body").addClass('keyboard-open');
				}, 700);
			});
			inputFocus[i].addEventListener("focusout", function() {
				setTimeout(function () {
					$("html, body").animate({ scrollTop: 0 });
					$("body").removeClass('keyboard-open');
				}, 100);
			});
		}
	}

	function show_next(n) {
		$('#step' + currentStep).hide();
		var prevStep = currentStep;
		currentStep += n;

		$('#step' + currentStep).css("display", "flex").hide().fadeIn(500).find('input').eq(0).focus();
		$('body').removeClass('active-step-' + prevStep).addClass('active-step-' + currentStep);

		// Preload images
		var preloadImg = $('.preload .preload-img'),
		nextPreload = currentStep + 1;
		preloadImg.eq(currentStep).addClass('preload-img' + nextPreload);

		// Call function inputFocusMobile on mobile
		if (screenSize < 768 && isMobile && screenHeight < 800 && !isIOS || screenSize < 768 && screenHeight < 800 && ver[0] >= 12) {
			inputFocusMobile();
		}
	}

	show_next(0);

	nextBtn.on('click', function (e) {
		e.preventDefault();
		var err = 0,
		timeOutError = 3000;

		$('.close-error').on('click', function() {
			$(this).parents('.error-wrap').removeClass('active-error');
		});

		if (currentStep === 4) {

			var ageInput = $('#age');
			var age = ageInput.val();
			var birthdayErrorInfo = ageInput.closest('.step').find('.error-wrap');

			if (age == '' || !$.isNumeric(age) || age === undefined || age < 18) {
				err = errorTrls.errAge1;
			}

			if (err) {
				birthdayErrorInfo.addClass('active-error').find('.error').text(err);
				ageInput.addClass('e');
				ageInput.focus();

				setTimeout(function() {
					birthdayErrorInfo.removeClass('active-error');
				}, timeOutError);
			} else {
				birthdayErrorInfo.removeClass('active-error').find('.error').text('');
				ageInput.removeClass('e');
				show_next(1);
			}
		}
		else if (currentStep === 5) {

			var passwordInput = $('#password');
			var password = passwordInput.val();
			var passwordErrorInfo = passwordInput.closest('.step').find('.error-wrap');

			if (!password.length) {
				err = errorTrls.errPassword1;
			} else {
				err = validatePass(password, errorTrls.errPassword2);
			}

			if (err) {
				passwordErrorInfo.addClass('active-error').find('.error').text(err);
				passwordInput.addClass('e');
				passwordInput.focus();

				setTimeout(function() {
					passwordErrorInfo.removeClass('active-error');
				}, timeOutError);
			} else {
				passwordErrorInfo.removeClass('active-error').find('.error').text('');
				passwordInput.removeClass('e');
				show_next(1);
			}
		}
		else if (currentStep === 6) {

			var emailInput = $('#email');
			var email = emailInput.val();
			var emailErrorInfo = emailInput.closest('.step').find('.error-wrap');

			if (!email.length) {
				err = errorTrls.errEmail1;
			} else if (!validateEmail(email)) {
				err = errorTrls.errEmail2;
			}

			if (err) {
				emailErrorInfo.addClass('active-error').find('.error').text(err);
				emailInput.addClass('e');
				emailInput.focus();

				setTimeout(function() {
					emailErrorInfo.removeClass('active-error');
				}, timeOutError);
			} else {
				emailErrorInfo.removeClass('active-error').find('.error').text('');
				emailInput.removeClass('e');
				handleSending();
			}
		}
		else {
			show_next(1);
		}
	});

	// Enter Key
	$('.field-wrap input').keypress(function (e) {
		if (e.which == 13) {
			e.preventDefault();
			nextBtn.eq(0).click();
		}
	});

	// Timer
	var interval = setInterval(function () {
		var timer = $('.timer span').html();
		timer = timer.split(':');
		var minutes = parseInt(timer[0], 10);
		var seconds = parseInt(timer[1], 10);
		seconds -= 1;
		if (minutes < 0) return clearInterval(interval);
		if (minutes < 10 && minutes.length != 2) minutes = '0' + minutes;
		if (seconds < 0 && minutes != 0) {
			minutes -= 1;
			seconds = 59;
		}
		else if (seconds < 10 && length.seconds != 2) seconds = '0' + seconds;
		$('.timer span').html(minutes + ':' + seconds);

		if (minutes == 0 && seconds == 0) {
			clearInterval(interval);
			$('.timer span').addClass('enabled').html(timerTrls.timerFinal).parent().append('✔');
		}
	}, 1000);
});

function contentHeight() {
	var windowHeight = $(window).innerHeight();

	$('body').attr('data-window-height', windowHeight);
}
$(window).on('resize', function(){
	contentHeight();
});
