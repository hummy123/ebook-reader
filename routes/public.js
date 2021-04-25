import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Books from '../modules/books.js'
import Notes from '../modules/notes.js'
import Bookmarks from '../modules/bookmarks.js'
const dbName = 'website.db'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/book/:bookid/:chid', async ctx => {
	const book = await new Books(dbName)
	try {
		const bookID = parseInt(ctx.params.bookid)
		const chNum = parseInt(ctx.params.chid)
		const resp = await book.getChapter(bookID,chNum)
		ctx.hbs.ch = resp
		await ctx.render('read', ctx.hbs)
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		book.close()
	}
})

router.post('/book/:bookid/:chid', async ctx => {
	const notes = await new Notes(dbName)
	const body = ctx.request.body //posted form body
	try {
		const bookID = parseInt(ctx.params.bookid)
		const chNum = parseInt(ctx.params.chid)
		const userID = parseInt(ctx.hbs.authorised)
		const highlightedText = body.highlighted
		const noteText = body.noteText
		
		await notes.createNote(noteText, highlightedText, chNum, bookID, userID)
	} catch(err) {
		console.log(err)
	} finally {
		notes.close()
	}
})

router.get('/book/:bookid', async ctx => {
	try {
		const book = await new Books(dbName)
		const bookID = parseInt(ctx.params.bookid)
		const toc = await book.getContents(bookID)
		ctx.hbs.toc = toc
		book.close()

		const bookmark = await new Bookmarks(dbName)
		const userID =parseInt(ctx.hbs.authorised)
		const bookLoc = await bookmark.getBookmark(userID, bookID)
		ctx.hbs.bookmark = bookLoc
		bookmark.close()

		console.log(ctx.hbs)
		await ctx.render('toc', ctx.hbs)
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		
	}
})

router.get('/notes/:bookid', async ctx => {
	const notes = await new Notes(dbName)
	const bookID = parseInt(ctx.params.bookid)
	const userID = parseInt(ctx.hbs.authorised)
	let noteList = await notes.getNotes(bookID, userID)
	notes.close()
	
	console.log(noteList)
	return noteList
})

router.get('/addbook', async ctx => {
	try {
		await ctx.render('addbook')
	} catch(err) {
		ctx.hbs.message = err
		console.log("dfsdfbrbg")
		await ctx.render('error', ctx.hbs)
	}
})

router.post('/addbook', async ctx => {
	const book = await new Books(dbName)
	try {
		const body = ctx.request.body
		await book.newBook(body.title, body.description, body.chnum)
		await ctx.render('index')
	} catch(err) {
		console.log(err)
		ctx.hbs.msg = err.message
		await ctx.render('error', ctx.hbs)
	} finally {
		book.close()
	}
})

router.post('/bookmark/:bookid/:chid', async ctx => {
	const bookmark = await new Bookmarks(dbName)
	const body = ctx.request.body //posted form body
	try {
		const bookID = parseInt(ctx.params.bookid)
		const chNum = parseInt(ctx.params.chid)
		const userID = parseInt(ctx.hbs.authorised)
		
		await bookmark.checkBookmark(userID, bookID, chNum)
	} catch(err) {
		console.log(err)
	} finally {
		bookmark.close()
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		// call the functions in the module
		await account.register(ctx.request.body.user, ctx.request.body.pass, ctx.request.body.email)
		ctx.redirect(`/login?msg=new user "${ctx.request.body.user}" added, you need to log in`)
	} catch(err) {
		console.log(err)
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		await account.close()
	}
})

router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login', ctx.hbs)
})

router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		const id = await account.login(body.user, body.pass)
		ctx.session.authorised = id
		const referrer = body.referrer || '/secure'
		return ctx.redirect(`${referrer}?msg=you are now logged in...`)
	} catch(err) {
		console.log(err)
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		await account.close()
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = 0
	ctx.redirect('/?msg=you are now logged out')
})

export default router
