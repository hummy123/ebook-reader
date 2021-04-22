
/** @module Notes */

import sqlite from 'sqlite-async'
import 'fs'
import { fstat, readFile, readFileSync } from 'fs'

/**
 * Events
 * ES6 module that handles creating and retrieving books.
 */
class Notes {
	/**
   * Create an event object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the events
			const sql = `CREATE TABLE IF NOT EXISTS notes\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, highlighted_text TEXT, note_text TEXT, ch_num INTEGER, 
					FOREIGN KEY(book_id) REFERENCES books(id), FOREIGN KEY(user_id) REFERENCES users(id));`
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * creates a new note
	 * @param {String} title the name of the event
	 * @param {String} description the event description
	 * @param {Number} chNums the name and extension of the event image
	 * @returns {Boolean} returns true if the new event has been created
	 */
	async newNote(noteText, highlightedText, chNum, bookID, userID) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		/* long line is necessary for query, but eslint throws a warning
		 * of a rule violation in that case, so split query string */
		let sql = 'INSERT INTO notes(note_text, highlighted_text, ch_num, book_id, user_id)'
		sql += ` VALUES("${noteText}", "${highlightedText}", "${chNum}", "${bookID}", "${userID}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * gets a note object
	 * @param {Number} primary key from db
	 * @returns {Object} returns javascript object of note if valid id
	 */
	async getNote(id) {
		if(typeof id !== 'number') throw new Error('id must be a number')
		const sql = `SELECT * FROM notes WHERE id=${id}`
		const result = await this.db.get(sql)
		if(result === undefined) throw new Error('no results')
		return result
	}

	async modifyNote(id, modifiedText) {
		const sql = `UPDATE notes SET highlighted_text = "${modifiedText}" WHERE id=${id}`
		return await this.db.get(sql)
	}

	async deleteNote(id) {
		const sql = `DELETE FROM notets WHERE id=${id}`
	}

	async close() {
		await this.db.close()
	}
}

export default Notes
