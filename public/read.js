
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')
	
	//add event listeners for various buttons once document loaded
	document.getElementById("copyButton").addEventListener("click", copyText)
	document.getElementById("newnoteButton").addEventListener("click", noteForm)
	document.getElementById('saveNote').addEventListener('click', addNote)
	document.getElementById('viewNotesButton').addEventListener('click', viewNotes)
	document.getElementById("idiomButton").addEventListener("click", idiomPredict)

	document.getElementById('settingsButton').addEventListener('click', openSettings)
	document.getElementById('layerOpacity').addEventListener('input', changeShade)
	document.getElementById('colourOverlay').addEventListener('input', changeShade)

	document.getElementById('stopClick').addEventListener('click', closeAll)
	
	document.getElementById("menu").onmousedown = function(e) {
		e = e || window.event
		e.preventDefault()
	}


	/* EXAMPLE CODE OF GETTING ALL P ELEMENTS FOR DISPLAY SETTINGS
	var x = document.querySelectorAll("main");

	for (test of x) {
		test.style.backgroundColor = "red"; 
	}*/
	

	//add bookmark for most recently opened page
	addBookmark()
})

function closeAll() {
	closeStopDiv()
	closeMenu()
	closeNote()
	closeSettings()
	closeMessage()
}

function closeSettings() {
	const settingsDiv = document.getElementById("display")
	settingsDiv.style.display = 'none'
}

function closeStopDiv() {
	const stopDiv = document.getElementById("stopClick")
	stopDiv.style.display = "none"
}

function openStopDiv() {
	const stopDiv = document.getElementById("stopClick")
	
    stopDiv.style.top = 0 + 'px'
    stopDiv.style.left = 0  + 'px'
	stopDiv.style.height = "100%"
	stopDiv.style.width = "100%"
	stopDiv.style.boxShadow = 'none'
	stopDiv.style.position = 'fixed'
	stopDiv.style.backgroundColor = 'transparent'
	stopDiv.style.display = "block"
	stopDiv.style.zIndex = '1'
}

function openSettings(){
	closeAll()
	openStopDiv()
	const settingsDiv = document.getElementById("display")
	
	const divWidth = (window.innerWidth / 4)
	const divHeight = (window.innerHeight * 0.2)

    settingsDiv.style.top = divHeight + 'px'
    settingsDiv.style.left = divWidth  + 'px'
	settingsDiv.style.height = "fit-contents"
	settingsDiv.style.width = "50%"
	settingsDiv.style.position = 'fixed'
	settingsDiv.style.display = "block"
	settingsDiv.style.zIndex = '2'
}

function changeShade() {
	const layerDiv = document.getElementById('lightLayer')

	let layerOpacityVal = document.getElementById('layerOpacity').value
	layerOpacityVal = layerOpacityVal / 100
	let color = document.getElementById('colourOverlay').value

	if (color === 'white') {
		color = '255,255,255'
	} else if (color === 'grey') {
		color = '190,190,190'
	} else if (color === 'black') {
		color = '0,0,0'
	}
	
	layerDiv.style.top = 0 + 'px'
    layerDiv.style.left = 0  + 'px'
	layerDiv.style.width = '100vw'
	layerDiv.style.height = '100vh'
	layerDiv.style.backgroundColor = `rgba(${color},${layerOpacityVal})`
	layerDiv.style.position = 'fixed'
	layerDiv.style.display = "block"
	layerDiv.style.boxShadow = 'none'
	layerDiv.style.pointerEvents = 'none'
	layerDiv.style.zIndex = '3'
}

async function addBookmark() {
	let noteLink = window.location.href
	noteLink = noteLink.replace('/book/', '/bookmark/')

	await fetch(`${noteLink}`, {
	method: 'POST'
	})
}

async function idiomPredict() {
	const text = window.getSelection().toString()
	let formData = new FormData()
	formData.append('sentence', text)

	let data = await fetch('http://0.0.0.0:8090/predict', {
	method: 'POST', 
	body: formData
	})
	
	const prediction = await data.json()
	const idiom = prediction.prediction
	const definition = prediction.definition
	displayMessage(idiom, definition)
}

function displayMessage(messageHeading, messageContents) {
	closeAll()
	openStopDiv()
	const msgDiv = document.getElementById("messages")
	
	const msgWidth = (window.innerWidth * 0.35)
	const msgheight = (window.innerHeight * 0.35)

    msgDiv.style.top = msgheight + 'px'
    msgDiv.style.left = msgWidth  + 'px'
	msgDiv.style.height = "30%"
	msgDiv.style.width = "30%"
	msgDiv.style.position = 'fixed'
	msgDiv.style.display = "block"
	msgDiv.style.zIndex = '2'

	const heading = document.getElementById("messageHeading")
	const contents = document.getElementById("messageContents")
	heading.innerHTML = messageHeading
	contents.innerHTML = messageContents
}

function copyText() {
	document.execCommand("copy")
	closeAll()
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
		menu.style.zIndex = '2'
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
	closeAll()
	const noteForm = document.getElementById('notes')
	
	const highlighted = document.getElementById('highlighted')
	highlighted.value = window.getSelection().toString()

	const defWidth = (window.innerWidth * 0.35)
	const defheight = (window.innerHeight * 0.35)

    noteForm.style.top = defheight + 'px'
    noteForm.style.left = defWidth  + 'px'
	noteForm.style.height = "fit-contents"
	noteForm.style.width = "30%"
	noteForm.style.position = 'fixed'
	noteForm.style.display = "block"
	noteForm.style.padding = "2em"
	noteForm.style.zIndex = "2"
	openStopDiv()
}

async function addNote() {
	closeAll()
	const highlighted = document.getElementById('highlighted')
	highlightedText = highlighted.value

	const noteTextArea = document.getElementById('noteText')
	noteText = noteTextArea.value

	const noteLink = window.location.href
	
	let formData = new FormData()
	formData.append('highlighted', highlightedText)
	formData.append('noteText', noteText)

	await fetch(`${noteLink}`, {
	method: 'POST', 
	body: formData
	})
	displayMessage('Note added successfully.', `Saved note "${noteText}" for text "${highlightedText}".`)
}

async function viewNotes() {
	closeAll()

	let noteLink = window.location.href
	noteLink = noteLink.substr(0, noteLink.lastIndexOf("\/") + 1)
	noteLink = noteLink.replace('/book/', '/notes/')
	let data = await fetch(`${noteLink}`, {method: 'POST'})
	
	const response = await data.json()
	const table = await noteTable(response)
	displayMessage("View Notes", table)
}

async function noteTable(noteList) {
	let tableString = `<table><th>Highlighted Text</th><th>Note Text</th>`
	for (const entry of noteList) {
		tableString += `<tr> <td>${entry.highlighted_text}</td> <td>${entry.note_text}</td> </tr>`
	}
	tableString += `</table>`
	return tableString
}

function closeMessage() {
	const defDiv = document.getElementById("messages")
	defDiv.style.display = "none"
}

function deselect() {
	window.getSelection().removeAllRanges()
}

document.addEventListener('scroll', function(e) {
	closeAll()
	deselect()
})

document.addEventListener("selectionchange", function(e) {
	const selection = window.getSelection()
	openMenu(selection)
})