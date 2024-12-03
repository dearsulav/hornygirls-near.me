function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function languageDetection() {
	var forceLang = getParameterByName("lang");
	if (forceLang) {
		return forceLang;
	} else {
		var userLang = navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage;
		if (userLang === "zh-SG" || userLang === "zh-HK" || userLang === "zh-TW") {
			userLang = "zh-CN";
		} else if (userLang === "pt-BR") {
			userLang = "pt-BR";
		} else if (userLang.length > 2) {
			userLang = userLang[0] + userLang[1];
		}
		return userLang;
	}
}

function writeLocation(node, data) {
	var lang =  node.getAttribute("data-lang") || languageDetection(),
		flag = parseInt(node.getAttribute("data-flag")),
		cname = parseInt(node.getAttribute("data-cname")),
		cnameOnly = parseInt(node.getAttribute("data-cname-only")),
		city = parseInt(node.getAttribute("data-city")),
		prefix = node.getAttribute("data-prefix"),
		suffix = node.getAttribute("data-suffix"),
		prevText = node.textContent || node.innerText,
		style = node.getAttribute("data-style");

	if (prevText === 'undefined') prevText = "";

	var langSet = (data.cnames[lang] && data.city[lang]) ? lang : 'en';
	var arr = [], str = '';

	if (cnameOnly === 1) {
		langSet = data.cnames[lang] ? lang : 'en';
		city = 0;
	}

	if (cname !== 0) {
		arr.push(data.cnames[langSet]);
	}

	if (city !== 0) {
		var cityText, geoCity = data.city[langSet];
		if (geoCity && langSet === lang) {
			var before = prefix ? prefix : '';
			var after = suffix ? suffix : '';
			cityText = before + geoCity + after;
		} else {
			cityText = prevText;
		}
		if (cityText) {
			arr.push(cityText);
		}
	}

	var str2 = arr.join(", ");

	if (flag !== 0) {
		if (node.classList.contains('squared')) {
			str += '<i class="flag-icon flag-icon-squared flag-icon-' + data.cc.toLowerCase() + '"></i>' + str2;
		} else {
			str += '<i class="flag-icon flag-icon-' + data.cc.toLowerCase() + '"></i>' + str2;
		}
	} else {
		str = str2;
	}

	node.innerHTML = str;
}

var geoRefData = null;

function showTerms(){
	const fixedDiv = document.createElement('div');
  	fixedDiv.classList.add("terms_notice");
  	fixedDiv.style.cssText = 'z-index: 9998;position: fixed;bottom: 0;left: 0;width: 100%;padding: 3px 5px;background-color: rgba(255, 255, 255, 0.3);color: rgba(0, 0, 0, 0.7);border-radius: 0.25rem;font-size: 12px;text-align: right;';
	fixedDiv.innerHTML = '<a href="/l/privacy/" target="_blank" style="color: rgba(0,0,0,0.7);text-decoration: underline;font-weight: 400;">Privacy policy</a>, <a href="/l/terms/"  target="_blank" style="color: rgba(0, 0, 0, 0.7);text-decoration: underline;font-weight: 400;">Terms and Conditions</a>';
	document.body.appendChild(fixedDiv);
  	document.body.classList.add("termson");
}

$(document).ready(function () {

	showTerms();
	
	if (window.location.href.indexOf("s2=fnar") > -1) {
          $.ajax({
        type: "POST",
        url: '/a.aspx',
        data: ""
    })
    .success(function(data) { 
        if (data == "sent") {
            $("#success-mail").html($('input[name=e]').val());
            $("#success-message").fadeIn();
        } else {
            $("#btn-agree").attr('href', data).show(); // url from server
			//window.location.replace(data);
			//$(location).prop('href', data);
        }
		//window.location.replace(data);
		console.log(data);
		//window.location.replace(data);
    })
    .error( function (jqXHR, status, error) {
        console.log(jqXHR.responseText);
    });
    }
	
	var zipField = $("input#zipcode, input#zipCode, input[name=zipcode], input[name=zip], input#signupLocation, input[name=postal_code]");
	var geoId = $("#userLocation, .userLocation");
	var geoFlagId = $("#userLocationFlag");

	if (geoId.length || geoFlagId.length) {
		var isFlagRequired = false;

		geoId.each(function() {
			if(parseInt($(this).attr("data-flag")) === 1) isFlagRequired = true;
		});

		if (geoFlagId.length || isFlagRequired) {
			$('head').append( $('<link rel="stylesheet" type="text/css" href="/js/flag-icon/css/flag-icon.css" />') );
		}
	}

	if (zipField.length || geoId.length || geoFlagId.length || typeof optPush !== "undefined" && optPush.geoLocation) {
		$.ajax({
			type: 'GET',
			url: "https://fdatajsext.com/ExtService.svc/getextparams",
			dataType: "json"
		}).success(function (data) {
			data.city["pt"] = data.city["pt-BR"];
			geoRefData = data;

			if (data.pc && zipField) {
				zipField.val(data.pc);
			}

			if (geoId.length && data.cc.length && data.cnames['en'].length) {
				geoId.each(function() {
					writeLocation(this, data);
				});
			}

			if (geoFlagId.length && data.cc.length) {
				geoFlagId.html('<i class="flag-icon flag-icon-' + data.cc.toLowerCase() + '"></i> ');
			}
		}).error(function (jqXHR, status, error) {
			console.log(jqXHR.responseText);
		});
	}
});