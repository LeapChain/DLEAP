const { exec } = require("child_process");
const targets = require("./targets.json");

const execAsync = require("util").promisify(exec);

let targetNames = Object.keys(targets).filter((name) => name !== "$schema");

if (process.argv[2] !== "%npm_config_targets%") {
  const passedIn = process.argv[2].split(",");
  targetNames = targetNames.filter((name) => passedIn.includes(name));
}

(async () => {
  for (const targetName of targetNames) {
    const targetData = targets[targetName];

    const runCommand = async (command) => {
      const { stdout, stderr } = await execAsync(command).catch((err) => {
        console.error(err.stderr);
        console.error(
          `Failed to build ${targetName}. There are most likely more errors above.`
        );
        process.exit(1);
      });

      console.log(stdout);
      console.log(stderr);
    };

    console.info(`Building ${targetName}...`);

    process.chdir(targetData.location);

    if (targetData.setup !== undefined) {
      console.info("Running custom setup command...");
      await runCommand(targetData.setup);
    }

    console.info("Running custom build command...");
    await runCommand(targetData.build);

    process.chdir("..");

    console.info(`Finished building ${targetName}!`);
  }
})();
