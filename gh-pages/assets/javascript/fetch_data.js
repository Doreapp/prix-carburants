/**
 * Tools for data fetching
 */

(() => {
    /**
     * Fetch of data about french fuel prices
     */
    class DataFetcher {

        constructor() {
        }

        /**
         * Execute a GET HTTP request to given url
         * @param {string} url
         * @returns {Promise<XMLHttpRequest>} with HTTP request as parameter
         */
        get(url) {
            console.log("GET to", url)
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.onreadystatechange = (_) => {
                    if (request.readyState == 4) {
                        if (request.status === 200) {
                            resolve(request)
                        } else {
                            reject(request)
                        }
                    }
                }
                request.open("GET", url);
                request.send();
            })
        }



        /**
         * Get a single file from a specific branch of the repostory
         * @param {*} pathToFile
         */
        getFile(pathToFile, ref = "main") {
            let url = "https://raw.githubusercontent.com/Doreapp/prix-carburants/" + ref + "/" + pathToFile
            return this.get(url)
        }

        getData() {
            return this.getFile("data/20220526.json", "data")
        }
    }
    window["DataFetcher"] = DataFetcher
})()
