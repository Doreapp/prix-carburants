# Design

A possibility for this app is to...
1. Automatically and frequently fetch new data about the fuel prices, using `GitHub` continuous integration (i.e. *Actions*)
2. Create a web front-end in the same project that will read this data and show it (diagrams, research...), hosted using [GitHub pages](https://pages.github.com/)

## GitHub hosted website

### Needed processes

Main processes of the app would be:

- **Fetch up-to-date data about fuel prices**
  - This involves tools to get data from https://www.prix-carburants.gouv.fr/rubrique/opendata and parsing it 
- **Save data about fuel prices**
  - This involves a storage system. It can results in casual files or in a database for example
- **Build the web front-end**
  - This involves a whole software development process: branches, issues, tests, continuous integration, deployment...
- **Access the data**
  - This involves and API usable by the web front-end serving the data stored. It may be the GitHub API itself.

### Some solutions

To **fetch up-to-date data about fuel prices**, one can use a `python` script, that would fetch the correct data.
Coupled with `GitHub` [scheduled](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) continuous integration, it can frequently update of the data

To **save data about fuel prices**, one can use files stored inside a GitHub repository. Actually, the idea would by to use the same repository to store the data, resulting in a file structure like the following.

```
repository
│   README.md    
└───data_fetcher
│   │   __main__.py
│   │   __init__.py
└───data
│   │   2022-05-25.json
│   │   2022-05-24.json
│   │   2022-metrics.json
```

This implies making automatic commits to the repository during the continuous integration. It can be done using `GitHub REST API`, as explained [here](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents). 
However, this also implies avoiding to run continuous integration workflows due to the change of the data files. Indeed, if the automatic commit results in a workflow involving an automatic commit, we'll be in an infinite loop. GitHub offers the possibility to exclude some path in workflow's triggers, as explained [here](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#example-excluding-paths). Excluding `./data/*` path would then allow this way of working.

However, making automatic commits in `master` branch may pollute the history of the repository... Therefore, using a custom branch named `data` that would contain the `./data` directory and never trigger any workflow may be a better solution. 

To **access the data**, one can take advantage of `GitHub REST API` once again, see [here](https://docs.github.com/en/rest/repos/contents#get-repository-content).

To **build the web front-end**, taking advantage of `GitHub`'s features looks like the best option. The front-end source code may be located in a dedicated directory `./frontend/`. The technology is still to be chosen, following GitHub pages' recommendations and checking existing examples. 

### Sum Up

- A branch `data` that contains a directory `./data/` and no continuous integration.
- Automatic (scheduled) workflows updating the data stored using `python` scripts.
- A GitHub-hosted web front-end that uses and displays the data stored. 