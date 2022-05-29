/**
 * Tools for data fetching
 */

/**
 * Fetch of data about french fuel prices
 */
export class DataFetcher {
    /**
     * Execute a GET HTTP request to given url
     * @param {string} url URL to send a GET request to
     * @returns {Promise<XMLHttpRequest>}
     */
    get(url) {
        console.debug("GET to", url)
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest()
            request.onreadystatechange = () => {
                if (request.readyState == 4) {
                    if (request.status === 200) {
                        resolve(request)
                    } else {
                        reject(request)
                    }
                }
            }
            request.open("GET", url)
            request.send()
        })
    }



    /**
     * Get a single file from a specific branch of the repostory
     * @param {string} pathToFile path to the file to fetch in the repo. e.g. README.md.
     * @returns {Promise<XMLHttpRequest>}
     */
    getFile(pathToFile, ref = "main") {
        let url = "https://raw.githubusercontent.com/Doreapp/prix-carburants/" + ref + "/" + pathToFile
        return this.get(url)
    }

    /**
     * Get sample data from the repository
     * @returns {Promise}
     */
    getData() {
        return new Promise(
            (resolve, reject) => {
                this.getFile("data/20220526.json", "data")
                    .then(request => {
                        resolve(JSON.parse(request.responseText))
                    })
                    .catch(err => reject(err))
            })
    }
}
