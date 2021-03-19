
/** @module Books */

import sqlite from 'sqlite-async'
import 'fs'
import { fstat, readFile, readFileSync } from 'fs'

/**
 * Events
 * ES6 module that handles creating and retrieving books.
 */
class Books {
	/**
   * Create an event object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the events
			const sql = `CREATE TABLE IF NOT EXISTS books\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, ch_nums INTEGER);`
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * creates a new event
	 * @param {String} title the name of the event
	 * @param {String} description the event description
	 * @param {Number} chNums the name and extension of the event image
	 * @returns {Boolean} returns true if the new event has been created
	 */
	async newBook(title, description, chNums) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		/* long line is necessary for query, but eslint throws a warning
		 * of a rule violation in that case, so split query string */
		let sql = 'INSERT INTO books(title, description, ch_nums)'
		sql += ` VALUES("${title}", "${description}", "${chNums}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * gets a list of all events
	 * @returns {Object} returns array of all event objects
	 */
	async getBooks() {
		const sql = 'SELECT * FROM books'
		return await this.db.all(sql)
	}

	/**
	 * gets a single event
	 * @param {Number} primary key from db
	 * @returns {Object} returns javascript object of event if valid id
	 */
	async getBook(id) {
		if(typeof id !== 'number') throw new Error('id must be a number')
		const sql = `SELECT * FROM books WHERE id=${id}`
		const result = await this.db.get(sql)
		if(result === undefined) throw new Error('no results')
		return result
	}

	async getContents(id) {
		const curBook = await this.getBook(id)
		const title = curBook.title
		const toc = readFileSync(`public/books/${title}/toc.json`, 'utf8')
		return JSON.parse(toc)
	}

	async getChapter(bookID, chNum) {
		const curBook = await this.getBook(bookID)
		const title = curBook.title
		
		const chFile = readFileSync(`public/books/${title}/${chNum}.json`, 'utf8')
		let chJSON = JSON.parse(chFile)
		
		if (chNum > 1) {
			chJSON.prev = chNum - 1
		}
		if (chNum < parseInt(curBook.ch_nums)) {
			chJSON.next = chNum + 1
		}
		chJSON.booktitle = title
		chJSON.bookid = curBook.id
		return chJSON

		/*
		TRY TO REFACTOR AND MAKE ASYNC
		return readFile(`public/books/${title}/${chNum}.json`, 'utf8', async (err, data) => {
			if (err) throw err
			let chJSON = JSON.parse(data)
			console.log(chJSON)
			chJSON.prev = chNum--
			chJSON.next = chNum++
			return chJSON
		})*/
		
	}
	

	async close() {
		await this.db.close()
	}
}

export default Books
