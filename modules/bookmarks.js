
/** @module class Bookmarks */

import sqlite from 'sqlite-async'

/**
 * Bookmarks
 * ES6 module that handles creating and retrieving bookmarks.
 */
class Bookmarks {
	/**
   * Create a bookmark object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	 constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the notes
			const sql = `CREATE TABLE IF NOT EXISTS bookmarks\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, ch_num INTEGER, book_id INTEGER, user_id INTEGER, 
					FOREIGN KEY(book_id) REFERENCES books(id), FOREIGN KEY(user_id) REFERENCES users(id));`
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * add a new bookmark
	 * @param {String} title the name of the book
	 * @param {String} description the ook description
	 * @param {Number} chNums the number of chapters in the book
	 * @returns {Boolean} returns true if the new event has been created
	 */
	async newBookmark(bookID, userID, chNum) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		/* long line is necessary for query, but eslint throws a warning
		 * of a rule violation in that case, so split query string */
		let sql = 'INSERT INTO bookmarks(book_id, user_id, ch_num)'
		sql += ` VALUES("${bookID}", "${userID}", "${chNum}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * gets bookmark for a single book
	 * @returns {Object} returns array of all event objects
	 */
	async getBookmark(userID, bookID) {
		const sql = `SELECT * FROM bookmarks WHERE user_id=${userID} AND book_id=${bookID}`
		const result = await this.db.get(sql)
		return result.ch_num
	}
	
	/**
	 * update bookmark for a single book
	 * @returns {Object} returns array of all event objects
	 */
	 async updateBookmark(userID, bookID, chNum) {
		const sql = `UPDATE bookmarks SET ch_num = ${chNum}
		WHERE user_id=${userID} AND book_id=${bookID}`
		return await this.db.run(sql)
	}

	/**
	 * check if bookmark already exists; update if true or create new if false
	 * @returns {Object} returns array of all event objects
	 */
	 async checkBookmark(userID, bookID, chNum) {
		const sql = `SELECT * FROM bookmarks WHERE user_id=${userID} AND book_id=${bookID}`
		const result = await this.db.get(sql)
		if (result === undefined) {
			await this.newBookmark(bookID, userID, chNum)
		} else {
			await this.updateBookmark(userID, bookID, chNum)
		}
	}

	async close() {
		await this.db.close()
	}
}

export default Bookmarks