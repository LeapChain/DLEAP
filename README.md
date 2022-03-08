# DTNB
TheNewBoston Blockchain Library Suite to connect to the blockchain from many languages.

Join us on discord: https://discord.gg/Hdv9aXhvJz

## Project Layout

The project is setup in a monorepo format.  That is, we have different subfolders which contain the libraries for the various languages and frameworks.  The number of libraries that we support may seem daunting for newcomers, but contributing is a smooth process as you only need to ensure that you run the tests for the certain library subfolder that you are working on.  Therefore, you don't need to install a ton of tooling for C++ and C# to just contribute to the JavaScript library.

We take care of this process via a custom build system.  A modern version of Node.js is required to run this build system.  The system simply consists of a private NPM package in the root of the repository with a `test` and `build` scripts which you can pass in custom comma-spearated targets.  To get used to how this build system works, let's run through scenario:

You are fixing a bug in the `rust/` subfolder library.  You have changed the code and added a new test to ensure that the bug does not develop again.  To run the tests for the  Rust library, you can run the following command in the root of the TNDB repository:

```sh
npm run test --targets=rust
```

After that, you should see the logging information after Rust runs through all of the tests.  If there was an error, then it should exit through the tests and show it to you.

Now that you have ensured that all of the tests are passing, you send a pull request to the DTNB repository.  We have a custom GitHub Actions setup which will run the tests for the libraries that you have changed in your PR and check if the code works on various versions of the language and on different operating systems.  When the GitHub Actions (hopefully) pass, we can review your code and pull it into the DTNB repository.
