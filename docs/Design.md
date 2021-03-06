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
Coupled with `GitHub` [scheduled](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule) continuous integration, it can frequently update the data

To **save data about fuel prices**, one can use files stored inside a GitHub repository. Actually, the idea would by to use the same repository to store the data.

This implies making automatic commits to the repository during the continuous integration. It can be done using `GitHub REST API`, as explained [here](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents).
However, this also implies avoiding to run continuous integration workflows due to the change of the data files. Indeed, if the automatic commit results in a workflow involving an automatic commit, we'll be in an infinite loop. To avoid that, using a custom branch named `data` - that would contain a dedicated `./data` directory and never trigger any workflow - may be a better solution.

To **access the data**, one can take advantage of `GitHub REST API` once again, see [here](https://docs.github.com/en/rest/repos/contents#get-repository-content).

To **build the web front-end**, taking advantage of `GitHub`'s features looks like the best option. The front-end source code may be located in a dedicated directory `./frontend/`. The technology is still to be chosen, following GitHub pages' recommendations and checking existing examples.

### Sum Up

- A branch `data` that contains a directory `./data/` and no continuous integration.
- Automatic (scheduled) workflows updating the data stored using `python` scripts.
- A GitHub-hosted web front-end that uses and displays the data stored.

### Details

#### GitHub API

**Getting a file**

```
GET https://api.github.com/repos/Doreapp/prix-carburants/contents/prixcarburants/fetch.py
```

It works.
It returns a `JSON` containing the file's content as a BASE64-encoded string.

Use query param `ref` to specify the branch.

#### Automatically push to a branch

To automatically (i.e. during a *workflow*) push commits to a branch, one needs:
- To grant `Read and write permissions` to `GITHUB_TOKEN` secret variable in repository's settings (i.e. `https://github.com/Doreapp/<repo>/settings/actions`). See [Github documentation](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#modifying-the-permissions-for-the-github_token).
- To run some special commands. Here is what's working for me (inspired from [electron-data.yml](https://github.com/electron/electronjs.org/blob/master/.github/workflows/electron-data.yml)):

  ```yaml
  git fetch # Update remote
  if test -n "$( git status -s)"; then # Something to push
    echo "machine github.com login $GITHUB_ACTOR password $GITHUB_TOKEN" > ~/.netrc
    chmod 600 ~/.netrc
    git config user.name "$GITHUB_ACTOR"
    git config user.email "<username>@users.noreply.github.com"
    git add ...
    git commit -m "<my custom message>"
    git push
  else
    echo "No data to update"
  fi
  ```

#### Scheduled workflows

```yaml
on:
  schedule:
    - cron:  '30 * * * *'
```

Above script makes the workflow run every hour at 30th minute (i.e. at 00:30, 01:30, etc.)

#### GitHub pages

Works well, see https://doreapp.github.io/prix-carburants/.

### Example [electronjs.org](https://github.com/electron/electronjs.org)

[electronjs.org](https://github.com/electron/electronjs.org) uses [Jekyll](https://jekyllrb.com/) to build its website.
It also uses a [workflow to deploy the code to build on gh-pages branch](https://github.com/electron/electronjs.org/blob/master/.github/workflows/electron-data.yml).

[gh-pages branch](https://github.com/electron/electronjs.org/tree/gh-pages) has some useful documentation about how to develop jekyll apps.