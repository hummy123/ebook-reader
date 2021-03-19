
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')
	document.getElementById("copyButton").addEventListener("click", copyText)
	document.getElementById("idiomButton").addEventListener("click", idiomPredict)

	document.getElementById("menu").onmousedown = function(e) {
		e = e || window.event
		e.preventDefault()
	}

	document.body.onmousedown = function(e) {
		divVisibility()
	}
})

async function idiomPredict() {
	const text = window.getSelection().toString()
	closeMenu()
	let formData = new FormData();
	formData.append('sentence', text);

	let data = await fetch('http://0.0.0.0:8090/predict', {
	method: 'POST', 
	body: formData
	})
	
	const prediction = await data.json();
	const idiom = prediction.prediction
	displayIdiom(idiom)
}

function displayIdiom(idiom) {
	const defDiv = document.getElementById("definitions");
	
	const defWidth = (window.innerWidth / 4)
	const defheight = (window.innerHeight / 4)

    defDiv.style.top = (defheight + (defheight/2)) + 'px'
    defDiv.style.left = (defWidth + (defWidth/2))  + 'px'
	defDiv.style.height = defheight + 'px'
	defDiv.style.width = defWidth + 'px'

	defDiv.style.position = 'fixed'
	defDiv.style.display = "block"
	defDiv.innerHTML = `<h1>${idiom}</h1>`
}

function copyText() {
	document.execCommand("copy")
	closeMenu()
	deselect()
}

function openMenu(selection) {
	if (selection.toString().length > 0) {
		const range = selection.getRangeAt(0)
		const bound = range.getClientRects()
		const menu = document.getElementById('menu')
		menu.style.top = (bound[bound.length-1].bottom	 + 3).toString() + 'px'
		menu.style.left = (bound[bound.length-1].right	 + 3).toString() + 'px'
		menu.style.position = 'fixed'
		menu.style.display = "block"
		openMenu()
	}
	else {
		closeMenu()
	}
}

function closeMenu() {
	const menu = document.getElementById('menu')
	menu.style.display = "none"
}

function divVisibility() {
	const defDiv = document.getElementById("definitions")
	defDiv.style.display = "none"
}

function deselect() {
	window.getSelection().removeAllRanges()
}

document.addEventListener('scroll', function(e) {
	closeMenu()
	deselect()
	divVisibility()
})

document.addEventListener("selectionchange", function(e) {
	const selection = window.getSelection()
	openMenu(selection)
})