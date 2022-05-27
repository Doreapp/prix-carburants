# GitHub pages

Pages for this repository take advantage of GitHub-integrated `Jekyll` build workflow.

## Installation

Follow [this official tutorial](https://jekyllrb.com/docs/)

To see what I've done, at my time being and on my OS, see [installation traces](#installation-traces)


# Traces

## Installation traces

| Name | Value |
| -- | -- |
| Date | The 27th may of 2022 |
| OS | `Ubuntu 20.04.4 LTS` inside `WSL2` of `Windows 11 21H2` |

- 🔍️ https://jekyllrb.com/docs/
- 🔍️ https://jekyllrb.com/docs/installation/#requirements
- 🔍️ https://www.ruby-lang.org/en/downloads/
- ```bash
  $ ruby -v
  ruby 2.7.0p0 (2019-12-25 revision 647ee6f091) [x86_64-linux-gnu]
  ```
  Well, I already have `ruby`.
- `The current stable version is 3.1.2.`. Mine is `2.7.0`, maybe too old.
  Enough according to [jekyll requirements](https://jekyllrb.com/docs/installation/#requirements)
- ```
  $ gem -v
  3.1.2
  ```
  Well, I already have `RubyGems`.
- ```
  $ gcc -v
  gcc version 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.1)
  $ g++ -v
  gcc version 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.1)
  $ make -v
  GNU Make 4.2.1
  ```
- 🔍️ https://jekyllrb.com/docs/
- ```
  $ gem install jekyll bundler
  ERROR:  While executing gem ... (Gem::FilePermissionError)
  You don't have write permissions for the /var/lib/gems/2.7.0 directory.
  $ sudo gem install jekyll bundler
  ERROR:  Error installing jekyll:
    ERROR: Failed to build gem native extension.
  ```
- 🔍️ https://github.com/athityakumar/colorls/issues/398*
- ```
  $ sudo apt install ruby-full
  ...
  $ sudo gem install jekyll bundler
  ```
- ```
  $ jekyll new gh-pages
  Conflict...
  $ rm -rf gh-pages
  $ jekyll new gh-pages
  New jekyll site installed in /home/antoine/small_projects/prix-carburants/gh-pages.
  ```
- ```
  cd gh-pages
  bundle exec jekyll serve
  ```
- 🎉 http://127.0.0.1:4000/



