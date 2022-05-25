# Design

A possibility for this app is to...
1. Automatically and frequently fetch new data about the fuel prices, using `GitHub` continuous integration (i.e. *Actions*)
2. Create a web front-end in the same project that will read this data and show it (diagrams, research...), hosted using [GitHub pages](https://pages.github.com/)

## GitHub hosted website

Main processes of the app would be:

- **Fetch up-to-data data about fuel prices**
  - This involves tools to get data from https://www.prix-carburants.gouv.fr/rubrique/opendata and parsing it 
- **Save data about fuel prices**
  - This involves a storage system. It can results in casual files or in a database for example
- **Build the web front-end**
  - This involves a whole software development process: branches, issues, tests, continuous integration, deployment...
- **Access the data**
  - This involves and API usable by the web front-end serving the data stored. It may be the GitHub API itself.
