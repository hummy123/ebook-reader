
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')
	
	//add event listeners for various buttons once document loaded
	document.getElementById("copyButton").addEventListener("click", copyText)
	document.getElementById("idiomButton").addEventListener("click", idiomPredict)
	document.getElementById("newnoteButton").addEventListener("click", noteForm)
	document.getElementById('saveNote').addEventListener('click', addNote)

	document.getElementById("menu").onmousedown = function(e) {
		e = e || window.event
		e.preventDefault()
	}

	document.body.onmousedown = function(e) {
		closeMessage()
	}
})

async function idiomPredict() {
	const text = window.getSelection().toString()
	closeMenu()
	let formData = new FormData()
	formData.append('sentence', text)

	let data = await fetch('http://0.0.0.0:8090/predict', {
	method: 'POST', 
	body: formData
	})
	
	const prediction = await data.json()
	const idiom = prediction.prediction
	displayMessage(idiom, "placeholder definition")
}

function displayMessage(messageHeading, messageContents) {
	const msgDiv = document.getElementById("messages")
	
	const msgWidth = (window.innerWidth / 4)
	const msgheight = (window.innerHeight / 4)

    msgDiv.style.top = (msgheight + (msgheight/2)) + 'px'
    msgDiv.style.left = (msgWidth + (msgWidth/2))  + 'px'
	msgDiv.style.height = msgheight + 'px'
	msgDiv.style.width = msgWidth + 'px'
	msgDiv.style.position = 'fixed'
	msgDiv.style.display = "block"

	const heading = document.getElementById("messageHeading")
	const contents = document.getElementById("messageContents")
	heading.innerHTML = messageHeading
	contents.innerHTML = messageContents
}

function copyText() {
	document.execCommand("copy")
	closeMenu()
	closeNote()
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

function closeNote() {
	const noteForm = document.getElementById('notes')
	noteForm.style.display = "none"
}

function noteForm() {
	closeMenu()
	const noteForm = document.getElementById('notes')
	
	const highlighted = document.getElementById('highlighted')
	highlighted.value = window.getSelection().toString()

	const defWidth = (window.innerWidth / 4)
	const defheight = (window.innerHeight / 4)

    noteForm.style.top = (defheight + (defheight/2)) + 'px'
    noteForm.style.left = (defWidth + (defWidth/2))  + 'px'
	noteForm.style.height = "30%"
	noteForm.style.width = "25%"
	noteForm.style.position = 'fixed'
	noteForm.style.display = "block"
	noteForm.style.padding = "2em"
}

async function addNote() {
	const highlighted = document.getElementById('highlighted')
	highlightedText = highlighted.value

	const noteTextArea = document.getElementById('noteText')
	noteText = noteTextArea.value

	const noteLink = window.location.href
	
	let formData = new FormData()
	formData.append('highlighted', highlightedText)
	formData.append('noteText', noteText)

	let data = await fetch(`${noteLink}`, {
	method: 'POST', 
	body: formData
	})
	closeNote()
	displayMessage('Note added successfully.', `Saved note "${noteText}" for text "${highlightedText}".`)
}

function closeMessage() {
	const defDiv = document.getElementById("messages")
	defDiv.style.display = "none"
}

function deselect() {
	window.getSelection().removeAllRanges()
}

document.addEventListener('scroll', function(e) {
	closeMenu()
	deselect()
	closeNote()
	closeMessage()
})

document.addEventListener("selectionchange", function(e) {
	const selection = window.getSelection()
	openMenu(selection)
})